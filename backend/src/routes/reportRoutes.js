import express from 'express';
const router = express.Router();
import db from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

router.get('/', authMiddleware, async (req, res) => {
    try {
        // Vang de maand en het jaar op uit de URL (bijv. ?month=2&year=2026)
        const { month, year } = req.query;
        
        let whereClause = "";
        const queryParams = [];

        // Als er gefilterd wordt, voeg dan de SQL filter toe
        if (month && year) {
            whereClause = "WHERE MONTH(cts.created_at) = ? AND YEAR(cts.created_at) = ?";
            queryParams.push(month, year);
        }
        const query =  `
    SELECT 
        cts.status_id AS id, 
        DATE_FORMAT(cts.created_at, '%Y-%m-%d') AS datum, 
        -- Zoek box: via assignment, anders fallback naar box_id in de status tabel
        COALESCE(b.name, CONCAT('Box ', cts.session_id)) AS box,
        -- Zoek assistent: via assignment, anders fallback naar de laatst ingelogde user
        COALESCE(
            CONCAT(u.first_name, ' ', u.last_name),
            (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE role = 'assistant' LIMIT 1),
            'Onbekende Assistent'
        ) AS assistent,
        COALESCE(co.common_comment, cts.custom_comment, '-') AS reden,
        CASE WHEN cts.completed = 1 THEN 'Voltooid' ELSE 'Niet voltooid' END AS status,
        COALESCE(tt.name, 'Algemeen') AS soort
    FROM cleaning_task_status cts
    LEFT JOIN task_type tt ON cts.task_type_id = tt.task_type_id
    LEFT JOIN comment_option co ON cts.selected_comment_option_id = co.option_id
    LEFT JOIN shift_assignments sa ON cts.session_id = sa.assignment_id
    LEFT JOIN box b ON sa.box_id = b.box_id
    LEFT JOIN users u ON sa.user_id = u.user_id
    ${whereClause}
    ORDER BY cts.created_at DESC`;

        const [results] = await db.query(query, queryParams);
        res.json(results);
    } catch (err) {
        console.error("Database Fout:", err.message);
        res.status(500).json([]); 
    }
});

export default router;