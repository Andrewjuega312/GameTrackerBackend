// Script de reseteo total: borra TODO incluyendo usuarios y catálogo.
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
  const r1 = await Juego.deleteMany({})
  const r2 = await JuegoCatalogo.deleteMany({})
  const r3 = await Resena.deleteMany({})
  const r4 = await Lista.deleteMany({})
  const r5 = await Usuario.deleteMany({})
  console.log(JSON.stringify({ juego: r1.deletedCount, catalogo: r2.deletedCount, resena: r3.deletedCount, lista: r4.deletedCount, usuario: r5.deletedCount }))
  await mongoose.disconnect()
}

main().catch(async (e) => { console.error(e?.message || e); try { await mongoose.disconnect() } catch {} process.exit(1) })