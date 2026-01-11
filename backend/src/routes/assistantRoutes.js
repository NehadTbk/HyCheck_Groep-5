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

// --- Helper Functions ---

async function getOrCreateSession(assignmentId, isoDate) {
  const [existing] = await db.query(
    `SELECT session_id FROM cleaning_session 
     WHERE assignment_id = ? AND DATE(started_at) = ? 
     ORDER BY session_id DESC LIMIT 1`,
    [assignmentId, isoDate]
  );

  if (existing.length) return existing[0].session_id;

  const [ins] = await db.query(
    `INSERT INTO cleaning_session (assignment_id, started_at, status) VALUES (?, NOW(), 'in_progress')`,
    [assignmentId]
  );
  return ins.insertId;
}

async function ensureTaskStatuses(sessionId, categories) {
  if (!Array.isArray(categories) || categories.length === 0) return;

  const [taskTypes] = await db.query(
    `SELECT task_type_id FROM task_type WHERE is_required = 1 AND category IN (?)`,
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

  const values = toInsert.map((id) => [sessionId, id, 0, null, null, null]);
  await db.query(
    `INSERT INTO cleaning_task_status (session_id, task_type_id, completed, completed_at, selected_comment_option_id, custom_comment) VALUES ?`,
    [values]
  );
}

async function recomputeAndMaybeCompleteSession(sessionId) {
  const [[counts]] = await db.query(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS done 
     FROM cleaning_task_status WHERE session_id = ?`,
    [sessionId]
  );

  const total = Number(counts?.total) || 0;
  const done = Number(counts?.done) || 0;

  const isComplete = total > 0 && done === total;
  await db.query(
    `UPDATE cleaning_session SET status = ?, completed_at = ? WHERE session_id = ?`,
    [isComplete ? 'completed' : 'in_progress', isComplete ? new Date() : null, sessionId]
  );

  return { total, done };
}

// --- Routes ---

/**
 * GET /api/assistant/today-assignments
 * Returns current assistant's assignments for today + progress.
 */
router.get("/today-assignments", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const [rows] = await db.query(
      `SELECT sa.assignment_id, b.box_id, b.name AS box_name, 
              CONCAT(d.first_name, ' ', d.last_name) AS dentist_name,
              s.shift_date, sa.assignment_start, sa.assignment_end,
              GROUP_CONCAT(DISTINCT stg.group_type ORDER BY stg.group_type) AS group_types
       FROM shift_assignments sa
       INNER JOIN shift s ON s.shift_id = sa.shift_id
       INNER JOIN box b ON b.box_id = sa.box_id
       LEFT JOIN users d ON d.user_id = sa.dentist_user_id
       LEFT JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
       WHERE sa.user_id = ? AND s.shift_date = CURDATE()
       GROUP BY sa.assignment_id
       ORDER BY sa.assignment_start ASC`,
      [userId]
    );

    const out = [];
    for (const r of rows) {
      const assignmentId = Number(r.assignment_id);
      const isoDate = String(r.shift_date);
      const groups = (r.group_types || "").split(",").map(x => x.trim()).filter(Boolean);
      const categories = [...new Set(groups.map(g => GROUP_TO_CATEGORY[g]).filter(Boolean))];

      const sessionId = await getOrCreateSession(assignmentId, isoDate);
      await ensureTaskStatuses(sessionId, categories);
      const { total, done } = await recomputeAndMaybeCompleteSession(sessionId);

      out.push({
        id: assignmentId,
        boxId: Number(r.box_id),
        name: r.box_name,
        dentist: r.dentist_name || "-",
        tasksCount: total,
        doneCount: done,
        status: (total > 0 && done === total) ? "voltooid" : "openstaand",
        types: groups.map(g => g.charAt(0).toUpperCase() + g.slice(1)), // Capitalize
      });
    }
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/assistant/tasks/toggle
 */
router.post("/tasks/toggle", authMiddleware, async (req, res) => {
  try {
    const { assignment_id: assignmentId, task_type_id: taskTypeId, completed: isTaskDone } = req.body;
    const completed = isTaskDone ? 1 : 0;

    const [check] = await db.query(
      `SELECT sa.assignment_id, s.shift_date FROM shift_assignments sa
       INNER JOIN shift s ON s.shift_id = sa.shift_id
       WHERE sa.assignment_id = ? AND sa.user_id = ? LIMIT 1`,
      [assignmentId, req.user.id]
    );

    if (!check.length) return res.status(404).json({ message: "Assignment not found" });

    const sessionId = await getOrCreateSession(assignmentId, String(check[0].shift_date));
    
    await db.query(
      `UPDATE cleaning_task_status SET completed = ?, completed_at = ?
       WHERE session_id = ? AND task_type_id = ?`,
      [completed, completed ? new Date() : null, sessionId, taskTypeId]
    );

    const counts = await recomputeAndMaybeCompleteSession(sessionId);
    res.json({ ok: true, ...counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/assistant/upcoming-periodic
 * Returns the next upcoming wekelijks and maandelijks assignments for the current user.
 */
router.get("/upcoming-periodic", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get next upcoming wekelijks assignment
    const [weeklyRows] = await db.query(
      `SELECT sa.assignment_id, b.name AS box_name, s.shift_date,
              sa.assignment_start, sa.assignment_end
       FROM shift_assignments sa
       INNER JOIN shift s ON s.shift_id = sa.shift_id
       INNER JOIN box b ON b.box_id = sa.box_id
       INNER JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
       WHERE sa.user_id = ?
         AND s.shift_date >= CURDATE()
         AND stg.group_type = 'wekelijks'
       ORDER BY s.shift_date ASC, sa.assignment_start ASC
       LIMIT 1`,
      [userId]
    );

    // Get next upcoming maandelijks assignment
    const [monthlyRows] = await db.query(
      `SELECT sa.assignment_id, b.name AS box_name, s.shift_date,
              sa.assignment_start, sa.assignment_end
       FROM shift_assignments sa
       INNER JOIN shift s ON s.shift_id = sa.shift_id
       INNER JOIN box b ON b.box_id = sa.box_id
       INNER JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
       WHERE sa.user_id = ?
         AND s.shift_date >= CURDATE()
         AND stg.group_type = 'maandelijks'
       ORDER BY s.shift_date ASC, sa.assignment_start ASC
       LIMIT 1`,
      [userId]
    );

    const formatDate = (dateObj) => {
      if (!dateObj) return null;
      const date = new Date(dateObj);
      const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
      const dayName = days[date.getDay()];
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${dayName} ${day}/${month}`;
    };

    res.json({
      weekly: weeklyRows.length > 0 ? {
        date: formatDate(weeklyRows[0].shift_date),
        boxName: weeklyRows[0].box_name,
      } : null,
      monthly: monthlyRows.length > 0 ? {
        date: formatDate(monthlyRows[0].shift_date),
        boxName: monthlyRows[0].box_name,
      } : null,
    });
  } catch (err) {
    console.error("GET upcoming-periodic error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;