const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os temas
router.get('/', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const themes = await conn.query('SELECT * FROM themes');
        conn.release();
        res.json(themes);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar temas.' });
    }
});

// Criar um novo tema
router.post('/', async (req, res) => {
    const { theme } = req.body;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query('INSERT INTO themes (theme) VALUES (?)', [theme]);
        conn.release();
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar tema.' });
    }
});

module.exports = router;