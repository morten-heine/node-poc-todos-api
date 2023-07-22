const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../db');
const { encrypt, decrypt } = require('../../utils/crypto.js');

router.get('/', async (req, res) => {
    try {
        console.log('get /todos');
        const result = await pool.query('SELECT * FROM todos');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching todos' });
    }
});

router.get('/:id', async (req, res) => {
    console.log('get /todos:id');
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching todo' });
    }
});

router.post('/', async (req, res) => {
    console.log('post /todos');
    try {
        const { text: name, done } = req.body;
        const result = await pool.query('INSERT INTO todos (name, done) VALUES ($1, $2) RETURNING *', [name, done]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while creating todo' });
    }
});

router.post('/:id/done', async (req, res) => {
    console.log('post /todos/:id/done');
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE todos SET done = true WHERE id = $1 RETURNING *', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while marking todo as done' });
    }
});

router.post('/:id/undone', async (req, res) => {
    console.log('post /todos/:id/undone');
    try {
        const { id } = req.params;
        const result = await pool.query('UPDATE todos SET done = false WHERE id = $1 RETURNING *', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while marking todo as undone' });
    }
});

router.delete('/:id', async (req, res) => {
    console.log('delete /todos/:id');
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM todos WHERE id = $1', [id]);
        res.status(200).json({ message: "Todo deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while deleting todo' });
    }
});

module.exports = router;
