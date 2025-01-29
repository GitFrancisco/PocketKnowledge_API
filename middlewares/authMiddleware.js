const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY_JWT = process.env.SECRET_KEY;

// Middleware para autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  jwt.verify(token, SECRET_KEY_JWT, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido ou expirado." });
    }
    req.user = user; // Armazena os dados do utilizador no objeto `req` para uso posterior
    next();
  });
};

module.exports = authenticateToken;
