const { NotFoundError } = require('../errors');

function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Route introuvable: ${req.method} ${req.originalUrl}`));
}

module.exports = notFoundHandler;
