import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

router.get("/all-boxes", authMiddleware, async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ message: "Missing date" });

  try {
    const [rows] = await db.query(`
      SELECT
        b.box_id AS id,
        b.name AS name,
        COUNT(DISTINCT stg.group_id) AS tasksCount,
        GROUP_CONCAT(DISTINCT tt.name) AS types,
        SUM(cts.completed) AS completedCount,
        CONCAT(d.first_name, ' ', d.last_name) AS dentist
      FROM box b
      LEFT JOIN shift_assignments a ON a.box_id = b.box_id
      LEFT JOIN shift s ON s.shift_id = a.shift_id AND s.shift_date = ?
      LEFT JOIN shift_task_groups stg ON stg.assignment_id = a.assignment_id
      LEFT JOIN task_schedules ts ON ts.box_id = b.box_id
      LEFT JOIN task_type tt ON tt.task_type_id = ts.task_type_id
      LEFT JOIN users d ON d.user_id = a.dentist_user_id
      LEFT JOIN cleaning_session cs ON cs.assignment_id = a.assignment_id
      LEFT JOIN cleaning_task_status cts ON cts.session_id = cs.session_id
      GROUP BY b.box_id, b.name, d.first_name, d.last_name
      HAVING tasksCount > 0
      ORDER BY b.name
    `, [date]);

    const boxes = rows.map(row => ({
      ...row,
      types: Array.isArray(row.types) ? row.types : row.types?.split(",") || [],
      status: row.tasksCount > 0
        ? row.completedCount === row.tasksCount
          ? "voltooid"
          : row.completedCount > 0
            ? "gedeeltelijk"
            : "openstaand"
        : "openstaand",
    }));

    console.log("All boxes fetched:", boxes.length, "boxes");
    res.json(boxes);

  } catch (err) {
    console.error("All boxes error:", err);
    res.status(500).json({ message: "Server error fetching all boxes" });
  }
});

export default router;