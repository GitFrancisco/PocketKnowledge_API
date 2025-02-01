const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middlewares/authMiddleware");

// Listar todos os flashcards
router.get("/list", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const flashcards = await conn.query("SELECT * FROM flashcards");
    conn.release();
    res.json(flashcards);
    console.log("Success!");
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar flashcards." });
  }
});

// Criar um novo flashcard
router.post("/create", verifyToken, async (req, res) => {
  const { question, answer } = req.body;
  const user_id = req.user.id; // Utilizador autenticado

  try {
    // Consulta diretamente a base de dados para verificar a role
    const conn = await pool.getConnection();
    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem criar flashcards." });
    }
    const result = await conn.query(
      "INSERT INTO flashcards (question, answer, user_id) VALUES (?, ?, ?)",
      [question, answer, user_id]
    );

    conn.release();
    // Retorna o id do flashcard criado
    const insertId = Number(result.insertId);
    res
      .status(201)
      .json({ message: "Flashcard adicionado com sucesso!", id: insertId });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar flashcard." });
  }
});

// Buscar um Flashcard pelo seu ID
router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const flashcard = await conn.query(
      "SELECT * FROM flashcards WHERE id = ?",
      [id]
    );
    conn.release();
    if (flashcard.length > 0) {
      res.json(flashcard[0]);
    } else {
      res.status(404).json({ error: "Flashcard não encontrado." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar flashcard." });
  }
});

// Apagar um flashcard
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const user_id = req.user.id; // Utilizador autenticado

  try {
    const { id } = req.params; // Recebe o id do flashcard a ser apagado
    const conn = await pool.getConnection();

    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem apagar flashcards." });
    }

    const result = await conn.query("DELETE FROM flashcards WHERE id = ?", [
      id,
    ]);
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

// ############################
// ### FLASHCARDS FAVORITOS ###
// ############################

// Adicionar um flashcard aos favoritos
router.post("/favorite", verifyToken, async (req, res) => {
  const { flashcard_id } = req.body;
  const user_id = req.user.id; // Utilizador autenticado

  if (!flashcard_id) {
    return res.status(400).json({ error: "flashcard_id é obrigatório." });
  }

  try {
    const conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO favorite_flashcards (user_id, flashcard_id) VALUES (?, ?)",
      [user_id, flashcard_id]
    );

    conn.release();
    res
      .status(201)
      .json({ message: "Flashcard adicionado aos favoritos com sucesso!" });
  } catch (err) {
    console.error("Erro ao adicionar flashcard:", err);
    res
      .status(500)
      .json({ error: "Erro ao adicionar flashcard aos favoritos." });
  }
});

// Remover um flashcard dos favoritos
router.delete("/removeFavorite/:id", verifyToken, async (req, res) => {
  const { id } = req.params; // Recebe o id do flashcard a ser apagado
  const user_id = req.user.id; // Utilizador autenticado

  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      "DELETE FROM favorite_flashcards WHERE user_id = ? AND flashcard_id = ?",
      [user_id, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Flashcard não encontrado nos favoritos." });
    }

    res
      .status(200)
      .json({ message: "Flashcard removido dos favoritos com sucesso!" });
  } catch (err) {
    console.error("Erro ao remover favorito:", err);
    res.status(500).json({ error: "Erro ao remover flashcard dos favoritos." });
  }
});

// Listar todos os flashcards favoritos de um utilizador
router.get("/listFavorites", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const conn = await pool.getConnection();
    const flashcards = await conn.query(
      "SELECT * FROM favorite_flashcards WHERE user_id = ?",
      [user_id]
    );

    conn.release();
    if (flashcards[0].length === 0) {
      return res.status(404).json({ message: "Nenhum favorito encontrado." });
    }

    res.status(200).json(flashcards);
  } catch (err) {
    console.error("Erro ao buscar favoritos:", err);
    res.status(500).json({ error: "Erro ao buscar flashcards favoritos." });
  }
});

// Listar todos os flashcards favoritos de um utilizador
router.get("/listFavoriteFlashcards", verifyToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const user_id = req.user.id;

    const result = await conn.query(
      `SELECT f.id, f.question, f.answer, f.created_at, f.user_id
       FROM flashcards f
       INNER JOIN favorite_flashcards ff ON f.id = ff.flashcard_id
       WHERE ff.user_id = ?`,
      [user_id]
    );

    const flashcards = result;

    if (!flashcards || flashcards.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum flashcard favorito encontrado." });
    }

    res.status(200).json(flashcards);
  } catch (err) {
    console.error("Erro ao buscar flashcards favoritos:", err);
    res.status(500).json({ error: "Erro ao buscar flashcards favoritos." });
  } finally {
    conn.release(); // Libera a conexão, mesmo em caso de erro
  }
});

module.exports = router;
