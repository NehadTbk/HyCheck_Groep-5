import express from 'express';
const router = express.Router();
import db from '../config/db.js';

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.report_id AS id, 
                r.start_date AS datum, 
                r.period_type AS soort,
                
                
                (SELECT b.name 
                 FROM shift_assignments sa
                 JOIN box b ON sa.box_id = b.box_id 
                 WHERE sa.assignment_id = (
                    SELECT assignment_id FROM shift_assignments 
                    ORDER BY assignment_id DESC LIMIT 1
                 ) LIMIT 1) AS box,

                
                (SELECT CONCAT(d.first_name, ' ', d.last_name)
                 FROM users d
                 JOIN shift_assignments sa ON d.user_id = sa.dentist_user_id
                 ORDER BY sa.assignment_id DESC LIMIT 1) AS tandarts,
                
                
                CONCAT(u.first_name, ' ', u.last_name) AS assistent,

                
                (SELECT COUNT(*) FROM cleaning_task_status WHERE session_id = r.report_id) AS aantal,

                
                CASE 
                    WHEN (SELECT COUNT(*) FROM cleaning_task_status WHERE session_id = r.report_id AND completed = 1) = 
                         (SELECT COUNT(*) FROM cleaning_task_status WHERE session_id = r.report_id) 
                         AND (SELECT COUNT(*) FROM cleaning_task_status WHERE session_id = r.report_id) > 0
                    THEN 'Voltooid'
                    ELSE 'Openstaand'
                END AS status,

                
                (SELECT GROUP_CONCAT(DISTINCT 
                COALESCE(cts.custom_comment, co.common_comment) 
                SEPARATOR ', ') 
                FROM cleaning_task_status cts
                LEFT JOIN comment_option co ON cts.selected_comment_option_id = co.option_id
                WHERE cts.session_id = r.report_id) AS reden

            FROM reports r
            LEFT JOIN users u ON r.generated_by_user_id = u.user_id
            ORDER BY r.start_date DESC`;

        const [results] = await db.query(query);
        res.json(results);
        
    } catch (err) {
        console.error("Database Fout:", err);
        res.status(500).json({ error: err.message });
    }
});


export default router;