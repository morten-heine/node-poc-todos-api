const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../db');
const { encrypt, decrypt } = require('../../utils/crypto.js');

const env = process.env.ENV;
const key = process.env[`ENCRYPTION_KEY_${env}`];

router.get('/', async (req, res) => {
    console.log('get /todos/:id/comments');
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM TodoComments WHERE todo_id = $1 order by id', [id]);

        for (let i = 0; i < rows.length; i++) {
            const decryptedComment = decrypt(rows[i].comment, key);
            rows[i].comment = decryptedComment;
        }
        console.log(rows)
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    }
});

router.post('/', async (req, res) => {
    console.log('post /todos/:id/comments');
    try {
        const { id } = req.params;
        console.log(`id = ${id}`)
        const { comment: text } = req.body;
        const encrypted_text = encrypt(text,key);

        const { rows } = await pool.query('INSERT INTO TodoComments (comment, todo_id) VALUES ($1, $2) RETURNING *', [encrypted_text, id]);
        const decryptedComment = decrypt(rows[0].comment, key);
        rows[0].comment = decryptedComment;

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while creating comment' });
    }
});

router.delete('/', async (req, res) => {
    console.log('delete /todos/:id/comments');
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM TodoComments WHERE todo_id = $1', [id]);
        res.status(200).json({ message: "Todo comments deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while deleting comments' });
    }
});

module.exports = router;