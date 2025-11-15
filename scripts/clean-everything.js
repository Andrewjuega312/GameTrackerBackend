// Script para limpiar completamente la base de datos.
// Borra usuarios, juegos, reseñas, listas y catálogo.
const mongoose = require('mongoose')
require('dotenv').config()
const Juego = require('../models/Juego')
const JuegoCatalogo = require('../models/JuegoCatalogo')
const Resena = require('../models/Resena')
const Lista = require('../models/Lista')
const Usuario = require('../models/Usuario')

const uri = process.env.MONGODB_URI || 'mongodb+srv://andresfelipemontesm_db_user:CiWjn3UdHzv3qlch@cluster0.py0qlkw.mongodb.net/GameTracker_Backend'

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  // Eliminamos todo en cada colección relevante.
  const rJuego = await Juego.deleteMany({})
  const rCat = await JuegoCatalogo.deleteMany({})
  const rRes = await Resena.deleteMany({})
  const rLis = await Lista.deleteMany({})
  const rUsu = await Usuario.deleteMany({})
  console.log(JSON.stringify({ juegos_borrados: rJuego.deletedCount, catalogo_borrados: rCat.deletedCount, resenas_borradas: rRes.deletedCount, listas_borradas: rLis.deletedCount, usuarios_borrados: rUsu.deletedCount }))
  await mongoose.disconnect()
}

main().catch(async (e) => { console.error(e?.message || e); try { await mongoose.disconnect() } catch {} process.exit(1) })