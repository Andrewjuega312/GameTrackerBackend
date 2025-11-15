// Este modelo describe cómo guardamos a los usuarios en la base de datos.
// Es como una plantilla con los campos que cada usuario tiene.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  // El nombre que el usuario verá en la app.
  nombre: { type: String, required: true },
  // El email, que debe ser único para evitar duplicados.
  email: { type: String, required: true, unique: true, lowercase: true },
  // La contraseña (nota: aquí está sin encriptar; se podría mejorar con bcrypt).
  password: { type: String, required: true },
  // El rol sirve por si queremos tener administradores.
  rol: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Lista de juegos favoritos del usuario.
  favoritos: [{ type: Schema.Types.ObjectId, ref: 'Juego' }]
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);