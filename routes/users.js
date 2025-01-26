const express = require("express");
const router = express.Router();
const pool = require("../db");
// Hashing Passwords
const bcrypt = require("bcrypt");
// JWT para utilizar na autenticação
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
// .env
require("dotenv").config();

// Secret Key para o JWT
const SECRET_KEY_JWT = process.env.SECRET_KEY;

// Listar todos os utilizadores
router.get("/list", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const users = await conn.query(
      "SELECT id, username, email, Role, created_at FROM users"
    );
    conn.release();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar os utilizadores." });
  }
});

// Criar um novo utilizador
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const conn = await pool.getConnection();

    // Calcula o hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verifica se o enderenço de email é válido
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      conn.release();
      return res.status(400).json({ error: "Endereço de email inválido." });
    }

    const result = await conn.query(
      "INSERT INTO users (username, password, email, Role) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, email, "user"]
    );
    conn.release();
    res.status(201).json({ message: "Utilizador adicionado com sucesso!" }); // Mensagem de sucesso
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar um utilizador." });
  }
});

// Autenticar um utilizador
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido."),
    body("password").notEmpty().withMessage("A senha é obrigatória."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const conn = await pool.getConnection();

      // Buscar utilizador pelo email
      const [user] = await conn.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      conn.release();

      if (!user) {
        return res.status(401).json({ error: "Email ou senha incorretos." });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Email ou senha incorretos." });
      }

      // Gerar token JWT
      const token = jwt.sign({ id: user.id, role: user.Role }, SECRET_KEY_JWT, {
        expiresIn: "1h",
      });

      res.json({ message: "Login com sucesso!", token });
    } catch (err) {
      res.status(500).json({ error: "Erro ao fazer login." });
    }
  }
);

// Apagar um utilizador
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query("DELETE FROM users WHERE id = ?", [id]);
    conn.release();
    res.json({ message: "Utilizador apagado com sucesso!" }); // Mensagem de sucesso
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar um utilizador." });
  }
});
module.exports = router;
