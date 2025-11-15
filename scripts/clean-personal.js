const mongoose = require('mongoose')
require('dotenv').config()
const Juego = require('../models/Juego')
const Usuario = require('../models/Usuario')

const uri = process.env.MONGODB_URI || 'mongodb+srv://andresfelipemontesm_db_user:CiWjn3UdHzv3qlch@cluster0.py0qlkw.mongodb.net/GameTracker_Backend'

async function main() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  const r1 = await Juego.deleteMany({})
  const r2 = await Usuario.updateMany({}, { $set: { favoritos: [] } })
  console.log(JSON.stringify({ juegos_personales_borrados: r1.deletedCount, usuarios_favoritos_vaciar: r2.modifiedCount }))
  await mongoose.disconnect()
}

main().catch(async (e) => { console.error(e?.message || e); try { await mongoose.disconnect() } catch {} process.exit(1) })