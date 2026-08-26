const RefreshToken = require('../models/RefreshToken');

function create(data) {
  return RefreshToken.create(data);
}

function findValidByHash(tokenHash) {
  return RefreshToken.findOne({ tokenHash, revoked: false, expiresAt: { $gt: new Date() } });
}

function revokeByHash(tokenHash) {
  return RefreshToken.updateOne({ tokenHash }, { revoked: true, revokedAt: new Date() });
}

function revokeAllForUser(userId) {
  return RefreshToken.updateMany({ user: userId, revoked: false }, { revoked: true, revokedAt: new Date() });
}

module.exports = { create, findValidByHash, revokeByHash, revokeAllForUser };
