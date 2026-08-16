const Verification = require('../models/Verification');

/**
 * Invalide tous les OTP encore actifs d'un utilisateur pour un usage donné.
 * Appelé avant l'émission d'un nouveau code afin qu'un seul OTP actif existe à la fois.
 */
function invalidateActive(userId, purpose) {
  return Verification.updateMany({ user: userId, purpose, used: false }, { $set: { used: true } });
}

function create(data) {
  return Verification.create(data);
}

function findLatestActive(userId, purpose) {
  return Verification.findOne({ user: userId, purpose, used: false }).sort({ createdAt: -1 });
}

function incrementAttempts(id) {
  return Verification.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { returnDocument: 'after' });
}

function markUsed(id) {
  return Verification.findByIdAndUpdate(id, { used: true }, { returnDocument: 'after' });
}

module.exports = { invalidateActive, create, findLatestActive, incrementAttempts, markUsed };
