// Este modelo guarda una reseña (opinión) sobre un juego.
// Tiene el autor, el texto y cuántas estrellas le puso.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resenaSchema = new Schema({
  juegoId: {
    type: Schema.Types.ObjectId,
    ref: 'Juego',
    required: true
  },
  autor: {
    type: String,
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  estrellas: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resena', resenaSchema);