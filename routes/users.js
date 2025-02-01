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
// Importar o middleware de autenticação
const { authenticateToken, verifyToken } = require("../middlewares/authMiddleware");

// Secret Key para o JWT
const SECRET_KEY_JWT = process.env.SECRET_KEY;

// Listar todos os utilizadores
router.get("/list", verifyToken, async (req, res) => {
  const user_id = req.user.id; // Utilizador autenticado
  
  try {
    const conn = await pool.getConnection();

    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem listar utilizadores." });
    }

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

      res.json({token});
    } catch (err) {
      res.status(500).json({ error: "Erro ao fazer login." });
    }
  }
);

// Apagar um utilizador
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const user_id = req.user.id; // Utilizador autenticado
  const id = req.params.id;
  try {
    const conn = await pool.getConnection();

    const user_role = await conn.query("SELECT Role FROM users WHERE id = ?", [
      user_id,
    ]);

    if (user_role[0].Role != "admin") {
      return res
        .status(403)
        .json({ error: "Apenas administradores podem apagar utilizadores." });
    }

    const result = await conn.query("DELETE FROM users WHERE id = ?", [id]);
    conn.release();
    res.json({ message: "Utilizador apagado com sucesso!" }); // Mensagem de sucesso
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar um utilizador." });
  }
});



// Obter um utilizador autenticado
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    // Buscar os dados do utilizador com base no ID extraído do token
    const [user] = await conn.query(
      "SELECT id, username, email, Role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    conn.release();

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }
    // Retornar os dados do utilizador
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar os dados do utilizador." });
  }
});



module.exports = router;
