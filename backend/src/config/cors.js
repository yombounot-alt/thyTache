const { env } = require('./env');

const allowAll = env.cors.origins.length === 0 || env.cors.origins.includes('*');

const corsOptions = {
  origin(origin, callback) {
    // Autorise les requêtes sans origine (ex: outils serveur-à-serveur, curl, mobile)
    if (!origin || allowAll) {
      return callback(null, true);
    }

    if (env.cors.origins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origine CORS non autorisée: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
