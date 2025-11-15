// Rutas para gestionar reseñas (opiniones) de juegos.
const express = require('express');
const Resena = require('../models/Resena');
const Juego = require('../models/Juego');
const router = express.Router();

// Lista todas las reseñas registradas.
router.get('/', async (req, res) => {
  try {
    const resenas = await Resena.find();
    res.json(resenas);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
});

// Lista reseñas asociadas a un juego específico.
router.get('/juego/:juegoId', async (req, res) => {
  try {
    const lista = await Resena.find({ juegoId: req.params.juegoId });
    res.json(lista);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener reseñas del juego' });
  }
});

// Crea una nueva reseña y la vincula al juego correspondiente.
router.post('/', async (req, res) => {
  try {
    const { juegoId, autor, texto, estrellas } = req.body;
    if (!juegoId || !autor || !texto || !estrellas) return res.status(400).json({ error: 'Datos incompletos' });
    const r = new Resena({ juegoId, autor, texto, estrellas });
    const guardada = await r.save();
    await Juego.findByIdAndUpdate(juegoId, { $push: { resenas: guardada._id } });
    res.status(201).json(guardada);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear reseña' });
  }
});

// Actualiza campos permitidos de una reseña (texto/estrellas).
router.put('/:id', async (req, res) => {
  try {
    const campos = {};
    if (typeof req.body.texto === 'string') campos.texto = req.body.texto;
    if (typeof req.body.estrellas !== 'undefined') campos.estrellas = req.body.estrellas;
    const actualizada = await Resena.findByIdAndUpdate(req.params.id, campos, { new: true });
    if (!actualizada) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(actualizada);
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
});

// Elimina una reseña y la quita del array de reseñas del juego.
router.delete('/:id', async (req, res) => {
  try {
    const r = await Resena.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'Reseña no encontrada' });
    await Juego.findByIdAndUpdate(r.juegoId, { $pull: { resenas: r._id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al borrar reseña' });
  }
});

module.exports = router;