const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db('testowy');
  console.log('✅ Połączono z MongoDB');
  return db;
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };