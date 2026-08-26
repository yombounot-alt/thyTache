const Notification = require('../models/Notification');

function create(data) {
  return Notification.create(data);
}

function findByUser(userId, { limit = 50 } = {}) {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
}

function findById(id) {
  return Notification.findById(id);
}

function markAllAsRead(userId) {
  return Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
}

module.exports = { create, findByUser, findById, markAllAsRead };
