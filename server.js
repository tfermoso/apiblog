const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secretito';

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('✅ Conectado a MySQL');
});

// 🔒 Middleware para verificar el token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

// 👉 Crear usuario
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  db.query('INSERT INTO usuarios (username, password) VALUES (?, ?)', [username, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Usuario creado', userId: result.insertId });
  });
});

// 👉 Login de usuario
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = results[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// 👉 Crear post (requiere token)
app.post('/api/posts', verifyToken, (req, res) => {
  const { titulo, cuerpo } = req.body;
  const userId = req.user.id;

  db.query('INSERT INTO post (titulo, cuerpo, userId) VALUES (?, ?, ?)', [titulo, cuerpo, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Post creado', postId: result.insertId });
  });
});

// 👉 Leer todos los posts
app.get('/api/posts', (req, res) => {
  db.query('SELECT * FROM post', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 👉 Leer un post por ID
app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM post WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(results[0]);
  });
});

app.listen(port, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
});
