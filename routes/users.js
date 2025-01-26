const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os utilizadores
router.get('/list', async (req, res) => {
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
router.post('/register', async (req, res) => {
    const { username, password, email} = req.body;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO users (username, password, email, Role) VALUES (?, ?, ?, ?)',
            [username, password, email, "user"]
        );
        conn.release();
        res.status(201).json({ message: "Utilizador adicionado com sucesso!" }); // Mensagem de sucesso
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar um utilizador.' });   
    }
});

// Apagar um utilizador
router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM users WHERE id = ?', [id]);
        conn.release();
        res.json({ message: 'Utilizador apagado com sucesso!' });// Mensagem de sucesso
    } catch (err) {
        res.status(500).json({ error: 'Erro ao apagar um utilizador.' });
    }
});
module.exports = router;