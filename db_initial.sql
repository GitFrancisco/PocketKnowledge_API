-- Caso a base de dados já existe, apagar a base de dados
DROP DATABASE IF EXISTS pocketknowledgeapp;

-- Criar a base de dados
CREATE DATABASE pocketknowledgeapp;

-- Usar a base de dados
USE pocketknowledgeapp;

---------------
--- TABELAS ---
---------------

-- Tabela para os utilizadores do sistema
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Role do utilizador, administrador ou utilizador normal
    Role ENUM('admin', 'user') NOT NULL
);

-- Tabela para os "flashcards"
CREATE TABLE flashcards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Chave forasteira para o utilizador que criou o "flashcard"
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela para os "flashcards" favoritos
CREATE TABLE favorite_flashcards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Chave forasteira para o "flashcard" favorito
    flashcard_id INT NOT NULL,
    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id),
    -- Chave forasteira para o utilizador que favoritou o "flashcard"
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 

-- Tabela para os temas dos "flashcards"
CREATE TABLE themes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theme varchar(255) NOT NULL
);

-- Tabela para os "flashcards" e os temas
CREATE TABLE flashcard_theme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Chave forasteira para o "flashcard"
    flashcard_id INT NOT NULL,
    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id),
    -- Chave forasteira para o tema
    theme_id INT NOT NULL,
    FOREIGN KEY (theme_id) REFERENCES themes(id)
);

ALTER TABLE favorite_flashcards ADD CONSTRAINT unique_favorite UNIQUE (user_id, flashcard_id);