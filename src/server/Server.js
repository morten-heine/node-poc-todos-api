const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { encrypt, decrypt } = require('../utils/crypto.js');

const app = express();

const env=process.env.ENV;
const key = process.env[`ENCRYPTION_KEY_${env}`];
console.log(`key:${key}`);

const apihost = process.env[`api_host_${env}`];
const apiport = process.env.PORT || process.env[`api_listen_port_${env}`];

const dbhost = process.env[`db_host_${env}`];
const dbport = process.env[`db_port_${env}`];
const dbuser = process.env[`db_user_${env}`];
const dbpassword = process.env[`db_password_${env}`];
const dbdatabase = process.env[`db_database_${env}`];
const dbssl = process.env[`db_reject_unauthorized_${env}`]

const pool = new Pool({
    host: dbhost,
    port: dbport,
    user: dbuser,
    password: dbpassword,
    database: dbdatabase,
    ssl: dbssl? {
        rejectUnauthorized: dbssl
    }:null
});

app.use(express.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            reportUri: '/report-violation',
        }
    },
    dnsPrefetchControl: true,
    expectCt: {
        maxAge: 86400,
    },
    frameguard: {
        action: 'deny'
    },
    hidePoweredBy: {
        setTo: 'PHP 4.2.0'
    },
    hsts: {
        maxAge: 86400,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: {
        policy: 'no-referrer'
    },
    xssFilter: true,
}));

app.get('/', async (req, res) => {
        console.log('get /');
        res.send('Todo API');
});

app.get('/todos', async (req, res) => {
    try {
        console.log('get /todos');
        const result = await pool.query('SELECT * FROM todos');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching todos' });
    }
});

app.get('/todos/:id', async (req, res) => {
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

app.post('/todos', async (req, res) => {
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

app.post('/todos/:id/done', async (req, res) => {
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

app.post('/todos/:id/undone', async (req, res) => {
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

app.delete('/todos/:id', async (req, res) => {
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

app.get('/todos/:id/comments', async (req, res) => {
    console.log('get /todos/:id/comments');
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM TodoComments WHERE todo_id = $1 order by id', [id]);

        for (let i = 0; i < rows.length; i++) {
            const decryptedComment = decrypt(rows[i].comment, key);
            console.log(`encrypted:${rows[i].comment}`);
            console.log(`decrypted:${decryptedComment}`);
            rows[i].comment = decryptedComment;
        }
        console.log(rows)
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    }
});

app.post('/todos/:id/comments', async (req, res) => {
    console.log('post /todos/:id/comments');
    try {
        const { id } = req.params;
        const { comment: text } = req.body;
        const encrypted_text = encrypt(text,key);

        const result = await pool.query('INSERT INTO TodoComments (comment, todo_id) VALUES ($1, $2) RETURNING *', [encrypted_text, id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while creating comment' });
    }
});

app.delete('/todos/:id/comments', async (req, res) => {
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

app.listen(apiport, () => {
    console.log(`Todo API listening to port ${apiport}`);
});
