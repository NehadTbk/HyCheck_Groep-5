import express from "express";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

function mapType(dbType) {
  // DB enum: 'task due','task missing','report ready','shift assigned'
  if (!dbType) return "info";
  const t = dbType.toLowerCase();

  if (t.includes("missing")) return "error";
  if (t.includes("due")) return "warning";
  if (t.includes("report")) return "info";
  if (t.includes("shift")) return "info";
  return "info";
}

// GET /api/notifications?limit=20
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit || "20", 10), 100));
    const userId = req.user.user_id; // make sure your JWT contains user_id

    const [rows] = await db.query(
      `
      SELECT notification_id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?;
      `,
      [userId, limit]
    );

    const out = rows.map((r) => ({
      id: r.notification_id,
      title: r.title,
      message: r.message,
      date: r.created_at,
      type: mapType(r.type),        // success/warning/error/info for your modal
      read: !!r.is_read,            // modal expects "read"
    }));

    res.json(out);
  } catch (err) {
    console.error("GET notifications error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;

    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0;`,
      [userId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH read-all error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const id = parseInt(req.params.id, 10);

    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?;`,
      [id, userId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH read error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
