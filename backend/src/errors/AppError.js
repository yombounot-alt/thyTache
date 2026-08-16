const httpStatus = require('../constants/httpStatus');

/**
 * Erreur opérationnelle attendue (entrée invalide, ressource absente, etc.)
 * À distinguer des erreurs de programmation (bugs) qui remontent en tant qu'erreurs internes.
 */
class AppError extends Error {
  constructor(message, statusCode = httpStatus.INTERNAL_SERVER_ERROR, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
