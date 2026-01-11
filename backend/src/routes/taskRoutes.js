import express from 'express';
import db from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Haal de redenen op 
router.get('/options', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT option_id, common_comment FROM comment_option");
        res.json(rows);
    } catch (error) {
        console.error("Fout bij ophalen comment_option:", error);
        res.status(500).json({ error: error.message });
    }
});
// Map task group names to category names
const GROUP_TO_CATEGORY = {
    ochtend: 'morning',
    avond: 'evening',
    wekelijks: 'weekly',
    maandelijks: 'monthly',
};

// 2. Haal taken op voor de Modal - gebaseerd op assignment task groups
router.get("/boxes/:assignmentId/tasks", authMiddleware, async (req, res) => {
    const { assignmentId } = req.params;
    const date = req.query.date;

    try {
        // 1. Get the task groups for this assignment
        const [groupRows] = await db.query(`
            SELECT GROUP_CONCAT(DISTINCT stg.group_type) AS group_types
            FROM shift_assignments sa
            LEFT JOIN shift_task_groups stg ON stg.assignment_id = sa.assignment_id
            WHERE sa.assignment_id = ?
        `, [assignmentId]);

        const groupTypes = (groupRows[0]?.group_types || '')
            .split(',')
            .map(g => g.trim())
            .filter(Boolean);

        // 2. Map group types to categories
        const categories = groupTypes
            .map(g => GROUP_TO_CATEGORY[g])
            .filter(Boolean);

        if (categories.length === 0) {
            return res.json([]);
        }

        // 3. Get all task_types that match these categories
        // Create placeholders for IN clause (?, ?, ?)
        const placeholders = categories.map(() => '?').join(', ');
        const [tasks] = await db.query(`
            SELECT
                tt.task_type_id AS id,
                tt.name AS title,
                tt.description AS \`desc\`,
                tt.category AS tag,
                IFNULL(cts.completed, 0) AS completed
            FROM task_type tt
            LEFT JOIN cleaning_session cs ON cs.assignment_id = ? AND DATE(cs.started_at) = ?
            LEFT JOIN cleaning_task_status cts ON cts.session_id = cs.session_id AND cts.task_type_id = tt.task_type_id
            WHERE tt.category IN (${placeholders}) AND tt.is_required = 1
            ORDER BY tt.category, tt.task_type_id
        `, [assignmentId, date, ...categories]);

        // Formatteer tags naar Nederlands voor je frontend kleurtjes
        const formattedTasks = tasks.map(t => ({
            ...t,
            tag: t.tag === 'morning' ? 'Ochtend' :
                 t.tag === 'evening' ? 'Avond' :
                 t.tag === 'weekly' ? 'Wekelijks' :
                 t.tag === 'monthly' ? 'Maandelijks' : 'Overig'
        }));

        res.json(formattedTasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
});

// 3. Update Status (Fix: Bulk update voor alle vinkjes)
router.post('/update', authMiddleware, async (req, res) => {
    const { assignment_id, date, tasks, selected_option_id, custom_text } = req.body;

    // Validate required fields
    if (!assignment_id) {
        return res.status(400).json({ error: "assignment_id is required" });
    }
    if (!date) {
        return res.status(400).json({ error: "date is required" });
    }

    try {
        // 1. Check of er al een sessie is voor dit assignment op deze datum
        let [sessions] = await db.query(
            "SELECT session_id FROM cleaning_session WHERE assignment_id = ? AND DATE(started_at) = ?",
            [assignment_id, date]
        );

        let sessionId;
        if (sessions.length === 0) {
            const [result] = await db.query(
                "INSERT INTO cleaning_session (assignment_id, started_at, status) VALUES (?, ?, 'in_progress')",
                [assignment_id, date]
            );
            sessionId = result.insertId;
        } else {
            sessionId = sessions[0].session_id;
        }

        // 2. Loop door de taken en update 'cleaning_task_status'
        const taskEntries = Object.entries(tasks || {});

        for (const [taskTypeId, isCompleted] of taskEntries) {
            // First check if record exists
            const [existing] = await db.query(
                "SELECT status_id FROM cleaning_task_status WHERE session_id = ? AND task_type_id = ?",
                [sessionId, taskTypeId]
            );

            if (existing.length > 0) {
                // Update existing record
                await db.query(
                    `UPDATE cleaning_task_status
                     SET completed = ?, completed_at = ?
                     WHERE session_id = ? AND task_type_id = ?`,
                    [isCompleted ? 1 : 0, isCompleted ? new Date() : null, sessionId, taskTypeId]
                );
            } else {
                // Insert new record
                await db.query(
                    `INSERT INTO cleaning_task_status (session_id, task_type_id, completed, completed_at)
                     VALUES (?, ?, ?, ?)`,
                    [sessionId, taskTypeId, isCompleted ? 1 : 0, isCompleted ? new Date() : null]
                );
            }
        }

        res.json({ message: "Opgeslagen", session_id: sessionId });
    } catch (error) {
        console.error("Error updating tasks:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;