import express from "express";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Map DB shift_task_groups.group_type -> task_type.category
 */
const GROUP_TO_CATEGORY = {
  ochtend: "morning",
  avond: "evening",
  wekelijks: "weekly",
  maandelijks: "monthly",
};

async function getOrCreateSession(assignmentId, isoDate) {
  // Find existing session for this assignment on this date
  const [existing] = await db.query(
    `
    SELECT session_id
    FROM cleaning_session
    WHERE assignment_id = ?
      AND DATE(started_at) = ?
    ORDER BY session_id DESC
    LIMIT 1
    `,
    [assignmentId, isoDate]
  );

  if (existing.length) return existing[0].session_id;

  const [ins] = await db.query(
    `
    INSERT INTO cleaning_session (assignment_id, started_at, status)
    VALUES (?, NOW(), 'in_progress')
    `,
    [assignmentId]
  );

  return ins.insertId;
}

async function ensureTaskStatuses(sessionId, categories) {
  if (!Array.isArray(categories) || categories.length === 0) return;

  // Required tasks for the categories
  const [taskTypes] = await db.query(
    `
    SELECT task_type_id
    FROM task_type
    WHERE is_required = 1
      AND category IN (?)
    `,
    [categories]
  );

  const neededIds = taskTypes.map((t) => Number(t.task_type_id)).filter(Boolean);
  if (neededIds.length === 0) return;

  const [existing] = await db.query(
    `SELECT task_type_id FROM cleaning_task_status WHERE session_id = ?`,
    [sessionId]
  );
  const existingSet = new Set(existing.map((r) => Number(r.task_type_id)));

  const toInsert = neededIds.filter((id) => !existingSet.has(id));
  if (toInsert.length === 0) return;

  const values = toInsert.map((taskTypeId) => [sessionId, taskTypeId, 0, null, null]);
  // Columns: session_id, task_type_id, completed, completed_at, selected_comment_option_id, custom_comment
  // We keep comment fields NULL; comments are handled by your existing /api/tasks/update route.
  await db.query(
    `
    INSERT INTO cleaning_task_status (session_id, task_type_id, completed, completed_at, selected_comment_option_id, custom_comment)
    VALUES ?
    `,
    [values]
  );
}

async function recomputeAndMaybeCompleteSession(sessionId) {
  const [[counts]] = await db.query(
    `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS done
    FROM cleaning_task_status
    WHERE session_id = ?
    `,
    [sessionId]
  );

  const total = Number(counts?.total) || 0;
  const done = Number(counts?.done) || 0;

  if (total > 0 && done === total) {
    await db.query(
      `
      UPDATE cleaning_session
      SET status = 'completed', completed_at = NOW()
      WHERE session_id = ?
      `,
      [sessionId]
    );
  } else {
    // Keep it in progress if not all done (also clears completed_at if it was set)
    await db.query(
      `
      UPDATE cleaning_session
      SET status = 'in_progress', completed_at = NULL
      WHERE session_id = ?
      `,
      [sessionId]
    );
  }

  return { total, done };
}

/**
 * GET /api/assistant/today-assignments
 * Returns the current assistant's assignments for today (+ progress).
 */
