const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');
const { toPublicUser } = require('../utils/publicUser');

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

const updateUser = catchAsync(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'email', 'phone', 'avatarUrl', 'preferences'];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await userService.updateUser(req.params.id, patch);
  sendSuccess(res, { message: 'Utilisateur mis à jour avec succès.', data: toPublicUser(user) });
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

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, setStatus, setRole, resetPassword };
