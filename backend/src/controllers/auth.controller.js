const httpStatus = require('../constants/httpStatus');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const { toPublicUser } = require('../utils/publicUser');
const { env } = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';

function refreshCookieOptions(expires) {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    signed: true,
    expires,
  };
}

function setRefreshCookie(res, token, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions(expiresAt));
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
}

function getRawRefreshToken(req) {
  return req.signedCookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
}

const register = catchAsync(async (req, res) => {
  // Seuls ces champs sont transmis au service : un éventuel `role` envoyé par
  // le client est ignoré, empêchant toute auto-promotion en admin.
  const { firstName, lastName, email, password } = req.body;
  await authService.register({ firstName, lastName, email, password });

  sendSuccess(res, {
    statusCode: httpStatus.CREATED,
    message: 'Compte créé. Un code de vérification a été envoyé à votre adresse e-mail.',
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyEmail({ email, otp });
  sendSuccess(res, { message: 'Adresse e-mail vérifiée avec succès.' });
});

const resendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.resendOtp({ email });
  sendSuccess(res, {
    message: 'Si un compte non vérifié existe pour cette adresse, un nouveau code a été envoyé.',
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login({ email, password });

  setRefreshCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);

  sendSuccess(res, {
    message: 'Connexion réussie.',
    data: {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const rawToken = getRawRefreshToken(req);
  const tokens = await authService.refresh(rawToken);

  setRefreshCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);

  sendSuccess(res, {
    message: 'Token rafraîchi avec succès.',
    data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
  });
});

const logout = catchAsync(async (req, res) => {
  const rawToken = getRawRefreshToken(req);
  await authService.logout(rawToken);
  clearRefreshCookie(res);
  sendSuccess(res, { message: 'Déconnexion réussie.' });
});

const me = catchAsync(async (req, res) => {
  sendSuccess(res, { data: toPublicUser(req.user) });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword({ email });
  sendSuccess(res, {
    message: 'Si cette adresse correspond à un compte, les instructions de réinitialisation ont été envoyées.',
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword({ email, otp, newPassword });
  sendSuccess(res, { message: 'Mot de passe réinitialisé avec succès.' });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, { currentPassword, newPassword });
  sendSuccess(res, { message: 'Mot de passe modifié avec succès.' });
});

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
};
