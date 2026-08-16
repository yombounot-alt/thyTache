const taskRepository = require('../repositories/task.repository');
const userRepository = require('../repositories/user.repository');
const { TASK_STATUSES } = require('../models/Task');
const { NotFoundError, ForbiddenError } = require('../errors');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scopeFilter(userId) {
  return { $or: [{ creator: userId }, { assignee: userId }] };
}

// Le créateur et l'assigné (aujourd'hui toujours la même personne, cf. règle
// d'auto-assignation) sont les seuls à pouvoir voir/modifier une tâche.
function canAccess(task, userId) {
  return String(task.creator) === String(userId) || (task.assignee && String(task.assignee) === String(userId));
}

async function findAccessibleTask(id, userId) {
  const task = await taskRepository.findById(id);
  if (!task || !canAccess(task, userId)) {
    throw new NotFoundError('Tâche introuvable');
  }
  return task;
}

// À la création, un utilisateur ne peut assigner la tâche qu'à lui-même (ou
// la laisser non assignée) : impossible de créer une tâche pour un collègue.
async function createTask({ title, description, category, priority, assigneeId, dueDate, tags }, creatorId) {
  if (assigneeId) {
    if (assigneeId !== String(creatorId)) {
      throw new ForbiddenError('Vous ne pouvez assigner une tâche qu\'à vous-même');
    }

    const assignee = await userRepository.findById(assigneeId);
    if (!assignee) {
      throw new NotFoundError('Utilisateur assigné introuvable');
    }
  }

  return taskRepository.create({
    title,
    description,
    category,
    priority,
    assignee: assigneeId || null,
    creator: creatorId,
    dueDate: dueDate || null,
    tags: tags || [],
    history: [{ actor: creatorId, action: 'created', detail: 'Tâche créée' }],
  });
}

// Un utilisateur ne voit que les tâches dont il est créateur ou assigné
// (cohérent avec la règle de création : on ne peut créer que pour soi-même).
async function listTasks(
  {
    page,
    pageSize,
    sortBy = 'createdAt',
    sortDir = 'desc',
    search,
    status,
    priority,
    category,
    assigneeId,
  },
  userId
) {
  // express-validator ne peut pas muter `req.query` sous Express 5 (lecture
  // seule) : `.toInt()` n'a donc aucun effet, on reconvertit ici explicitement.
  page = Number(page) || 1;
  pageSize = Number(pageSize) || 10;

  const filter = { $or: [{ creator: userId }, { assignee: userId }] };

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$and = [{ $or: [{ title: regex }, { description: regex }] }];
  }
  if (status?.length) filter.status = { $in: status };
  if (priority?.length) filter.priority = { $in: priority };
  if (category?.length) filter.category = { $in: category };
  if (assigneeId) filter.assignee = assigneeId;

  const skip = (page - 1) * pageSize;
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    taskRepository.findMany(filter, { skip, limit: pageSize, sort }),
    taskRepository.count(filter),
  ]);

  return {
    data: tasks,
    meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

async function getTaskById(id, userId) {
  return findAccessibleTask(id, userId);
}

async function updateTask(id, patch, userId) {
  const task = await findAccessibleTask(id, userId);
  const { title, description, category, priority, assigneeId, dueDate, tags, status, progress } = patch;

  if (assigneeId !== undefined && assigneeId !== null && assigneeId !== String(userId)) {
    throw new ForbiddenError('Vous ne pouvez assigner une tâche qu\'à vous-même');
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (category !== undefined) task.category = category;
  if (priority !== undefined) task.priority = priority;
  if (assigneeId !== undefined) task.assignee = assigneeId || null;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (tags !== undefined) task.tags = tags;
  if (progress !== undefined) task.progress = Number(progress);
  if (status !== undefined) {
    task.status = status;
    if (status === 'done') {
      task.completedAt = new Date();
      task.progress = 100;
    }
  }

  task.history.unshift({ actor: userId, action: 'updated', detail: 'Tâche mise à jour' });

  await task.save();
  return task;
}

async function deleteTask(id, userId) {
  const task = await taskRepository.findById(id);
  if (!task || String(task.creator) !== String(userId)) {
    throw new NotFoundError('Tâche introuvable');
  }
  await taskRepository.deleteById(id);
}

async function addComment(id, userId, content) {
  const task = await findAccessibleTask(id, userId);
  task.comments.push({ author: userId, content });
  await task.save();
  return task;
}

// Pièces jointes stockées en métadonnées uniquement (pas d'upload de fichier
// réel) : le frontend traite déjà cette fonctionnalité comme une simulation.
async function addAttachment(id, userId, { name, sizeKb, type }) {
  const task = await findAccessibleTask(id, userId);
  task.attachments.push({ name, sizeKb, type, uploadedBy: userId });
  await task.save();
  return task;
}

async function getStats(userId) {
  const tasks = await taskRepository.findMany(scopeFilter(userId), { skip: 0, limit: 0, sort: {} });
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'done').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length,
    pending: tasks.filter((t) => t.status === 'todo').length,
    overdue: tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < now).length,
  };
}

async function getEvolution(userId, days = 14) {
  const tasks = await taskRepository.findMany(scopeFilter(userId), { skip: 0, limit: 0, sort: {} });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today.getTime() - i * 24 * 3600_000);
    const dayLabel = day.toISOString().slice(0, 10);
    const created = tasks.filter((t) => t.createdAt.toISOString().slice(0, 10) === dayLabel).length;
    const completed = tasks.filter(
      (t) => t.completedAt && t.completedAt.toISOString().slice(0, 10) === dayLabel
    ).length;
    buckets.push({ date: dayLabel, created, completed });
  }

  return buckets;
}

async function getStatusDistribution(userId) {
  const tasks = await taskRepository.findMany(scopeFilter(userId), { skip: 0, limit: 0, sort: {} });
  return TASK_STATUSES.map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));
}

async function getAssigneeDistribution(userId) {
  const tasks = await taskRepository.findMany(scopeFilter(userId), { skip: 0, limit: 0, sort: {} });
  const counts = new Map();
  tasks.forEach((t) => {
    if (!t.assignee) return;
    const key = String(t.assignee);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([userId2, count]) => ({ userId: userId2, count }));
}

async function getRecentActivity(userId, limit = 8) {
  const tasks = await taskRepository.findMany(scopeFilter(userId), { skip: 0, limit: 0, sort: {} });
  return tasks
    .flatMap((t) =>
      t.history.map((h) => ({
        id: String(h._id),
        taskId: String(t._id),
        taskTitle: t.title,
        actorId: String(h.actor),
        action: h.action,
        detail: h.detail,
        createdAt: h.createdAt,
      }))
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  addAttachment,
  getStats,
  getEvolution,
  getStatusDistribution,
  getAssigneeDistribution,
  getRecentActivity,
};
