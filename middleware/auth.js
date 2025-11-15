const jwt = require('jsonwebtoken');

// Middleware de autenticación básica con JWT.
// Explicación:
// - Lee la cabecera Authorization: 'Bearer <token>'
// - Verifica el token y coloca userId y userRol en req para usarlos en rutas protegidas.
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ mensaje: 'Inicia sesion para guardar juegos' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.userId = decoded.id;
    req.userRol = decoded.rol;
    next();
  } catch (e) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
}

// Middleware para rutas que requieren rol de administrador.
function admin(req, res, next) {
  if (req.userRol !== 'admin') return res.status(403).json({ mensaje: 'Prohibido' });
  next();
}

module.exports = { auth, admin };