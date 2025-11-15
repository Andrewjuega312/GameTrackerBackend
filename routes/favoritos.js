// Rutas para gestionar favoritos del usuario.
// Requiere autenticación mediante token.
const express = require('express');
const { auth } = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const Juego = require('../models/Juego');
const router = express.Router();

// Alterna el estado de favorito: si estaba, lo quita; si no, lo agrega.
router.post('/:id', auth, async (req, res) => {
  try {
    const juegoId = req.params.id;
    const u = await Usuario.findById(req.userId);
    const existe = u.favoritos.some(f => String(f) === String(juegoId));
    if (existe) u.favoritos = u.favoritos.filter(f => String(f) !== String(juegoId));
    else u.favoritos.push(juegoId);
    await u.save();
    // Devolvemos la lista de favoritos con sus ids.
    const favoritos = await Juego.find({ _id: { $in: u.favoritos } }, '_id');
    res.json(favoritos);
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar favoritos' });
  }
});

// Lista los favoritos del usuario autenticado con datos mínimos para tarjeta.
router.get('/', auth, async (req, res) => {
  try {
    const u = await Usuario.findById(req.userId)
    const favoritos = await Juego.find({ _id: { $in: u.favoritos } }, 'titulo portada plataforma puntuacion completado horasJugadas')
    res.json(favoritos)
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener favoritos' })
  }
})

module.exports = router;