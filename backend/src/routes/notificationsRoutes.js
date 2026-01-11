import express from "express";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// shift_task_groups.group_type -> task_type.category
const GROUP_TO_CATEGORY = {
  ochtend: "morning",
  avond: "evening",
  wekelijks: "weekly",
  maandelijks: "monthly",
};

function parseGroupTypes(groupTypesStr) {
  return String(groupTypesStr || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function mapType(dbType) {
  // DB enum: 'task due','task missing','report ready','shift assigned'
  if (!dbType) return "info";
  const t = String(dbType).toLowerCase();

  if (t.includes("missing")) return "error";
  if (t.includes("due")) return "warning";
  if (t.includes("report")) return "info";
  if (t.includes("shift")) return "info";
  return "info";
}

/**
 * Creates (once per day) a notification when an assignment's box isn't fully completed
 * after the assignment end time has passed.
 *
 * - Notifies the assigned assistant (sa.user_id)
 * - Also notifies all 'responsible' + 'admin' users
 *
 * IMPORTANT:
 * - We do this on-demand when someone fetches /api/notifications
 *   so you don't need a cron/background job.
 */
async function generateMissingBoxNotificationsForToday() {
  const [rows] = await db.query(
    `
    SELECT
      sa.assignment_id,
      sa.user_id AS assistant_user_id,
      sa.box_id,
      b.name AS box_name,
      s.shift_date,
      sa.assignment_end,
      GROUP_CONCAT(DISTINCT stg.group_type ORDER BY stg.group_type) AS group_types,
      cs.session_id,
      SUM(CASE WHEN cts.completed = 1 THEN 1 ELSE 0 END) AS done_count
    FROM shift_assignments sa
    INNER JOIN shift s ON s.shift_id = sa.shift_id
    INNER JOIN box b ON b.box_id = sa.box_id
    LEFT JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
    LEFT JOIN cleaning_session cs
      ON cs.assignment_id = sa.assignment_id
      AND DATE(cs.started_at) = s.shift_date
    LEFT JOIN cleaning_task_status cts ON cts.session_id = cs.session_id
    WHERE s.shift_date = CURDATE()
    GROUP BY sa.assignment_id
    `
  );

  if (!rows.length) return;

  // Cache required task counts per category-set (e.g. "morning|evening")
  const requiredCountCache = new Map();

  async function getRequiredCount(categories) {
    const cats = (categories || []).slice().sort();
    const key = cats.join("|");
    if (requiredCountCache.has(key)) return requiredCountCache.get(key);

    if (!cats.length) {
      requiredCountCache.set(key, 0);
      return 0;
    }

    const [[r]] = await db.query(
      `SELECT COUNT(*) AS cnt FROM task_type WHERE is_required = 1 AND category IN (?)`,
      [cats]
    );
    const cnt = Number(r?.cnt) || 0;
    requiredCountCache.set(key, cnt);
    return cnt;
  }

  // Notify all supervisors (responsible/admin)
  const [supervisors] = await db.query(
    `SELECT user_id FROM users WHERE role IN ('responsible','admin') AND is_active = 1`
  );
  const supervisorIds = supervisors.map((u) => Number(u.user_id)).filter(Boolean);

  for (const r of rows) {
    const assignmentId = Number(r.assignment_id);
    const assistantId = Number(r.assistant_user_id);

    const groups = parseGroupTypes(r.group_types);
    const categories = [...new Set(groups.map((g) => GROUP_TO_CATEGORY[g]).filter(Boolean))];

    const totalRequired = await getRequiredCount(categories);
    const done = Number(r.done_count) || 0;

    // No required tasks => ignore
    if (totalRequired <= 0) continue;

    // Only after assignment end time has passed (same day)
    const [[timeCheck]] = await db.query(
      `SELECT (NOW() > TIMESTAMP(CURDATE(), ?)) AS past_end`,
      [r.assignment_end]
    );
    const pastEnd = Number(timeCheck?.past_end) === 1;
    if (!pastEnd) continue;

    // Completed? then no notification
    if (done >= totalRequired) continue;

    const recipients = new Set([assistantId, ...supervisorIds].filter(Boolean));

    const titleKey = "notifications.db.missingBoxTitle";
    const messageData = JSON.stringify({
      boxName: r.box_name,
      groupLabel: groups.length ? groups.join(", ") : "tasks"
    });

    const renderNotificationMessage = (notif) => {
  try {
    const params = JSON.parse(notif.message);
    
    return {
      displayTitle: t(notif.title, params),
      displayBody: t("notifications.db.missingBoxMessage", params)
    };
  } catch (e) {
    return {
      displayTitle: notif.title,
      displayBody: notif.message
    };
  }
};

    for (const userId of recipients) {
      // Avoid duplicates (same user + assignment + today)
      const [existing] = await db.query(
        `
        SELECT 1
        FROM notifications
        WHERE user_id = ?
          AND type = 'task missing'
          AND related_type = 'assignment'
          AND related_id = ?
          AND DATE(created_at) = CURDATE()
        LIMIT 1
        `,
        [userId, assignmentId]
      );

      if (existing.length) continue;

      await db.query(
        `
    INSERT INTO notifications (user_id, title, message, type, related_id, related_type, is_read)
    VALUES (?, ?, ?, 'task missing', ?, 'assignment', 0)
    `,
        [userId, titleKey, messageData, assignmentId]
      );
    }
  }
}

// GET /api/notifications?limit=20
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Create today's "missing box" notifications before returning the list.
    await generateMissingBoxNotificationsForToday();

    const limit = Math.max(1, Math.min(parseInt(req.query.limit || "20", 10), 100));
    const userId = req.user.id; // ✅ FIX: authMiddleware uses req.user.id

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
      type: mapType(r.type), // success/warning/error/info for the modal
      read: !!r.is_read,
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
    const userId = req.user.id; // ✅ FIX

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
    const userId = req.user.id; // ✅ FIX
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
