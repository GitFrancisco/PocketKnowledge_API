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

// Middleware para verificar o token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Captura o token JWT do cabeçalho

  if (!token) return res.status(401).json({ error: "Acesso negado. Token não fornecido." });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Decodifica o token
    req.user = decoded; // Armazena os dados do usuário no objeto req
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido." });
  }
};



module.exports = { authenticateToken, verifyToken };
