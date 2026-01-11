import express from 'express';
import db from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/task-types
 * Get all task types grouped by category
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT task_type_id, name, description, category, is_required
      FROM task_type
      ORDER BY category, task_type_id
    `);

    // Group by category
    const grouped = {
      morning: [],
      evening: [],
      weekly: [],
      monthly: [],
    };

    rows.forEach(row => {
      if (grouped[row.category]) {
        grouped[row.category].push({
          id: row.task_type_id,
          name: row.name,
          description: row.description,
          isRequired: row.is_required === 1,
        });
      }
    });

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching task types:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/task-types/:category
 * Get task types for a specific category
 */
router.get('/:category', authMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['morning', 'evening', 'weekly', 'monthly'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const [rows] = await db.query(`
      SELECT task_type_id, name, description, category, is_required
      FROM task_type
      WHERE category = ?
      ORDER BY task_type_id
    `, [category]);

    const tasks = rows.map(row => ({
      id: row.task_type_id,
      name: row.name,
      description: row.description,
      isRequired: row.is_required === 1,
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching task types by category:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/task-types
 * Create a new task type
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, isRequired } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    const validCategories = ['morning', 'evening', 'weekly', 'monthly'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const [result] = await db.query(`
      INSERT INTO task_type (name, description, category, is_required)
      VALUES (?, ?, ?, ?)
    `, [name, description || '', category, isRequired ? 1 : 0]);

    res.status(201).json({
      id: result.insertId,
      name,
      description: description || '',
      category,
      isRequired: isRequired || false,
    });
  } catch (error) {
    console.error('Error creating task type:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/task-types/:id
 * Update a task type
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isRequired } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const [result] = await db.query(`
      UPDATE task_type
      SET name = ?, description = ?, is_required = ?
      WHERE task_type_id = ?
    `, [name, description || '', isRequired ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task type not found' });
    }

    res.json({ message: 'Task type updated successfully' });
  } catch (error) {
    console.error('Error updating task type:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/task-types/:id
 * Delete a task type
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`
      DELETE FROM task_type
      WHERE task_type_id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task type not found' });
    }

    res.json({ message: 'Task type deleted successfully' });
  } catch (error) {
    console.error('Error deleting task type:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
