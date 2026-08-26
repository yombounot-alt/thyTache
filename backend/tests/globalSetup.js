const { MongoMemoryServer } = require('mongodb-memory-server');

// Démarre une instance MongoDB en mémoire, partagée par toute la suite Jest
// (exécutée avec --runInBand, donc un seul process Node : global.__MONGOD__
// reste accessible depuis globalTeardown.js).
module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  global.__MONGOD__ = mongod;
  process.env.MONGODB_URI_TEST = mongod.getUri('task_management_test');
};
