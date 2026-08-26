const userRepository = require('../repositories/user.repository');
const otpService = require('./otp.service');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const { BadRequestError, UnauthorizedError, ConflictError, ForbiddenError } = require('../errors');

const EMAIL_VERIFICATION = 'email_verification';
const PASSWORD_RESET = 'password_reset';

/**
 * Inscription publique : le rôle n'est jamais lu depuis l'entrée utilisateur,
 * il est fixé ici à 'member'. La promotion en 'manager'/'admin' n'est pas exposée par cette route.
 */
async function register({ firstName, lastName, email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ConflictError('Un compte existe déjà avec cette adresse e-mail');
  }

  const user = await userRepository.create({
    firstName,
    lastName,
    email,
    password,
    role: 'member',
    isEmailVerified: false,
  });

  const code = await otpService.issueOtp(user._id, EMAIL_VERIFICATION);
  await emailService.sendOtpEmail(user.email, code, { purpose: EMAIL_VERIFICATION });
}

async function verifyEmail({ email, otp }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new BadRequestError('Code de vérification invalide ou expiré');
  }

  if (user.isEmailVerified) {
    throw new ConflictError('Cette adresse e-mail est déjà vérifiée');
  }

  await otpService.verifyOtp(user._id, EMAIL_VERIFICATION, otp);

  user.isEmailVerified = true;
  await user.save();
}

async function resendOtp({ email }) {
  const user = await userRepository.findByEmail(email);

  // Réponse neutre côté contrôleur dans tous les cas : on ne révèle jamais
  // si le compte existe ou est déjà vérifié.
  if (!user || user.isEmailVerified) {
    return;
  }

  const canResend = await otpService.canResendOtp(user._id, EMAIL_VERIFICATION);
  if (!canResend) {
    throw new BadRequestError('Veuillez patienter avant de demander un nouveau code');
  }

  const code = await otpService.issueOtp(user._id, EMAIL_VERIFICATION);
  await emailService.sendOtpEmail(user.email, code, { purpose: EMAIL_VERIFICATION });
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email, { withPassword: true });

  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Identifiants invalides');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Ce compte a été désactivé');
  }

  if (!user.isEmailVerified) {
    throw new ForbiddenError('Adresse e-mail non vérifiée');
  }

  user.lastLogin = new Date();
  await user.save();

  const tokens = await tokenService.issueTokenPair(user);

  return { user, tokens };
}

async function refresh(rawToken) {
  if (!rawToken) {
    throw new UnauthorizedError('Refresh token manquant');
  }

  const { userId } = await tokenService.consumeRefreshToken(rawToken);
  const user = await userRepository.findById(userId);

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Utilisateur introuvable ou inactif');
  }

  return tokenService.issueTokenPair(user);
}

async function logout(rawToken) {
  if (rawToken) {
    await tokenService.revokeRefreshToken(rawToken);
  }
}

async function forgotPassword({ email }) {
  const user = await userRepository.findByEmail(email);
  if (!user) return;

  const canResend = await otpService.canResendOtp(user._id, PASSWORD_RESET);
  if (!canResend) return;

  const code = await otpService.issueOtp(user._id, PASSWORD_RESET);
  await emailService.sendOtpEmail(user.email, code, { purpose: PASSWORD_RESET });
}

async function resetPassword({ email, otp, newPassword }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new BadRequestError('Code de vérification invalide ou expiré');
  }

  await otpService.verifyOtp(user._id, PASSWORD_RESET, otp);

  user.password = newPassword;
  await user.save();

  await tokenService.revokeAllUserTokens(user._id);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId, { withPassword: true });

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new BadRequestError('Mot de passe actuel incorrect');
  }

  user.password = newPassword;
  await user.save();

  await tokenService.revokeAllUserTokens(user._id);
}

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
