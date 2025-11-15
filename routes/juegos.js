// Rutas para gestionar juegos de usuarios.
// Incluye listados, creación, edición, puntuación y borrado.
const express = require('express');
const Juego = require('../models/Juego');
const JuegoCatalogo = require('../models/JuegoCatalogo');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Utilidad simple para comparar textos sin mayúsculas/espacios extra.
function normalizar(texto) {
  if (!texto) return '';
  return String(texto).trim().toLowerCase();
}

// Lista todos los juegos (de todos los usuarios). Útil para vistas generales.
router.get('/todos', async (req, res) => {
  try {
    const juegos = await Juego.find();
    res.json(juegos);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});

// Devuelve opciones únicas de plataforma y género basadas en juegos guardados.
router.get('/opciones', async (req, res) => {
  try {
    const juegos = await Juego.find({}, { plataforma: 1, genero: 1 });
    const plataformas = Array.from(new Set(juegos.map(j => (j.plataforma || '').trim().toLowerCase()).filter(Boolean))).sort();
    const generos = Array.from(new Set(juegos.map(j => (j.genero || '').trim().toLowerCase()).filter(Boolean))).sort();
    res.json({ plataformas, generos });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener opciones' });
  }
});

// Obtiene un juego por id sin requerir autenticación (lectura pública).
router.get('/public/:id', async (req, res) => {
  try {
    const juego = await Juego.findById(req.params.id);
    if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(juego);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener juego' });
  }
});

// Lista los juegos pertenecientes al usuario autenticado.
router.get('/', auth, async (req, res) => {
  try {
    const juegos = await Juego.find({ usuario: req.userId });
    res.json(juegos);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener juegos' });
  }
});

// Obtiene un juego del usuario autenticado por id.
router.get('/:id', auth, async (req, res) => {
  try {
    const juego = await Juego.findOne({ _id: req.params.id, usuario: req.userId });
    if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(juego);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener juego' });
  }
});

// Crea un juego en la biblioteca personal del usuario.
// También intenta crear la entrada en el catálogo si no existe.
router.post('/', auth, async (req, res) => {
  try {
    const { titulo, genero, plataforma, portada, horasJugadas, completado, puntuacion } = req.body;
    if (!titulo || !titulo.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    const tituloTrim = titulo.trim();
    const plataformaTrim = (plataforma || '').trim();

    // Comprobamos si ya existe en la biblioteca personal (comparación insensible a mayúsculas/acentos).
    const yaExistePersonal = await Juego.findOne({
      usuario: req.userId,
      titulo: tituloTrim,
      plataforma: plataformaTrim
    }).collation({ locale: 'es', strength: 2 });
    if (yaExistePersonal) {
      return res.json({ ok: true, mensaje: 'Ya está en tu biblioteca', juego: yaExistePersonal });
    }

    // Comprobamos si ya existe en el catálogo general.
    const yaExisteCatalogo = await JuegoCatalogo.findOne({
      titulo: tituloTrim,
      plataforma: plataformaTrim
    }).collation({ locale: 'es', strength: 2 });

    if (!yaExisteCatalogo) {
      try {
        await JuegoCatalogo.create({
          titulo: tituloTrim,
          plataforma: plataformaTrim,
          genero: (genero || '').trim(),
          portada
        });
      } catch (e) {
        // Si falla por índice único, simplemente lo ignoramos.
      }
    }

    // Creamos el juego personal con los datos enviados.
    const nuevo = new Juego({
      usuario: req.userId,
      titulo: tituloTrim,
      genero,
      plataforma: plataformaTrim,
      portada,
      horasJugadas,
      completado,
      puntuacion
    });
    const guardado = await nuevo.save();
    res.status(201).json(guardado);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear juego' });
  }
});

// Actualiza campos del juego del usuario autenticado.
router.put('/:id', auth, async (req, res) => {
  try {
    const campos = req.body;
    const actualizado = await Juego.findOneAndUpdate(
      { _id: req.params.id, usuario: req.userId },
      campos,
      { new: true }
    );
    if (!actualizado) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(actualizado);
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar juego' });
  }
});

// Actualiza la puntuación (estrellas) de un juego.
router.put('/:id/puntuacion', auth, async (req, res) => {
  try {
    const { valor } = req.body;
    const actualizado = await Juego.findOneAndUpdate(
      { _id: req.params.id, usuario: req.userId },
      { puntuacion: valor },
      { new: true }
    );
    if (!actualizado) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(actualizado);
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar puntuación' });
  }
});

// Elimina un juego de la biblioteca personal.
router.delete('/:id', auth, async (req, res) => {
  try {
    const eliminado = await Juego.findOneAndDelete({ _id: req.params.id, usuario: req.userId });
    if (!eliminado) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al borrar juego' });
  }
});

module.exports = router;