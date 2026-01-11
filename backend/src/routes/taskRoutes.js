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
            WHERE tt.category IN (?) AND tt.is_required = 1
            ORDER BY tt.category, tt.task_type_id
        `, [assignmentId, date, categories]);

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

    try {
        // 1. Check of er al een sessie is voor dit assignment op deze datum
        let [sessions] = await db.query(
            "SELECT session_id FROM cleaning_session WHERE assignment_id = ? AND DATE(started_at) = ?",
            [assignment_id, date]
        );

        let sessionId;
        if (sessions.length === 0) {
            // Geen sessie? Maak er een aan
            const [result] = await db.query(
                "INSERT INTO cleaning_session (assignment_id, started_at, status) VALUES (?, NOW(), 'in_progress')",
                [assignment_id]
            );
            sessionId = result.insertId;
        } else {
            sessionId = sessions[0].session_id;
        }

        // 2. Loop door de taken en update 'cleaning_task_status'
        const taskEntries = Object.entries(tasks);
        for (const [taskTypeId, isCompleted] of taskEntries) {
            await db.query(`
                INSERT INTO cleaning_task_status (session_id, task_type_id, completed, completed_at)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    completed = VALUES(completed),
                    completed_at = IF(VALUES(completed) = 1, NOW(), NULL)
            `, [sessionId, taskTypeId, isCompleted ? 1 : 0, isCompleted ? new Date() : null]);
        }
        
        // 3. Sla de reden op bij de sessie (optioneel, afhankelijk van je DB structuur)
        // Je kunt hier ook de custom_comment opslaan in cleaning_session als je die kolommen hebt

        res.json({ message: "Opgeslagen", session_id: sessionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

export default router;