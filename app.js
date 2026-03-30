const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

const SECRET_KEY = 'tuClaveSecretaSuperSegura123';
const users = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = { username, password: hashedPassword };
  users.push(newUser);

  console.log('Usuario registrado:', newUser);
  res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const payload = { username: user.username, rol: 'usuario' };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payloadDecodificado = jwt.verify(token, SECRET_KEY);
    req.usuario = payloadDecodificado;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

app.get('/perfil', verificarToken, (req, res) => {
  res.json({ 
    mensaje: 'Acceso concedido al perfil', 
    usuario: req.usuario 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
