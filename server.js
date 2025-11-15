// Servidor principal del backend.
// Aquí configuramos Express, CORS, las rutas y la conexión a MongoDB.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();
// Importamos rutas (endpoints) agrupadas por tema.
const juegosRoutes = require('./routes/juegos');
const resenasRoutes = require('./routes/resenas');
const authRoutes = require('./routes/auth');
const listasRoutes = require('./routes/listas');
const favoritosRoutes = require('./routes/favoritos');
const catalogoRoutes = require('./routes/catalogo');
const Juego = require('./models/Juego');
const JuegoCatalogo = require('./models/JuegoCatalogo');

const app = express();
// Variables de entorno con valores por defecto para desarrollo.
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://andresfelipemontesm_db_user:CiWjn3UdHzv3qlch@cluster0.py0qlkw.mongodb.net/GameTracker_Backend';
// Permitimos CORS solo desde los orígenes definidos.
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174';
const origins = CORS_ORIGIN.split(',').map(s => s.trim());

// Configuración de CORS: valida que el origen esté permitido.
app.use(cors({
  origin: function (origin, cb) {
    // Si la petición no tiene origen (por ejemplo, Postman), permitimos.
    if (!origin) return cb(null, true);
    // Si el origen está en la lista, permitimos.
    if (origins.includes(origin)) return cb(null, true);
    // Si no, rechazamos la petición.
    cb(new Error('No permitido'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON en los cuerpos de las peticiones.
app.use(express.json({ limit: '10mb' }));

// Montamos rutas bajo el prefijo /api
app.use('/api/juegos', juegosRoutes);
app.use('/api/resenas', resenasRoutes);      // alias sin tilde
app.use('/api/reseñas', resenasRoutes);      // alias con tilde
app.use('/api/auth', authRoutes);
app.use('/api/listas', listasRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/catalogo-juegos', catalogoRoutes);

// Endpoint simple para verificar salud del servidor.
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Conexión a la base de datos y limpieza de duplicados al iniciar.
const uri = MONGODB_URI;
const opts = { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000, retryWrites: true, w: 'majority' };
function connect() {
  mongoose.connect(uri, opts)
    .then(async () => {
      console.log('Conectado correctamente a MongoDB Atlas');
      try {
        // Al iniciar, intentamos eliminar duplicados para mantener datos limpios.
        await limpiarDuplicados();
      } catch (e) {
        console.error('Error al limpiar duplicados:', e?.message || e);
      }
    })
    .catch(err => console.error('Error de MongoDB:', err.message));
}
// Si se pierde la conexión, intentamos reconectar automáticamente.
mongoose.connection.on('disconnected', () => connect());
connect();

// Iniciamos el servidor HTTP.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Convierte un texto a minúsculas sin espacios extra.
function normalizar(texto) {
  if (!texto) return '';
  return String(texto).trim().toLowerCase();
}

// Elimina juegos duplicados en catálogo y en bibliotecas personales.
// La clave de duplicado se basa en (titulo, plataforma) normalizados.
async function limpiarDuplicados() {
  // 1) Catálogo general
  const todosCatalogo = await JuegoCatalogo.find({}).sort({ createdAt: 1 });
  const vistosCatalogo = new Set();
  const aBorrarCatalogo = [];
  for (const j of todosCatalogo) {
    const clave = normalizar(j.titulo) + '|' + normalizar(j.plataforma);
    if (vistosCatalogo.has(clave)) {
      aBorrarCatalogo.push(j._id);
    } else {
      vistosCatalogo.add(clave);
    }
  }
  if (aBorrarCatalogo.length) {
    await JuegoCatalogo.deleteMany({ _id: { $in: aBorrarCatalogo } });
    console.log(`Catálogo: borrados duplicados (${aBorrarCatalogo.length}).`);
  }

  // 2) Juegos personales por usuario
  const todosPersonales = await Juego.find({}).sort({ createdAt: 1 });
  const mapaUsuarios = new Map();
  const aBorrarPersonales = [];
  for (const j of todosPersonales) {
    const u = String(j.usuario);
    const clave = normalizar(j.titulo) + '|' + normalizar(j.plataforma);
    if (!mapaUsuarios.has(u)) mapaUsuarios.set(u, new Set());
    const set = mapaUsuarios.get(u);
    if (set.has(clave)) {
      aBorrarPersonales.push(j._id);
    } else {
      set.add(clave);
    }
  }
  if (aBorrarPersonales.length) {
    await Juego.deleteMany({ _id: { $in: aBorrarPersonales } });
    console.log(`Personales: borrados duplicados (${aBorrarPersonales.length}).`);
  }
}