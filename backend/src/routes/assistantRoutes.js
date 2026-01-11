import express from "express";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const GROUP_TO_DB_CATEGORY = {
  ochtend: "morning",
  avond: "evening",
  wekelijks: "weekly",
  maandelijks: "monthly",
};



// --- Helper functies ---
async function getOrCreateSession(assignmentId, isoDate) {
  const [existing] = await db.query(
    `SELECT session_id FROM cleaning_session
     WHERE assignment_id = ? AND DATE(started_at) = ?
     ORDER BY session_id DESC LIMIT 1`,
    [assignmentId, isoDate]
  );

  if (existing.length) return existing[0].session_id;

  // Use the passed date instead of NOW() to ensure consistency
  const [ins] = await db.query(
    `INSERT INTO cleaning_session (assignment_id, started_at, status) VALUES (?, ?, 'in_progress')`,
    [assignmentId, isoDate]
  );
  return ins.insertId;
}

async function ensureTaskStatuses(sessionId, categories) {
  if (!Array.isArray(categories) || categories.length === 0) return;

  const [taskTypes] = await db.query(
    `SELECT task_type_id, category FROM task_type WHERE is_required = 1 AND category IN (?)`,
    [categories]
  );

  const neededIds = taskTypes.map(t => Number(t.task_type_id)).filter(Boolean);
  if (!neededIds.length) return;

  const [existing] = await db.query(
    `SELECT task_type_id FROM cleaning_task_status WHERE session_id = ?`,
    [sessionId]
  );
  const existingSet = new Set(existing.map(r => Number(r.task_type_id)));

  const toInsert = neededIds.filter(id => !existingSet.has(id));
  if (!toInsert.length) return;

  const values = toInsert.map(id => [sessionId, id, 0, null, null, null]);
  await db.query(
    `INSERT INTO cleaning_task_status 
     (session_id, task_type_id, completed, completed_at, selected_comment_option_id, custom_comment) 
     VALUES ?`,
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

// --- Verbeterde Route in je backend controller ---
router.get("/today-assignments", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({ message: "date query param is required" });
    }

    const [rows] = await db.query(
      `
      SELECT sa.assignment_id, b.box_id, b.name AS box_name,
             CONCAT(d.first_name, ' ', d.last_name) AS dentist_name,
             s.shift_date,
             GROUP_CONCAT(DISTINCT stg.group_type ORDER BY stg.group_type) AS group_types
      FROM shift_assignments sa
      INNER JOIN shift s ON s.shift_id = sa.shift_id
      INNER JOIN box b ON b.box_id = sa.box_id
      LEFT JOIN users d ON d.user_id = sa.dentist_user_id
      LEFT JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
      WHERE sa.user_id = ?
        AND s.shift_date = ?
      GROUP BY sa.assignment_id
      ORDER BY sa.assignment_start ASC
      `,
      [userId, date]
    );

    const output = [];
    for (const r of rows) {
      const assignmentId = Number(r.assignment_id);
      const boxId = Number(r.box_id);

      // Format date without timezone conversion issues
      let isoDate;
      if (r.shift_date instanceof Date) {
        const year = r.shift_date.getFullYear();
        const month = String(r.shift_date.getMonth() + 1).padStart(2, '0');
        const day = String(r.shift_date.getDate()).padStart(2, '0');
        isoDate = `${year}-${month}-${day}`;
      } else {
        isoDate = String(r.shift_date).split(' ')[0].split('T')[0];
      }

      const rawGroups = (r.group_types || "").split(",").map(g => g.trim().toLowerCase()).filter(Boolean);
      const dbCategories = rawGroups.map(g => GROUP_TO_DB_CATEGORY[g]).filter(Boolean);
      const displayCategories = rawGroups.map(g => g.charAt(0).toUpperCase() + g.slice(1));

      const sessionId = await getOrCreateSession(assignmentId, isoDate);

      if (dbCategories.length > 0) {
        await ensureTaskStatuses(sessionId, dbCategories);
      }

      const { total, done } = await recomputeAndMaybeCompleteSession(sessionId);

      let finalTaskCount = total;
      if (total === 0) {
        const [[schCount]] = await db.query(
          `SELECT COUNT(*) as count FROM task_schedules WHERE box_id = ?`, [boxId]
        );
        finalTaskCount = schCount.count;
      }

      const status = (finalTaskCount > 0 && done === finalTaskCount) ? "voltooid" : (done > 0 ? "gedeeltelijk" : "openstaand");

      output.push({
        id: assignmentId,
        boxId: boxId,
        name: r.box_name,
        dentist: r.dentist_name || "Geen arts",
        tasksCount: finalTaskCount,
        doneCount: done,
        status: status,
        types: displayCategories,
      });
    }

    res.json(output);
  } catch (err) {
    console.error("Error fetching today-assignments:", err);
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

