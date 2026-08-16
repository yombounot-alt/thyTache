const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/database');

async function connectTestDB() {
  await connectDB();
}

async function clearTestDB() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

async function closeTestDB() {
  await disconnectDB();
}

module.exports = { connectTestDB, clearTestDB, closeTestDB };
