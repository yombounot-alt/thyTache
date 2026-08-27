const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./config/env');
const logger = require('./config/logger');
const corsOptions = require('./config/cors');
const swaggerSpec = require('./config/swagger');

const { globalLimiter } = require('./middlewares/rateLimiters');
const sanitizeInputs = require('./middlewares/sanitize');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

const routes = require('./routes');

const app = express();

// Nécessaire derrière un proxy/load balancer (IP réelle pour le rate limiting, cookies secure, etc.)
app.set('trust proxy', 1);

// Sécurité HTTP de base
app.use(helmet());
app.use(cors(corsOptions));
app.use(hpp());

// Compression des réponses
app.use(compression());

// Logs HTTP
app.use(morgan(env.isProduction ? 'combined' : 'dev', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Parsing du corps des requêtes avec limite de taille
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.jsonBodyLimit }));
app.use(cookieParser(env.cookie.secret));

// Sanitization générique des entrées (ne remplace pas la validation métier)
app.use(sanitizeInputs);

// Rate limiting global (des limiteurs plus stricts sont appliqués par route sensible)
app.use(globalLimiter);

// Documentation Swagger / OpenAPI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Fichiers uploadés (avatars). Cross-Origin-Resource-Policy: cross-origin
// nécessaire ici pour que le frontend (autre origine en dev) puisse charger
// ces images dans une balise <img> — Helmet met "same-origin" par défaut,
// ce qui bloquerait silencieusement l'affichage sinon.
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, '..', 'uploads'))
);

// Routes applicatives versionnées
app.use(env.apiPrefix, routes);

// 404 puis gestion centralisée des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
