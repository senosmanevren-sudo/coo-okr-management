const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// 1. TÜM AKSİYONLARI LİSTELE
// GET /api/actions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM actions ORDER BY priority DESC, due_date ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

// 2. OKR'YE BAĞLI AKSİYONLARI AL
// GET /api/actions/okr/:okrId
router.get('/okr/:okrId', async (req, res) => {
  try {
    const { okrId } = req.params;

    const result = await pool.query(
      `SELECT * FROM actions WHERE okr_id = $1 ORDER BY priority DESC, due_date ASC`,
      [okrId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

// 3. YENİ AKSİYON OLUŞTUR
// POST /api/actions
router.post('/', async (req, res) => {
  try {
    const { title, description, okr_id, priority, status, due_date } = req.body;

    if (!title || !okr_id) {
      return res.status(400).json({ error: 'Missing required fields: title, okr_id' });
    }

    const result = await pool.query(
      `INSERT INTO actions (title, description, okr_id, priority, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, okr_id, priority || 'medium', status || 'todo', due_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating action:', error);
    res.status(500).json({ error: 'Failed to create action' });
  }
});

// 4. AKSİYON GÜNCELLE
// PUT /api/actions/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, due_date, progress } = req.body;

    const result = await pool.query(
      `UPDATE actions 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           status = COALESCE($4, status),
           due_date = COALESCE($5, due_date),
           progress = COALESCE($6, progress),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, priority, status, due_date, progress, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating action:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
});

// 5. AKSİYON SİL
// DELETE /api/actions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM actions WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }

    res.json({ message: 'Action deleted successfully', id });
  } catch (error) {
    console.error('❌ Error deleting action:', error);
    res.status(500).json({ error: 'Failed to delete action' });
  }
});

module.exports = router;
