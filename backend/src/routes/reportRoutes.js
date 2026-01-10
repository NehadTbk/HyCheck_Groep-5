import express from 'express';
const router = express.Router();
import db from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

router.get('/', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT 
                cs.session_id AS id, 
                DATE_FORMAT(cs.created_at, '%Y-%m-%d') AS datum, 
                b.name AS box,
                (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE user_id = sa.dentist_user_id) AS tandarts,
                CONCAT(u.first_name, ' ', u.last_name) AS assistent,
                -- LOGICA: Pak eerst de getypte tekst (custom_comment), 
                -- als die NULL is pak de standaard reden (common_comment)
                (SELECT GROUP_CONCAT(DISTINCT 
                    COALESCE(cts.custom_comment, co.common_comment) 
                    SEPARATOR ', ') 
                 FROM cleaning_task_status cts
                 LEFT JOIN comment_option co ON cts.selected_comment_option_id = co.option_id
                 WHERE cts.session_id = cs.session_id) AS reden,
                CASE WHEN cs.status = 'completed' THEN 'Voltooid' ELSE 'Openstaand' END AS status
            FROM cleaning_session cs
            JOIN shift_assignments sa ON cs.assignment_id = sa.assignment_id
            JOIN box b ON sa.box_id = b.box_id
            JOIN users u ON sa.user_id = u.user_id -- Verander sa.assistant_user_id naar sa.user_id
            ORDER BY cs.created_at DESC`;

        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error("Database Fout:", err.message);
        res.status(500).json([]); 
    }
});

export default router;