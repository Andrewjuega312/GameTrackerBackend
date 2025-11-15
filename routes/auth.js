// Rutas de autenticación (registro e inicio de sesión).
// Genera y devuelve un JWT para acceder a rutas protegidas.
const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const router = express.Router();

// Registro: crea un usuario nuevo si no existe ese email.
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Datos incompletos' });
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: 'Email ya registrado' });
    const u = await Usuario.create({ nombre, email, password });
    // Importante: aquí la contraseña se guarda tal cual.
    // Mejora pendiente: encriptar con bcrypt antes de guardar.
    const token = jwt.sign({ id: u._id, rol: u.rol }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, usuario: { _id: u._id, nombre: u.nombre, email: u.email, rol: u.rol } });
  } catch (e) {
    res.status(500).json({ error: 'Error en registro' });
  }
});

// Login: comprueba email y contraseña; si son válidos, emite un token.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Datos incompletos' });
    const u = await Usuario.findOne({ email });
    // Nota: aquí comparamos la contraseña tal cual (sin hash).
    // Mejora pendiente: usar bcrypt.compare para validar el hash.
    if (!u || u.password !== password) return res.status(400).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: u._id, rol: u.rol }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, usuario: { _id: u._id, nombre: u.nombre, email: u.email, rol: u.rol } });
  } catch (e) {
    res.status(500).json({ error: 'Error en inicio de sesión' });
  }
});

module.exports = router;