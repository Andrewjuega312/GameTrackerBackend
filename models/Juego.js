// Este modelo es la forma en que guardamos cada juego.
// Aquí definimos campos como título, género, si está completado, etc.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const juegoSchema = new Schema({
  // Referencia al dueño de este juego (usuario autenticado)
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  genero: {
    type: String,
    default: ''
  },
  plataforma: {
    type: String,
    default: ''
  },
  portada: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  horasJugadas: {
    type: Number,
    default: 0
  },
  completado: {
    type: Boolean,
    default: false
  },
  puntuacion: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  resenas: [{
    type: Schema.Types.ObjectId,
    ref: 'Resena'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Juego', juegoSchema);