-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS apiblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apiblog;

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL
);

-- Crear la tabla de post
CREATE TABLE IF NOT EXISTS post (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  cuerpo TEXT NOT NULL,
  userId INT NOT NULL,
  FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE
);
