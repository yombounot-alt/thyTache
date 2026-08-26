const notificationRepository = require('../repositories/notification.repository');
const { NotFoundError } = require('../errors');

async function listNotifications(userId) {
  return notificationRepository.findByUser(userId);
}

async function markAsRead(id, userId) {
  const notification = await notificationRepository.findById(id);
  if (!notification || String(notification.user) !== String(userId)) {
    throw new NotFoundError('Notification introuvable');
  }

  notification.read = true;
  await notification.save();
  return notification;
}

async function markAllAsRead(userId) {
  await notificationRepository.markAllAsRead(userId);
}

// Utilisée en interne par les autres services (ex: task.service.js) pour
// notifier un utilisateur suite à un événement métier réel. N'est pas exposée
// via une route publique : une notification n'a de sens que rattachée à un
// événement déclenché côté serveur.
async function notify(userId, { type, title, message, link }) {
  if (!userId) return null;
  return notificationRepository.create({ user: userId, type, title, message, link });
}

module.exports = { listNotifications, markAsRead, markAllAsRead, notify };
