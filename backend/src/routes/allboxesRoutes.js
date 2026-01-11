import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

// 1. De mapping configureren
const GROUP_TO_DB_CATEGORY = {
  ochtend: "morning",
  avond: "evening",
  wekelijks: "weekly",
  maandelijks: "monthly",
};

// 2. De helper functies (MOETEN in dit bestand staan of geïmporteerd worden)
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

// 3. De Route
router.get("/all-boxes", authMiddleware, async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ message: "Missing date" });

  try {
    const [rows] = await db.query(`
      SELECT 
        sa.assignment_id, b.box_id, b.name AS box_name, 
        CONCAT(d.first_name, ' ', d.last_name) AS dentist_name,
        s.shift_date,
        GROUP_CONCAT(DISTINCT stg.group_type ORDER BY stg.group_type) AS group_types
      FROM shift_assignments sa
      INNER JOIN shift s ON s.shift_id = sa.shift_id
      INNER JOIN box b ON b.box_id = sa.box_id
      LEFT JOIN users d ON d.user_id = sa.dentist_user_id
      LEFT JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
      WHERE s.shift_date = ?
      GROUP BY sa.assignment_id
      ORDER BY b.name ASC
    `, [date]);

    const output = [];
    for (const r of rows) {
      const assignmentId = Number(r.assignment_id);
      const isoDate = String(date).split(' ')[0];

      // Tags verwerken
      const rawGroups = (r.group_types || "").split(",").map(g => g.trim().toLowerCase()).filter(Boolean);
      const displayTags = rawGroups.map(g => g.charAt(0).toUpperCase() + g.slice(1));
      const dbCategories = rawGroups.map(g => GROUP_TO_DB_CATEGORY[g]).filter(Boolean);

      // Sessie en taken initialiseren
      const sessionId = await getOrCreateSession(assignmentId, isoDate);
      if (dbCategories.length > 0) {
        await ensureTaskStatuses(sessionId, dbCategories);
      }

      // Voortgang berekenen
      const { total, done } = await recomputeAndMaybeCompleteSession(sessionId);

      output.push({
        id: assignmentId,
        boxId: r.box_id,
        name: r.box_name,
        dentist: r.dentist_name || "Geen arts",
        tasksCount: total,
        doneCount: done,
        status: (total > 0 && done === total) ? "voltooid" : (done > 0 ? "gedeeltelijk" : "openstaand"),
        types: displayTags
      });
    }

    res.json(output);
  } catch (err) {
    console.error("All boxes error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;