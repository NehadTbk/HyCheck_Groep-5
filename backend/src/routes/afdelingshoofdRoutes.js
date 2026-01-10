import express from "express";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const MONTH_NAMES_NL = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

function statusFromPercentage(pct) {
  if (pct >= 70) return "ok";
  if (pct >= 50) return "warning";
  return "danger";
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`; // month: 1..12
}

// GET /api/afdelingshoofd/monthly-overview?year=2026&box_id=1&category=morning&requiredOnly=1
router.get("/monthly-overview", authMiddleware, async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

    const boxId = req.query.box_id ? parseInt(req.query.box_id, 10) : null;
    const category = req.query.category || null;
    const requiredOnly = req.query.requiredOnly === "0" ? 0 : 1;

    const startISO = `${year}-01-01`;
    const endISO = `${year}-12-31`;

    const where = [`DATE(cs.started_at) BETWEEN ? AND ?`];
    const params = [startISO, endISO];

    if (requiredOnly) where.push(`tt.is_required = 1`);
    if (category) {
      where.push(`tt.category = ?`);
      params.push(category);
    }
    if (boxId) {
      where.push(`sa.box_id = ?`);
      params.push(boxId);
    }

    const query = `
      SELECT
        YEAR(cs.started_at) AS year,
        MONTH(cs.started_at) AS month,
        COUNT(*) AS total,
        SUM(CASE WHEN cts.completed = 1 THEN 1 ELSE 0 END) AS done
      FROM cleaning_task_status cts
      INNER JOIN cleaning_session cs ON cs.session_id = cts.session_id
      INNER JOIN task_type tt ON tt.task_type_id = cts.task_type_id
      INNER JOIN shift_assignments sa ON sa.assignment_id = cs.assignment_id
      WHERE ${where.join(" AND ")}
      GROUP BY YEAR(cs.started_at), MONTH(cs.started_at)
      ORDER BY YEAR(cs.started_at), MONTH(cs.started_at);
    `;

    const [rows] = await db.query(query, params);

    const byMonth = new Map();
    for (const r of rows) {
      byMonth.set(Number(r.month), {
        total: Number(r.total) || 0,
        done: Number(r.done) || 0,
      });
    }

    // ✅ Always return Jan..Dec (12 items)
    const out = [];
    for (let m = 1; m <= 12; m++) {
      const rec = byMonth.get(m) || { total: 0, done: 0 };
      const pct = rec.total > 0 ? Math.round((rec.done / rec.total) * 100) : 0;

      out.push({
        month: MONTH_NAMES_NL[m - 1],
        percentage: pct,
        status: statusFromPercentage(pct),
        meta: {
          year,
          month: m,
          total: rec.total,
          done: rec.done,
          requiredOnly: !!requiredOnly,
          category: category || null,
          box_id: boxId || null,
        },
      });
    }

    res.json(out);
  } catch (err) {
    console.error("Monthly overview error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;