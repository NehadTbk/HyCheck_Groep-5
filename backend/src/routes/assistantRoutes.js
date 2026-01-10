import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, async (req, res) => {
    if (req.user.role !== "assistant") {
        return res.sendStatus(403).json({ message: "Forbidden" });
    }

    const assistantId = req.user.id;
    const date = req.query.date;
    if (!assistantId || !date) {
        return res.status(400).json({ message: "Missing assistant_id or date" });
    }

    try {
        const [rows] = await db.query(`
  SELECT
                b.box_id AS id,
                b.name AS name,
                COUNT(DISTINCT stg.group_id) AS tasksCount,
                GROUP_CONCAT(DISTINCT tt.name) AS types,
                GROUP_CONCAT(DISTINCT tt.category) AS tags,
                CASE 
                    WHEN SUM(cts.completed) = COUNT(DISTINCT stg.group_id) THEN 'voltooid'
                    ELSE 'openstaand'
                END AS status,
                CONCAT(d.first_name, ' ', d.last_name) AS dentist
            FROM shift_assignments a
            JOIN shift s ON s.shift_id = a.shift_id
            JOIN box b ON b.box_id = a.box_id
            JOIN users d ON d.user_id = a.dentist_user_id
            LEFT JOIN shift_task_groups stg ON stg.assignment_id = a.assignment_id
            LEFT JOIN task_schedules ts ON ts.box_id = b.box_id
            LEFT JOIN task_type tt ON tt.task_type_id = ts.task_type_id
            LEFT JOIN cleaning_session cs ON cs.assignment_id = a.assignment_id
            LEFT JOIN cleaning_task_status cts 
                ON cts.session_id = cs.session_id 
                AND (cts.task_type_id = ts.task_type_id OR ts.task_type_id IS NULL)
            WHERE a.user_id = ? 
              AND s.shift_date = ?
            GROUP BY b.box_id, d.first_name, d.last_name, b.name
            ORDER BY b.name
    `, [assistantId, date]);

        const boxes = rows.map(row => ({
            ...row,
            types: row.types ? row.types.split(",") : [],
            status: row.tags ? row.tags.split(",") : []
        }));

        res.json(boxes);
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/boxes/:boxId/tasks", authMiddleware, async (req, res) => {
    const assistantId = req.user.id;
    const { boxId } = req.params;
    const date = req.query.date;

    if (!boxId || !date) {
        return res.status(400).json({ message: "Missing boxId or date" });
    }

    try {
        const [tasks] = await db.query(`
  SELECT
    b.box_id AS id,
    b.name AS name,
    COUNT(DISTINCT stg.group_id) AS tasksCount,
    GROUP_CONCAT(DISTINCT tt.name) AS types,
    MAX(cts.completed) AS completed,
    CONCAT(d.first_name, ' ', d.last_name) AS dentist,
    a.user_id AS assistantId
  FROM shift_assignments a
  JOIN shift s ON s.shift_id = a.shift_id
  JOIN box b ON b.box_id = a.box_id
  JOIN users d ON d.user_id = a.dentist_user_id
  LEFT JOIN shift_task_groups stg ON stg.assignment_id = a.assignment_id
  LEFT JOIN task_schedules ts ON ts.box_id = b.box_id
  LEFT JOIN task_type tt ON tt.task_type_id = ts.task_type_id
  LEFT JOIN cleaning_session cs ON cs.assignment_id = a.assignment_id
  LEFT JOIN cleaning_task_status cts 
    ON cts.session_id = cs.session_id 
    AND (cts.task_type_id = ts.task_type_id OR ts.task_type_id IS NULL)
  WHERE s.shift_date = ?
  GROUP BY b.box_id, d.first_name, d.last_name, b.name, a.user_id
  ORDER BY b.name;
        `, [assistantId, date, boxId]);

        res.json(tasks);
    } catch (err) {
        console.error("Error fetching box tasks:", err.sqlMessage || err.message, err);
        res.status(500).json({ message: "Server error fetching tasks" });
    }
});

export default router;
