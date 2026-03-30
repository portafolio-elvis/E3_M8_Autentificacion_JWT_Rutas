const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Clave secreta para firmar y verificar tokens JWT
const SECRET_KEY = 'tuClaveSecretaSuperSegura123';

// Array simulado para almacenar usuarios registrados
const users = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validar que el usuario no exista
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
  }

  // Hashear la contraseña de forma segura
  const hashedPassword = await bcrypt.hash(password, 10);

  // Guardar nuevo usuario en el array
  const newUser = { username, password: hashedPassword };
  users.push(newUser);

  console.log('Usuario registrado:', newUser);
  res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
});

// Endpoint para autenticar un usuario y generar JWT
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Buscar usuario por username
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // Comparar contraseña ingresada con el hash almacenado
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // Crear y firmar el token JWT
  const payload = { username: user.username, rol: 'usuario' };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

// Middleware para verificar que el token sea válido
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Descodificar y verificar el token
    const payloadDecodificado = jwt.verify(token, SECRET_KEY);
    req.usuario = payloadDecodificado;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

// Ruta protegida: solo accesible con un token válido
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
