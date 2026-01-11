import express from 'express';
import db from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route om de redenen op te halen voor de modal
router.get('/options', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT option_id, common_comment FROM comment_option");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET voor endpoint box

router.get("/boxes/:boxId/tasks", authMiddleware, async (req, res) => {
    const { boxId } = req.params;
    const date = req.query.date;
try {
    const [tasks] = await db.query(`
        SELECT id, title, description AS desc, task_type
        FROM tasks
        WHERE box_id = ? AND date = ?
        `, [boxId, date]);
        const tasksByType = {};
        tasks.forEach(t => {
            if (!tasksByType[t.task_type]) tasksByType[t.task_type] = [];
            tasksByType[t.task_type].push(t);
        });
        res.json(tasksByType);
} catch (err) {
    console.error(err);
    res.status(500).json({message: "Server error"});
}
});

// Route om de schoonmaakstatus en reden op te slaan
router.post('/update', authMiddleware, async (req, res) => {
    // Haal de waarden uit de body (zorg dat deze namen matchen met MijnBoxen.js)
    const { session_id, task_type_id, selected_option_id, custom_text, completed } = req.body;

    try {
        // 1. Opslaan in de database
        await db.query(`
            INSERT INTO cleaning_task_status 
            (session_id, task_type_id, selected_comment_option_id, custom_comment, completed)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            selected_comment_option_id = VALUES(selected_comment_option_id),
            custom_comment = VALUES(custom_comment),
            completed = VALUES(completed)`, 
            // Gebruik hier de variabelen die hierboven zijn gedeclareerd
            [session_id, task_type_id, selected_option_id, custom_text, completed]
        );

        // 2. Rapportage logica (Optioneel, maar goed voor je overzicht)
        let redenTekst = "";
        if (selected_option_id) {
            const [rows] = await db.query("SELECT common_comment FROM comment_option WHERE option_id = ?", [selected_option_id]);
            if (rows.length > 0) redenTekst = rows[0].common_comment;
        }

        const finaleTekst = custom_text 
            ? `${redenTekst} ${custom_text}`.trim() 
            : redenTekst;

        // Sla op in de reports tabel (gebruik 'filters' als tekst opslag als je geen 'content' kolom hebt)
        const assistantId = req.user?.id || 1;
        await db.query(
            "INSERT INTO reports (generated_by_user_id, period_type, start_date, end_date, filters) VALUES (?, 'day', CURDATE(), CURDATE(), ?)",
            [assistantId, JSON.stringify({ reden: finaleTekst, box: session_id })]
        );

        res.status(200).json({ message: "Succesvol opgeslagen!" });
    } catch (error) {
        console.error("Fout bij opslaan:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;