router.get("/today-assignments", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const [rows] = await db.query(
      `
      SELECT
        sa.assignment_id,
        b.box_id,
        b.name AS box_name,
        CONCAT(d.first_name, ' ', d.last_name) AS dentist_name,
        s.shift_date,
        sa.assignment_start,
        sa.assignment_end,
        GROUP_CONCAT(DISTINCT stg.group_type ORDER BY stg.group_type) AS group_types
      FROM shift_assignments sa
      INNER JOIN shift s ON s.shift_id = sa.shift_id
      INNER JOIN box b ON b.box_id = sa.box_id
      LEFT JOIN users d ON d.user_id = sa.dentist_user_id
      LEFT JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
      WHERE sa.user_id = ?
        AND s.shift_date = CURDATE()
      GROUP BY sa.assignment_id
      ORDER BY sa.assignment_start ASC
      `,
      [userId]
    );

    const out = [];
    for (const r of rows) {
      const assignmentId = Number(r.assignment_id);
      const isoDate = String(r.shift_date); // YYYY-MM-DD

      const groups = (r.group_types || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      const categories = [...new Set(groups.map((g) => GROUP_TO_CATEGORY[g]).filter(Boolean))];

      const sessionId = await getOrCreateSession(assignmentId, isoDate);
      await ensureTaskStatuses(sessionId, categories);

      const { total, done } = await recomputeAndMaybeCompleteSession(sessionId);
      const status = total > 0 && done === total ? "voltooid" : "openstaand";

      // UI expects Dutch labels
      const dutchTypes = groups.map((g) => {
        if (g === "ochtend") return "Ochtend";
        if (g === "avond") return "Avond";
        if (g === "wekelijks") return "Wekelijks";
        if (g === "maandelijks") return "Maandelijks";
        return g;
      });

      out.push({
        id: assignmentId,
        assignmentId,
        boxId: Number(r.box_id),
        name: r.box_name,
        dentist: r.dentist_name || "-",
        tasksCount: total,
        doneCount: done,
        status,
        types: dutchTypes,
      });
    }

    res.json(out);
  } catch (err) {
    console.error("today-assignments error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/assistant/assignments/:assignmentId/tasks?date=YYYY-MM-DD
 * Ensures a session exists for that date (defaults to today) and returns all task statuses with task metadata.
 */
router.get("/assignments/:assignmentId/tasks", authMiddleware, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId, 10);
    const isoDate = req.query.date ? String(req.query.date) : new Date().toISOString().slice(0, 10);

    // Security: assignment must belong to current user
    const [check] = await db.query(
      `
      SELECT sa.assignment_id, s.shift_date
      FROM shift_assignments sa
      INNER JOIN shift s ON s.shift_id = sa.shift_id
      WHERE sa.assignment_id = ?
        AND sa.user_id = ?
      LIMIT 1
      `,
      [assignmentId, req.user.id]
    );

    if (!check.length) return res.status(404).json({ message: "Assignment not found" });

    const shiftDate = String(check[0].shift_date);
    // Force date to shift_date if you pass a different date
    const effectiveDate = shiftDate || isoDate;

    const [groupsRows] = await db.query(
      `SELECT group_type FROM shift_task_groups WHERE assignment_id = ?`,
      [assignmentId]
    );
    const groups = groupsRows.map((x) => x.group_type);
    const categories = [...new Set(groups.map((g) => GROUP_TO_CATEGORY[g]).filter(Boolean))];

    const sessionId = await getOrCreateSession(assignmentId, effectiveDate);
    await ensureTaskStatuses(sessionId, categories);

    const [tasks] = await db.query(
      `
      SELECT
        cts.status_id,
        cts.task_type_id,
        cts.completed,
        tt.name,
        tt.category
      FROM cleaning_task_status cts
      INNER JOIN task_type tt ON tt.task_type_id = cts.task_type_id
      WHERE cts.session_id = ?
      ORDER BY
        FIELD(tt.category, 'morning','evening','weekly','monthly'),
        tt.task_type_id ASC
      `,
      [sessionId]
    );

    res.json({
      session_id: sessionId,
      assignment_id: assignmentId,
      date: effectiveDate,
      tasks: tasks.map((t) => ({
        status_id: Number(t.status_id),
        task_type_id: Number(t.task_type_id),
        name: t.name,
        category: t.category,
        completed: Number(t.completed) === 1,
      })),
    });
  } catch (err) {
    console.error("assignment tasks error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/assistant/tasks/toggle
 * Body: { assignment_id, task_type_id, completed }
 * Creates session/status rows as needed, then toggles the task completion.
 */
router.post("/tasks/toggle", authMiddleware, async (req, res) => {
  try {
    const assignmentId = parseInt(req.body.assignment_id, 10);
    const taskTypeId = parseInt(req.body.task_type_id, 10);
    const completed = req.body.completed ? 1 : 0;

    // Security: assignment must belong to current user
    const [check] = await db.query(
      `
      SELECT sa.assignment_id, s.shift_date
      FROM shift_assignments sa
      INNER JOIN shift s ON s.shift_id = sa.shift_id
      WHERE sa.assignment_id = ?
        AND sa.user_id = ?
      LIMIT 1
      `,
      [assignmentId, req.user.id]
    );
    if (!check.length) return res.status(404).json({ message: "Assignment not found" });

    const effectiveDate = String(check[0].shift_date);

    const [groupsRows] = await db.query(
      `SELECT group_type FROM shift_task_groups WHERE assignment_id = ?`,
      [assignmentId]
    );
    const groups = groupsRows.map((x) => x.group_type);
    const categories = [...new Set(groups.map((g) => GROUP_TO_CATEGORY[g]).filter(Boolean))];

    const sessionId = await getOrCreateSession(assignmentId, effectiveDate);
    await ensureTaskStatuses(sessionId, categories);

    // Toggle (status row should exist; but we still guard with update + insert fallback)
    const [upd] = await db.query(
      `
      UPDATE cleaning_task_status
      SET completed = ?, completed_at = CASE WHEN ? = 1 THEN NOW() ELSE NULL END
      WHERE session_id = ? AND task_type_id = ?
      `,
      [completed, completed, sessionId, taskTypeId]
    );

    if (upd.affectedRows === 0) {
      await db.query(
        `
        INSERT INTO cleaning_task_status (session_id, task_type_id, completed, completed_at)
        VALUES (?, ?, ?, CASE WHEN ? = 1 THEN NOW() ELSE NULL END)
        `,
        [sessionId, taskTypeId, completed, completed]
      );
    }

    const counts = await recomputeAndMaybeCompleteSession(sessionId);

    res.json({
      ok: true,
      session_id: sessionId,
      ...counts,
    });
  } catch (err) {
    console.error("toggle task error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
