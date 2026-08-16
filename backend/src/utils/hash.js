const crypto = require('crypto');

/**
 * Hash SHA-256 générique (hex), utilisé pour les codes OTP et les refresh tokens :
 * ces valeurs ne sont jamais stockées en clair en base.
 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { sha256 };
