const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os utilizadores
router.get('/', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const users = await conn.query('SELECT id, username, email, Role, created_at FROM users');
        conn.release();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar os utilizadores.' });
    }
});

// Criar um novo utilizador
router.post('/', async (req, res) => {
    const { username, password, email} = req.body;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO users (username, password, email, Role) VALUES (?, ?, ?, ?)',
            [username, password, email, "user"]
        );
        conn.release();
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar um utilizador.' });   
    }
});


module.exports = router;