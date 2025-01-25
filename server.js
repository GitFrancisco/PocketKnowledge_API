// Importa o express e as rotas
const express = require('express');
const app = express();
const userRoutes = require('./routes/users');
const flashcardRoutes = require('./routes/flashcards');
const themeRoutes = require('./routes/themes');

// Middleware
app.use(express.json());

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/themes', themeRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;
// Inicia o servidor
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
