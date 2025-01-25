const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os flashcards
router.get('/', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const flashcards = await conn.query('SELECT * FROM flashcards');
        conn.release();
        res.json(flashcards);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar flashcards.' });
    }
});

// Criar um novo flashcard
router.post('/', async (req, res) => {
    const { question, answer, user_id } = req.body;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO flashcards (question, answer, user_id) VALUES (?, ?, ?)',
            [question, answer, user_id]
        );
        conn.release();
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar flashcard.' });
    }
});

module.exports = router;