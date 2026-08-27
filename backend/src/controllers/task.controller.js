const httpStatus = require('../constants/httpStatus');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const taskService = require('../services/task.service');

const createTask = catchAsync(async (req, res) => {
  const { title, description, category, priority, assigneeId, dueDate, tags } = req.body;
  const task = await taskService.createTask(
    { title, description, category, priority, assigneeId, dueDate, tags },
    req.user
  );

  sendSuccess(res, {
    statusCode: httpStatus.CREATED,
    message: 'Tâche créée avec succès.',
    data: task,
  });
});

const listTasks = catchAsync(async (req, res) => {
  const { page, pageSize, sortBy, sortDir, search, status, priority, category, assigneeId, scope, deleted } = req.query;
  const result = await taskService.listTasks(
    { page, pageSize, sortBy, sortDir, search, status, priority, category, assigneeId, scope, deleted },
    req.user
  );

  sendSuccess(res, { data: result });
});

const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user);
  sendSuccess(res, { data: task });
});

const updateTask = catchAsync(async (req, res) => {
  const { title, description, category, priority, assigneeId, dueDate, tags, status, progress } = req.body;
  const task = await taskService.updateTask(
    req.params.id,
    { title, description, category, priority, assigneeId, dueDate, tags, status, progress },
    req.user
  );
  sendSuccess(res, { message: 'Tâche mise à jour avec succès.', data: task });
});

const deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user.id);
  sendSuccess(res, { message: 'Tâche supprimée avec succès.' });
});

const restoreTask = catchAsync(async (req, res) => {
  const task = await taskService.restoreTask(req.params.id, req.user.id);
  sendSuccess(res, { message: 'Tâche restaurée avec succès.', data: task });
});

const addComment = catchAsync(async (req, res) => {
  const task = await taskService.addComment(req.params.id, req.user.id, req.body.content);
  sendSuccess(res, { statusCode: httpStatus.CREATED, message: 'Commentaire ajouté.', data: task });
});

const addAttachment = catchAsync(async (req, res) => {
  const { name, sizeKb, type } = req.body;
  const task = await taskService.addAttachment(req.params.id, req.user.id, { name, sizeKb, type });
  sendSuccess(res, { statusCode: httpStatus.CREATED, message: 'Pièce jointe ajoutée.', data: task });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await taskService.getStats(req.user, req.query.scope);
  sendSuccess(res, { data: stats });
});

const getEvolution = catchAsync(async (req, res) => {
  const days = Number(req.query.days) || 14;
  const evolution = await taskService.getEvolution(req.user, days, req.query.scope);
  sendSuccess(res, { data: evolution });
});

const getStatusDistribution = catchAsync(async (req, res) => {
  const distribution = await taskService.getStatusDistribution(req.user, req.query.scope);
  sendSuccess(res, { data: distribution });
});

const getAssigneeDistribution = catchAsync(async (req, res) => {
  const distribution = await taskService.getAssigneeDistribution(req.user, req.query.scope);
  sendSuccess(res, { data: distribution });
});

const getRecentActivity = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const activity = await taskService.getRecentActivity(req.user, limit, req.query.scope);
  sendSuccess(res, { data: activity });
});

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  restoreTask,
  addComment,
  addAttachment,
  getStats,
  getEvolution,
  getStatusDistribution,
  getAssigneeDistribution,
  getRecentActivity,
};
