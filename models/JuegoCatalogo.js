// Catálogo general de juegos (no depende de usuario)
// Guardamos datos simples: título, plataforma, portada y género.
const mongoose = require('mongoose');

const JuegoCatalogoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  plataforma: { type: String, required: true },
  genero: { type: String },
  portada: { type: String },
}, { timestamps: true });

// Índice para evitar duplicados por (titulo, plataforma) normalizados.
JuegoCatalogoSchema.index({ titulo: 1, plataforma: 1 }, { unique: true });

module.exports = mongoose.model('JuegoCatalogo', JuegoCatalogoSchema);