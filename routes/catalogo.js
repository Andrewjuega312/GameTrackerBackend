// Rutas del catálogo general de juegos (independiente del usuario).
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const JuegoCatalogo = require('../models/JuegoCatalogo');

// Utilidad para comparar textos normalizados.
function normalizar(texto) {
  if (!texto) return '';
  return String(texto).trim().toLowerCase();
}

// Lista todos los juegos del catálogo.
router.get('/', async (req, res) => {
  try {
    const juegos = await JuegoCatalogo.find({}).sort({ titulo: 1 });
    res.json(juegos);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar catálogo' });
  }
});

// Devuelve opciones únicas de plataforma y género del catálogo.
router.get('/opciones', async (req, res) => {
  try {
    const juegos = await JuegoCatalogo.find({});
    const plataformas = Array.from(new Set(juegos.map(j => normalizar(j.plataforma)).filter(Boolean))).sort();
    const generos = Array.from(new Set(juegos.map(j => normalizar(j.genero)).filter(Boolean))).sort();
    res.json({ plataformas, generos });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener opciones' });
  }
});

// Obtiene un juego del catálogo por id.
router.get('/:id', async (req, res) => {
  try {
    const juego = await JuegoCatalogo.findById(req.params.id);
    if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(juego);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener juego' });
  }
});
// Borra un juego del catálogo. Requiere autenticación (idealmente admin).
router.delete('/:id', auth, async (req, res) => {
  try {
    const eliminado = await JuegoCatalogo.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar juego' });
  }
});

module.exports = router;