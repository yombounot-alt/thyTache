const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');
const httpStatus = require('../constants/httpStatus');
const { sendError } = require('../utils/apiResponse');

function rateLimitHandler(_req, res) {
  sendError(res, {
    statusCode: httpStatus.TOO_MANY_REQUESTS,
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
  });
}

const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  handler: rateLimitHandler,
});

// Limiteur renforcé pour les routes sensibles (ex: /auth/login, /auth/register)
const authLimiter = rateLimit({
  windowMs: env.authRateLimit.windowMs,
  max: env.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => env.isTest,
  handler: rateLimitHandler,
});

module.exports = { globalLimiter, authLimiter };
