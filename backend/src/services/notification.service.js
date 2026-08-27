const notificationRepository = require('../repositories/notification.repository');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
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
//
// Respecte les deux préférences indépendantes du profil utilisateur :
// - pushNotifications : crée (ou non) la notification in-app (cloche) ;
// - emailNotifications : envoie (ou non) une copie par e-mail, en plus.
// Les deux peuvent être actives, inactives, ou combinées différemment.
async function notify(userId, { type, title, message, link }) {
  if (!userId) return null;

  const user = await userRepository.findById(userId);
  if (!user) return null;

  const notification = user.preferences.pushNotifications
    ? await notificationRepository.create({ user: userId, type, title, message, link })
    : null;

  if (user.preferences.emailNotifications) {
    await emailService.sendNotificationEmail(user.email, { title, message });
  }

  return notification;
}

module.exports = { listNotifications, markAsRead, markAllAsRead, notify };
