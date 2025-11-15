// Este modelo es para listas personalizadas que crea el usuario.
// Por ejemplo, "Juegos para vacaciones" o "JRPG favoritos".
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listaSchema = new Schema({
  // Quién es el dueño de la lista.
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  // El nombre que le puso a su lista.
  nombre: { type: String, required: true },
  // Un texto corto para describir la lista.
  descripcion: { type: String, default: '' },
  // Los juegos que contiene esta lista.
  juegos: [{ type: Schema.Types.ObjectId, ref: 'Juego' }]
}, { timestamps: true });

module.exports = mongoose.model('Lista', listaSchema);