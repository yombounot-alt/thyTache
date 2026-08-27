const { env } = require('../config/env');
const logger = require('../config/logger');
const httpStatus = require('../constants/httpStatus');
const { AppError } = require('../errors');
const { sendError } = require('../utils/apiResponse');

function normalizeError(err) {
  if (err instanceof AppError) {
    return err;
  }

  if (err.name === 'JsonWebTokenError') {
    return new AppError('Jeton d\'authentification invalide', httpStatus.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('Jeton d\'authentification expiré', httpStatus.UNAUTHORIZED);
  }

  if (err.type === 'entity.too.large') {
    return new AppError('Charge utile trop volumineuse', httpStatus.BAD_REQUEST);
  }

  if (err.type === 'entity.parse.failed') {
    return new AppError('Corps de requête JSON invalide', httpStatus.BAD_REQUEST);
  }

  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (2 Mo maximum)' : 'Fichier invalide';
    return new AppError(message, httpStatus.BAD_REQUEST);
  }

  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const known = normalizeError(err);
  const isOperational = Boolean(known);
  const error = known || err;

  const statusCode = isOperational ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR;
  const errors = isOperational && error.errors ? error.errors : [];

  if (isOperational) {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode}: ${error.message}`);
  } else {
    logger.error(err);
  }

  const message =
    isOperational || !env.isProduction
      ? error.message
      : 'Une erreur interne est survenue';

  sendError(res, {
    statusCode,
    message,
    errors: env.isProduction && !isOperational ? [] : errors,
  });
}

module.exports = errorHandler;
