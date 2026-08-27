const { env, validateEnv } = require('./config/env');
const logger = require('./config/logger');
const { connectDB, disconnectDB } = require('./config/database');
const { startScheduler } = require('./config/scheduler');
const app = require('./app');

let server;

async function start() {
  try {
    validateEnv();

    // La connexion MongoDB doit réussir avant que le serveur n'accepte des requêtes.
    await connectDB();

    server = app.listen(env.port, () => {
      logger.info(`${env.appName} démarré sur le port ${env.port} (env: ${env.nodeEnv})`);
      logger.info(`Documentation API disponible sur /api-docs`);
    });

    startScheduler();
  } catch (error) {
    logger.error(`Démarrage impossible: ${error.message}`);
    process.exit(1);
  }
}

function shutdown(signal) {
  logger.info(`${signal} reçu, arrêt gracieux du serveur...`);

  if (!server) {
    process.exit(0);
    return;
  }

  server.close(async () => {
    await disconnectDB();
    logger.info('Serveur et connexion MongoDB arrêtés proprement.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

start();
