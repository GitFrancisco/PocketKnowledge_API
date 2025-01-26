const express = require("express");
const router = express.Router();
const pool = require("../db");

// Listar todos os temas
router.get("/list", async (req, res) => {
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
router.post("/create", async (req, res) => {
  try {
    const { theme } = req.body; // Recebe o tema para adicionar do body
    const conn = await pool.getConnection();
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
router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params; // Recebe o id do tema a ser editado
    const { theme } = req.body; // Recebe o novo tema do body
    const conn = await pool.getConnection();
    const result = await conn.query("UPDATE themes SET theme = ? WHERE id = ?", [
      theme,
      id,
    ]);
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
router.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params; // Recebe o id do tema a ser apagado
      const conn = await pool.getConnection();
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

module.exports = router;
