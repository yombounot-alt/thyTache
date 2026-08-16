const crypto = require('crypto');
const { env } = require('../config/env');
const { sha256 } = require('../utils/hash');
const verificationRepository = require('../repositories/verification.repository');
const { BadRequestError } = require('../errors');

const OTP_LENGTH = 6;

function generateOtpCode() {
  const max = 10 ** OTP_LENGTH;
  return crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, '0');
}

/**
 * Invalide tout OTP actif existant pour cet usage puis en émet un nouveau.
 * Retourne le code en clair (à envoyer par e-mail immédiatement, jamais à persister).
 */
async function issueOtp(userId, purpose) {
  await verificationRepository.invalidateActive(userId, purpose);

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.otp.expiresInMinutes * 60 * 1000);

  await verificationRepository.create({
    user: userId,
    codeHash: sha256(code),
    purpose,
    expiresAt,
  });

  return code;
}

async function verifyOtp(userId, purpose, code) {
  const verification = await verificationRepository.findLatestActive(userId, purpose);

  if (!verification || verification.expiresAt.getTime() < Date.now()) {
    throw new BadRequestError('Code de vérification invalide ou expiré');
  }

  if (verification.attempts >= env.otp.maxAttempts) {
    throw new BadRequestError('Nombre maximal de tentatives atteint, veuillez demander un nouveau code');
  }

  if (verification.codeHash !== sha256(code)) {
    await verificationRepository.incrementAttempts(verification._id);
    throw new BadRequestError('Code de vérification incorrect');
  }

  await verificationRepository.markUsed(verification._id);
}

/**
 * Anti-abus : interdit de redemander un code tant que le précédent est
 * encore récent (indépendant du rate limiting par IP sur la route).
 */
async function canResendOtp(userId, purpose) {
  const verification = await verificationRepository.findLatestActive(userId, purpose);
  if (!verification) return true;

  const elapsedSeconds = (Date.now() - verification.createdAt.getTime()) / 1000;
  return elapsedSeconds >= env.otp.resendCooldownSeconds;
}

module.exports = { issueOtp, verifyOtp, canResendOtp };
