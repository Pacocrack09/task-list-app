const express = require('express');
const path = require('path');
const { getPool, sql } = require('./db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add a new task
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('title', sql.NVarChar, title.trim())
      .query('INSERT INTO tasks (title) OUTPUT INSERTED.* VALUES (@title)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM tasks WHERE id = @id');
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Toggle task completed status
app.put('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(
        'UPDATE tasks SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END OUTPUT INSERTED.* WHERE id = @id'
      );
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

module.exports = app;
