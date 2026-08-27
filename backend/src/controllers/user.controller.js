const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');
const { toPublicUser } = require('../utils/publicUser');
const { ForbiddenError, BadRequestError } = require('../errors');
const { deleteLocalAvatar } = require('../config/upload');

const listUsers = catchAsync(async (req, res) => {
  const result = await userService.listUsers(req.query);
  sendSuccess(res, { data: { ...result, data: result.data.map(toPublicUser) } });
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUser(req.params.id);
  sendSuccess(res, { data: toPublicUser(user) });
});

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  sendSuccess(res, { statusCode: 201, message: 'Utilisateur créé avec succès.', data: toPublicUser(user) });
});

// Un utilisateur peut modifier son propre profil ; modifier celui d'un
// autre reste réservé à un admin (la route n'a plus de garde
// authorize('admin') au niveau routeur : la distinction se fait ici,
// selon l'identité, comme le reste du RBAC de ce projet).
const updateUser = catchAsync(async (req, res) => {
  const isSelf = req.params.id === req.user.id;
  if (!isSelf && req.user.role !== 'admin') {
    throw new ForbiddenError('Vous n\'avez pas les droits nécessaires');
  }

  const allowed = ['firstName', 'lastName', 'email', 'phone', 'avatarUrl', 'preferences'];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await userService.updateUser(req.params.id, patch);
  sendSuccess(res, { message: 'Utilisateur mis à jour avec succès.', data: toPublicUser(user) });
});

// Toujours sur soi-même (req.user.id, pas de :id dans l'URL) : uploader
// l'avatar d'un autre utilisateur n'a pas de cas d'usage ici.
const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Aucun fichier reçu');
  }

  const previousAvatarUrl = req.user.avatarUrl;
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await userService.updateUser(req.user.id, { avatarUrl });
  deleteLocalAvatar(previousAvatarUrl);

  sendSuccess(res, { message: 'Photo de profil mise à jour.', data: toPublicUser(user) });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, { message: 'Utilisateur supprimé avec succès.' });
});

const setStatus = catchAsync(async (req, res) => {
  const user = await userService.setStatus(req.params.id, req.body.isActive);
  sendSuccess(res, { data: toPublicUser(user) });
});

const setRole = catchAsync(async (req, res) => {
  const user = await userService.setRole(req.params.id, req.body.role);
  sendSuccess(res, { data: toPublicUser(user) });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await userService.resetPassword(req.params.id);
  sendSuccess(res, { data: result });
});

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  uploadAvatar,
  deleteUser,
  setStatus,
  setRole,
  resetPassword,
};
