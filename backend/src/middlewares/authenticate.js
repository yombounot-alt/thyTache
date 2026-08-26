const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../errors');
const catchAsync = require('../utils/catchAsync');
const userRepository = require('../repositories/user.repository');

/**
 * Middleware de vérification du JWT (Authorization: Bearer <token>).
 * Recharge l'utilisateur depuis la base (pas seulement le payload signé) afin
 * de détecter un compte désactivé ou supprimé après émission du token, et
 * attache le document à req.user pour les routes protégées / le futur contrôle d'accès (Point 4).
 */
const authenticate = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Jeton d\'authentification manquant');
  }

  const token = header.split(' ')[1];

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError('Jeton d\'authentification invalide ou expiré');
  }

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new UnauthorizedError('Utilisateur introuvable');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Ce compte a été désactivé');
  }

  req.auth = payload;
  req.user = user;
  next();
});

module.exports = authenticate;
