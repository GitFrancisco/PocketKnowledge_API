const express = require("express");
const router = express.Router();
const pool = require("../db");

// Listar todos os flashcards
router.get("/list", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const flashcards = await conn.query("SELECT * FROM flashcards");
    conn.release();
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar flashcards." });
  }
});

// Criar um novo flashcard
router.post("/create", async (req, res) => {
  const { question, answer, user_id } = req.body;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO flashcards (question, answer, user_id) VALUES (?, ?, ?)",
      [question, answer, user_id]
    );
    conn.release();
    res.status(201).json({ message: "Flashcard adicionado com sucesso!" }); 
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar flashcard." });
  }
});

// Apagar um flashcard
router.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params; // Recebe o id do flashcard a ser apagado
      const conn = await pool.getConnection();
      const result = await conn.query("DELETE FROM flashcards WHERE id = ?", [id]);
      conn.release();
  
      // Verifica se o tema foi apagado com sucesso
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Flashcard apagado com sucesso!" });
      } else {
        res.status(404).json({ error: "Flashcard não encontrado." });
      }
    } catch (err) {
      res.status(500).json({ error: "Erro ao apagar flashcard." });
    }
  });
module.exports = router;
