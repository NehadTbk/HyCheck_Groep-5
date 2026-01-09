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
        // 1. De status opslaan (voor de assistent)
        await db.query(`
            INSERT INTO cleaning_task_status 
            (session_id, task_type_id, selected_comment_option_id, custom_comment, completed)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            selected_comment_option_id = VALUES(selected_comment_option_id),
            custom_comment = VALUES(custom_comment)`, 
            [session_id, task_type_id, selected_option_id, custom_text, completed]
        );

        // 2. HET RAPPORT MAKEN (voor de verantwoordelijke)
        // We zoeken eerst even de tekst op van de gekozen optie (bijv. 'Manque de personnel')
        let redenTekst = "";
        if (selected_option_id) {
            const [rows] = await db.query("SELECT common_comment FROM comment_option WHERE option_id = ?", [selected_option_id]);
            if (rows.length > 0) redenTekst = rows[0].common_comment;
        }

        // We voegen de eigen tekst van de assistent toe als die er is
        const finaleTekst = custom_text 
            ? `${redenTekst} - Toelichting: ${custom_text}` 
            : redenTekst;

        // Nu sturen we de 'brief' naar de reports tabel
        // We vullen 'content' met de reden van de assistent
        const reportQuery = `
            INSERT INTO reports (generated_by_user_id, period_type, start_date, end_date, content) 
            VALUES (?, 'day', CURDATE(), CURDATE(), ?)`;

        // Gebruik user_id 1 (of stuur het ID van de assistent mee uit de frontend)
        await db.query(reportQuery, [1, `Box ${session_id}: ${finaleTekst}`]);

        res.status(200).json({ message: "Succes! Status opgeslagen en rapport aangemaakt." });
    } catch (error) {
        console.error("Fout bij opslaan:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;