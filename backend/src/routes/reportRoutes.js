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
                'Box 1' AS box, 
                'Dr. Van Damme' AS tandarts, 
                CONCAT(u.first_name, ' ', u.last_name) AS assistent,
                5 AS aantal,
                'Voltooid' AS status
            FROM reports r
            LEFT JOIN users u ON r.generated_by_user_id = u.user_id`;

        const [results] = await db.query(query);
        res.json(results);
        
    } catch (err) {
        console.error("Database Fout:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;