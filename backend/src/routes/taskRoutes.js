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

// Route om de schoonmaakstatus en reden op te slaan
router.post('/update', authMiddleware, async (req, res) => {
    const { session_id, task_type_id, selected_option_id, custom_text, completed } = req.body;

    try {
        const commentValue = (custom_text && custom_text.trim() !== "") ? custom_text : null;
        const optionValue = selected_option_id || null;

        const query = `
            INSERT INTO cleaning_task_status 
            (session_id, task_type_id, selected_comment_option_id, custom_comment, completed)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            selected_comment_option_id = VALUES(selected_comment_option_id),
            custom_comment = VALUES(custom_comment),
            completed = VALUES(completed)`;

        await db.query(query, [session_id, task_type_id, optionValue, commentValue, completed]);
        
        res.status(200).json({ message: "Succesvol opgeslagen!" });
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;