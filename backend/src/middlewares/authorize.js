const { ForbiddenError } = require('../errors');

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Vous n\'avez pas les droits nécessaires'));
    }

    return next();
  };
}

module.exports = authorize;