const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('./logger');

const READY_STATE_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Masque les identifiants éventuels d'une URI MongoDB avant journalisation
 * (ex: mongodb+srv://user:pass@cluster/db -> mongodb+srv://cluster/db).
 */
function maskUri(uri) {
  try {
    const { protocol, host, pathname } = new URL(uri);
    return `${protocol}//${host}${pathname}`;
  } catch {
    return '(URI illisible)';
  }
}

let listenersRegistered = false;

// Enregistrés une seule fois pour éviter les logs en double si connectDB()
// est appelé plusieurs fois (ex: tests).
function registerConnectionListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB connecté (${maskUri(env.mongodb.uri)})`);
  });

  mongoose.connection.on('error', (error) => {
    logger.error(`Erreur de connexion MongoDB: ${error.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB déconnecté');
  });
}

async function connectDB() {
  const { uri } = env.mongodb;

  if (!uri) {
    throw new Error(
      "MONGODB_URI est manquant. Définissez-le dans le fichier .env (voir .env.example)."
    );
  }

  registerConnectionListeners();

  await mongoose.connect(uri);

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

function getConnectionStatus() {
  return READY_STATE_LABELS[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, disconnectDB, getConnectionStatus };
