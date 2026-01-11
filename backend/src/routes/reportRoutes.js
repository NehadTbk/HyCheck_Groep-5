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
            whereClause = "WHERE MONTH(cs.started_at) = ? AND YEAR(cs.started_at) = ?";
            queryParams.push(month, year);
        }

        // Query to get aggregated report data per cleaning session
        const query = `
    SELECT
        cs.session_id AS id,
        DATE_FORMAT(cs.started_at, '%Y-%m-%d') AS datum,
        COALESCE(b.name, CONCAT('Box ', sa.box_id)) AS box,
        COALESCE(
            CONCAT(u.first_name, ' ', u.last_name),
            'Onbekende Assistent'
        ) AS assistent,
        COUNT(cts.status_id) AS aantal,
        GROUP_CONCAT(DISTINCT
            CASE tt.category
                WHEN 'morning' THEN 'Ochtend'
                WHEN 'evening' THEN 'Avond'
                WHEN 'weekly' THEN 'Wekelijks'
                WHEN 'monthly' THEN 'Maandelijks'
                ELSE tt.category
            END
            SEPARATOR ', '
        ) AS soort,
        CASE
            WHEN COUNT(cts.status_id) > 0 AND COUNT(cts.status_id) = SUM(CASE WHEN cts.completed = 1 THEN 1 ELSE 0 END)
            THEN 'Voltooid'
            WHEN SUM(CASE WHEN cts.completed = 1 THEN 1 ELSE 0 END) > 0
            THEN 'Gedeeltelijk'
            ELSE 'Niet voltooid'
        END AS status,
        COALESCE(
            MAX(co.common_comment),
            MAX(cts.custom_comment),
            '-'
        ) AS reden
    FROM cleaning_session cs
    INNER JOIN shift_assignments sa ON sa.assignment_id = cs.assignment_id
    LEFT JOIN box b ON b.box_id = sa.box_id
    LEFT JOIN users u ON u.user_id = sa.user_id
    LEFT JOIN cleaning_task_status cts ON cts.session_id = cs.session_id
    LEFT JOIN task_type tt ON tt.task_type_id = cts.task_type_id
    LEFT JOIN comment_option co ON co.option_id = cts.selected_comment_option_id
    ${whereClause}
    GROUP BY cs.session_id, cs.started_at, b.name, sa.box_id, u.first_name, u.last_name
    ORDER BY cs.started_at DESC`;

        const [results] = await db.query(query, queryParams);
        res.json(results);
    } catch (err) {
        console.error("Database Fout:", err.message);
        res.status(500).json([]);
    }
});

export default router;