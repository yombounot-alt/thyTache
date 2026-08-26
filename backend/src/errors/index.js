const httpStatus = require('../constants/httpStatus');
const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message = 'Requête invalide', errors = []) {
    super(message, httpStatus.BAD_REQUEST, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentification requise', errors = []) {
    super(message, httpStatus.UNAUTHORIZED, errors);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé', errors = []) {
    super(message, httpStatus.FORBIDDEN, errors);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ressource introuvable', errors = []) {
    super(message, httpStatus.NOT_FOUND, errors);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit sur la ressource', errors = []) {
    super(message, httpStatus.CONFLICT, errors);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Données invalides', errors = []) {
    super(message, httpStatus.UNPROCESSABLE_ENTITY, errors);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};
