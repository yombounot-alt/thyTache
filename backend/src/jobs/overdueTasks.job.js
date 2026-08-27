const Task = require('../models/Task');
const notificationService = require('../services/notification.service');
const logger = require('../config/logger');

// Notifie l'assigné (ou le créateur si non assignée) de chaque tâche dont
// l'échéance est dépassée, une seule fois par tâche : `overdueNotifiedAt`
// (levé par task.service.updateTask dès que la date ou le statut change)
// sert de verrou pour ne pas renotifier à chaque exécution du job.
async function checkOverdueTasks() {
  const now = new Date();
  const overdueTasks = await Task.find({
    isDeleted: false,
    status: { $ne: 'done' },
    dueDate: { $ne: null, $lt: now },
    overdueNotifiedAt: null,
  });

  for (const task of overdueTasks) {
    const recipientId = task.assignee || task.creator;
    await notificationService.notify(recipientId, {
      type: 'task_overdue',
      title: 'Tâche en retard',
      message: `« ${task.title} » a dépassé sa date d'échéance.`,
      link: `/tasks/${task.id}`,
    });
    task.overdueNotifiedAt = now;
    await task.save();
  }

  if (overdueTasks.length > 0) {
    logger.info(`Tâches en retard : ${overdueTasks.length} notification(s) envoyée(s).`);
  }

  return overdueTasks.length;
}

module.exports = { checkOverdueTasks };
