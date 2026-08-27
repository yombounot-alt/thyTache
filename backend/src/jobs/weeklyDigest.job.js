const userRepository = require('../repositories/user.repository');
const taskRepository = require('../repositories/task.repository');
const emailService = require('../services/email.service');
const logger = require('../config/logger');

function scopeFilter(userId) {
  return { $or: [{ creator: userId }, { assignee: userId }] };
}

async function buildDigestForUser(userId) {
  const tasks = await taskRepository.findMany(scopeFilter(userId), { skip: 0, limit: 0, sort: {} });
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600_000);

  return {
    total: tasks.length,
    completedThisWeek: tasks.filter((t) => t.completedAt && t.completedAt >= weekAgo).length,
    createdThisWeek: tasks.filter((t) => t.createdAt >= weekAgo).length,
    inProgress: tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length,
    overdue: tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < now).length,
  };
}

// Envoie un résumé hebdomadaire par e-mail à chaque utilisateur actif ayant
// activé la préférence `weeklyDigest` (Profil > Préférences).
async function sendWeeklyDigests() {
  const users = await userRepository.findMany();
  const optedIn = users.filter((u) => u.isActive && u.preferences.weeklyDigest);

  for (const user of optedIn) {
    const stats = await buildDigestForUser(user.id);
    await emailService.sendWeeklyDigestEmail(user.email, { firstName: user.firstName, ...stats });
  }

  if (optedIn.length > 0) {
    logger.info(`Résumé hebdomadaire envoyé à ${optedIn.length} utilisateur(s).`);
  }

  return optedIn.length;
}

module.exports = { sendWeeklyDigests, buildDigestForUser };
