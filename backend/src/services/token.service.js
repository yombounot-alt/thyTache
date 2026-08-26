const { randomUUID } = require('crypto');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  decodeToken,
} = require('../utils/jwt');
const { sha256 } = require('../utils/hash');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const { UnauthorizedError } = require('../errors');

function buildAccessPayload(user) {
  return { sub: user.id.toString(), role: user.role };
}

/**
 * Émet une nouvelle paire access/refresh token et persiste le hash du refresh
 * token (jamais sa valeur brute) afin de pouvoir le révoquer individuellement.
 */
async function issueTokenPair(user) {
  const accessToken = signAccessToken(buildAccessPayload(user));
  const refreshToken = signRefreshToken({ sub: user.id.toString(), jti: randomUUID() });
  const { exp } = decodeToken(refreshToken);
  const refreshTokenExpiresAt = new Date(exp * 1000);

  await refreshTokenRepository.create({
    user: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: refreshTokenExpiresAt,
  });

  return { accessToken, refreshToken, refreshTokenExpiresAt };
}

/**
 * Valide un refresh token (signature + expiration + présence non révoquée en base)
 * puis le révoque : la rotation impose qu'un refresh token ne serve qu'une seule fois.
 */
async function consumeRefreshToken(rawToken) {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new UnauthorizedError('Refresh token invalide ou expiré');
  }

  const tokenHash = sha256(rawToken);
  const stored = await refreshTokenRepository.findValidByHash(tokenHash);

  if (!stored) {
    throw new UnauthorizedError('Refresh token invalide, expiré ou révoqué');
  }

  await refreshTokenRepository.revokeByHash(tokenHash);

  return { userId: payload.sub };
}

async function revokeRefreshToken(rawToken) {
  await refreshTokenRepository.revokeByHash(sha256(rawToken));
}

async function revokeAllUserTokens(userId) {
  await refreshTokenRepository.revokeAllForUser(userId);
}

module.exports = { issueTokenPair, consumeRefreshToken, revokeRefreshToken, revokeAllUserTokens };
