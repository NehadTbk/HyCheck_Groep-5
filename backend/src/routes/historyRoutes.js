import express from "express";
import pool from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/history
 * Optionele filters:
 *  - from=YYYY-MM-DD
 *  - to=YYYY-MM-DD
 *  - q=zoekterm (box/assistant/dentist)
 *  - boxId=nummer
 *
 * Security:
 *  - assistant: ziet enkel eigen history
 *  - responsible/admin: ziet alles
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { from, to, q, boxId } = req.query;

    const where = [];
    const params = [];

    if (from) {
      where.push("s.shift_date >= ?");
      params.push(from);
    }
    if (to) {
      where.push("s.shift_date <= ?");
      params.push(to);
    }
    if (boxId) {
      where.push("b.box_id = ?");
      params.push(boxId);
    }
    if (q) {
      where.push(
        "(b.name LIKE ? OR CONCAT(ua.first_name,' ',ua.last_name) LIKE ? OR CONCAT(ud.first_name,' ',ud.last_name) LIKE ?)"
      );
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // 🔒 Assistant ziet enkel eigen sessions
    if (req.user.role === "assistant") {
      where.push("sa.user_id = ?");
      params.push(req.user.id);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT
        cs.session_id,
        s.shift_date AS date,
        b.box_id,
        b.name AS box_name,
        cs.status AS session_status,
        cs.started_at,
        cs.completed_at,

        sa.user_id AS assistant_id,
        CONCAT(ua.first_name, ' ', ua.last_name) AS assistant_name,

        sa.dentist_user_id AS dentist_id,
        CONCAT(ud.first_name, ' ', ud.last_name) AS dentist_name,

        COUNT(cts.status_id) AS total_tasks,
        SUM(CASE WHEN cts.completed = 1 THEN 1 ELSE 0 END) AS done_tasks

      FROM cleaning_session cs
      INNER JOIN shift_assignments sa ON sa.assignment_id = cs.assignment_id
      INNER JOIN shift s ON s.shift_id = sa.shift_id
      INNER JOIN box b ON b.box_id = sa.box_id
      LEFT JOIN users ua ON ua.user_id = sa.user_id
      LEFT JOIN users ud ON ud.user_id = sa.dentist_user_id
      LEFT JOIN cleaning_task_status cts ON cts.session_id = cs.session_id

      ${whereSql}

      GROUP BY cs.session_id
      ORDER BY s.shift_date DESC, cs.started_at DESC
      LIMIT 200
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/history error:", err);
    res.status(500).json({ message: "Historiek laden mislukt" });
  }
});

/**
 * GET /api/history/:sessionId
 * Geeft alle taak-statussen voor 1 session (handig voor Details modal)
 */
router.get("/:sessionId", authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 🔒 Assistant: check ownership (veilig)
    if (req.user.role === "assistant") {
      const [own] = await pool.query(
        `
        SELECT 1
        FROM cleaning_session cs
        JOIN shift_assignments sa ON sa.assignment_id = cs.assignment_id
        WHERE cs.session_id = ? AND sa.user_id = ?
        LIMIT 1
        `,
        [sessionId, req.user.id]
      );

      if (own.length === 0) {
        return res.status(403).json({ message: "Geen toegang tot deze historiek." });
      }
    }

    const [rows] = await pool.query(
      `
      SELECT
        cts.status_id,
        cts.task_type_id,
        tt.name AS task_name,
        tt.description AS task_description,
        tt.category AS task_category,
        cts.completed,
        cts.completed_at,
        cts.custom_comment,
        co.common_comment
      FROM cleaning_task_status cts
      LEFT JOIN task_type tt ON tt.task_type_id = cts.task_type_id
      LEFT JOIN comment_option co
        ON co.option_id = cts.selected_comment_option_id
      WHERE cts.session_id = ?
      ORDER BY tt.category, cts.status_id ASC
      `,
      [sessionId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/history/:sessionId error:", err);
    res.status(500).json({ message: "Details laden mislukt" });
  }
});

export default router;
