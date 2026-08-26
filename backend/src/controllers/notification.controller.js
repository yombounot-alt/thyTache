const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification.service');

const listNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.listNotifications(req.user.id);
  sendSuccess(res, { data: notifications });
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  sendSuccess(res, { data: notification });
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  sendSuccess(res, { message: 'Notifications marquées comme lues.' });
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
