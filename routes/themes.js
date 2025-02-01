const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middlewares/authMiddleware");

// Listar todos os temas
router.get("/list", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const themes = await conn.query("SELECT * FROM themes");
    conn.release();
    res.json(themes);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar temas." });
  }
});

// Criar um novo tema
router.post("/create", verifyToken, async (req, res) => {
  const user_id = req.user.id; // Utilizador autenticado

  try {
    const { theme } = req.body; // Recebe o tema para adicionar do body
    const conn = await pool.getConnection();

    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem criar temas." });
    }

    const result = await conn.query("INSERT INTO themes (theme) VALUES (?)", [
      theme,
    ]);
    conn.release();
    res.status(201).json({ message: "Tema adicionado com sucesso!" }); // Mensagem de sucesso
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar tema." });
  }
});

// Editar um tema
router.put("/edit/:id", verifyToken, async (req, res) => {
  const user_id = req.user.id; // Utilizador autenticado

  try {
    const { id } = req.params; // Recebe o id do tema a ser editado
    const { theme } = req.body; // Recebe o novo tema do body
    const conn = await pool.getConnection();

    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem editar temas." });
    }

    const result = await conn.query(
      "UPDATE themes SET theme = ? WHERE id = ?",
      [theme, id]
    );
    conn.release();

    // Verifica se o tema foi editado com sucesso
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Tema editado com sucesso!" });
    } else {
      res.status(404).json({ error: "Tema não encontrado." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar tema." });
  }
});

// Apagar um tema
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const user_id = req.user.id; // Utilizador autenticado

  try {
    const { id } = req.params; // Recebe o id do tema a ser apagado
    const conn = await pool.getConnection();

    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem apagar temas." });
    }

    const result = await conn.query("DELETE FROM themes WHERE id = ?", [id]);
    conn.release();

    // Verifica se o tema foi apagado com sucesso
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Tema apagado com sucesso!" });
    } else {
      res.status(404).json({ error: "Tema não encontrado." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar tema." });
  }
});

// FLASHCARDS-THEMES
// Criar um novo mapeamento flashcard-tema
router.post("/flashcard-theme/create", verifyToken, async (req, res) => {
  const user_id = req.user.id; // Utilizador autenticado
  
  try {
    const { flashcard_id, theme_id } = req.body; // Recebe os IDs do body
    const conn = await pool.getConnection();

    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem mapear temas." });
    }

    const result = await conn.query(
      "INSERT INTO flashcard_theme (flashcard_id, theme_id) VALUES (?, ?)",
      [flashcard_id, theme_id]
    );
    conn.release();
    res.status(201).json({ message: "Mapeamento criado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar mapeamento." });
  }
});

// Listar flashcards de um tema específico
router.get("/:id/flashcards", verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // Recebe o ID do tema
    const conn = await pool.getConnection();
    const results = await conn.query(
      `SELECT f.id, f.question, f.answer, f.created_at, f.user_id 
       FROM flashcard_theme ft
       JOIN flashcards f ON ft.flashcard_id = f.id
       WHERE ft.theme_id = ?`,
      [id]
    );
    conn.release();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar flashcards do tema." });
  }
});

module.exports = router;
