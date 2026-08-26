const { validationResult } = require('express-validator');
const { ValidationError } = require('../errors');

/**
 * Middleware à placer après une chaîne de règles express-validator.
 * Transforme les erreurs de validation en ValidationError standardisée.
 */
function validate(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  next(new ValidationError('Données invalides', errors));
}

module.exports = validate;
