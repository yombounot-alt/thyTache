const taskRepository = require('../repositories/task.repository');
const userRepository = require('../repositories/user.repository');
const notificationService = require('./notification.service');
const { TASK_STATUSES } = require('../models/Task');
const { NotFoundError, ForbiddenError, ConflictError } = require('../errors');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scopeFilter(userId) {
  return { $or: [{ creator: userId }, { assignee: userId }] };
}

// Centralise la même règle que pour la liste : un admin qui demande
// `scope=all` voit tout, tout le monde d'autre (y compris un admin sans ce
// paramètre) reste cantonné à ses propres tâches (créateur ou assigné).
function resolveFilter(user, scope) {
  return user.role === 'admin' && scope === 'all' ? {} : scopeFilter(user.id);
}

// Le créateur et l'assigné sont les seuls à pouvoir modifier une tâche
// (commenter, joindre un fichier, changer son statut, la supprimer) — y
// compris pour un admin, qui n'a pas de passe-droit ici : son privilège élargi
// se limite à la LECTURE (cf. findVisibleTask) et à l'attribution d'assigné
// (cf. createTask/updateTask).
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

// Lecture seule : un admin peut consulter n'importe quelle tâche (droit RBAC
// "voir toutes les tâches"), sans que cela lui donne les droits de
// modification/suppression accordés par canAccess ci-dessus.
async function findVisibleTask(id, user) {
  const task = await taskRepository.findById(id);
  if (!task) {
    throw new NotFoundError('Tâche introuvable');
  }
  if (user.role !== 'admin' && !canAccess(task, user.id)) {
    throw new NotFoundError('Tâche introuvable');
  }
  return task;
}

// Un utilisateur standard ne peut assigner la tâche qu'à lui-même (ou la
// laisser non assignée) : impossible de créer une tâche pour un collègue.
// Un admin peut en revanche l'attribuer à n'importe quel utilisateur existant
// de la plateforme — vérifié en base, jamais sur la seule foi du frontend.
async function createTask({ title, description, category, priority, assigneeId, dueDate, tags }, creator) {
  const creatorId = creator.id;
  const isAdmin = creator.role === 'admin';
  let assignee = null;

  if (assigneeId) {
    if (!isAdmin && assigneeId !== String(creatorId)) {
      throw new ForbiddenError('Vous ne pouvez assigner une tâche qu\'à vous-même');
    }

    assignee = await userRepository.findById(assigneeId);
    if (!assignee) {
      throw new NotFoundError('Utilisateur assigné introuvable');
    }
  }

  const task = await taskRepository.create({
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

  await notificationService.notify(creatorId, {
    type: 'task_created',
    title: 'Tâche créée',
    message: `« ${task.title} » a été ajoutée à vos tâches.`,
    link: `/tasks/${task.id}`,
  });

  // Distinct de la notification ci-dessus : uniquement quand un admin attribue
  // la tâche à quelqu'un d'autre que lui-même.
  if (assignee && String(assigneeId) !== String(creatorId)) {
    await notificationService.notify(assigneeId, {
      type: 'task_assigned',
      title: 'Nouvelle tâche assignée',
      message: `« ${task.title} » vous a été attribuée.`,
      link: `/tasks/${task.id}`,
    });
  }

  return task;
}

// Un utilisateur standard ne voit que les tâches dont il est créateur ou
// assigné (cohérent avec la règle de création : on ne peut créer que pour
// soi-même, sauf admin). Un admin peut demander `scope=all` pour voir toutes
// les tâches de la plateforme ; toute autre valeur (ou l'absence du
// paramètre) reste scopée à "mes tâches", y compris pour un admin.
// Le rôle vient de `user` (rechargé en base par `authenticate`), jamais du
// contenu de la requête : un utilisateur standard qui force `scope=all`
// depuis Postman reste silencieusement ramené à son propre périmètre.
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
    scope,
  },
  user
) {
  // express-validator ne peut pas muter `req.query` sous Express 5 (lecture
  // seule) : `.toInt()` n'a donc aucun effet, on reconvertit ici explicitement.
  page = Number(page) || 1;
  pageSize = Number(pageSize) || 10;

  const filter = resolveFilter(user, scope);

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

async function getTaskById(id, user) {
  return findVisibleTask(id, user);
}

// Même règle d'attribution qu'à la création (cf. createTask) : un admin peut
// réassigner à n'importe quel utilisateur existant, un utilisateur standard
// uniquement à lui-même.
async function updateTask(id, patch, user) {
  const userId = user.id;
  const task = await findAccessibleTask(id, userId);
  const { title, description, category, priority, assigneeId, dueDate, tags, status, progress } = patch;

  if (assigneeId !== undefined && assigneeId !== null) {
    if (user.role !== 'admin' && assigneeId !== String(userId)) {
      throw new ForbiddenError('Vous ne pouvez assigner une tâche qu\'à vous-même');
    }
    if (user.role === 'admin') {
      const assignee = await userRepository.findById(assigneeId);
      if (!assignee) {
        throw new NotFoundError('Utilisateur assigné introuvable');
      }
    }
  }

  const wasDone = task.status === 'done';
  const previousAssigneeId = task.assignee ? String(task.assignee) : null;

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

  if (status === 'done' && !wasDone) {
    await notificationService.notify(userId, {
      type: 'task_completed',
      title: 'Tâche terminée',
      message: `Vous avez marqué « ${task.title} » comme terminée.`,
      link: `/tasks/${task.id}`,
    });
  }

  // Même règle que createTask : uniquement quand la tâche est réattribuée à
  // quelqu'un d'autre que l'acteur (évite de se notifier soi-même) — sans ça
  // un utilisateur réassigné par un admin via PATCH ne l'apprenait jamais.
  if (
    assigneeId !== undefined &&
    assigneeId &&
    String(assigneeId) !== previousAssigneeId &&
    String(assigneeId) !== String(userId)
  ) {
    await notificationService.notify(assigneeId, {
      type: 'task_assigned',
      title: 'Nouvelle tâche assignée',
      message: `« ${task.title} » vous a été attribuée.`,
      link: `/tasks/${task.id}`,
    });
  }

  return task;
}

// Suppression logique uniquement : la tâche reste en base (historique,
// statistiques, restauration future) mais devient invisible des lectures
// normales (cf. task.repository.findMany/findById qui filtrent isDeleted).
// Seul le créateur peut supprimer, comme pour la modification (findAccessibleTask) ;
// un utilisateur non créateur reçoit un 404 (et non 403) pour ne pas révéler
// l'existence de la tâche, cohérent avec le reste de l'API.
// La mutation elle-même passe par un findOneAndUpdate atomique
// (task.repository.softDelete) : deux suppressions concurrentes de la même
// tâche ne peuvent pas toutes les deux passer le check `isDeleted`, contrairement
// à un find() suivi d'un save() séparés.
async function deleteTask(id, userId) {
  const updated = await taskRepository.softDelete(id, userId);
  if (updated) return;

  const task = await taskRepository.findByIdAny(id);
  if (!task || String(task.creator) !== String(userId)) {
    throw new NotFoundError('Tâche introuvable');
  }
  throw new ConflictError('Cette tâche a déjà été supprimée');
}

async function restoreTask(id, userId) {
  const updated = await taskRepository.restore(id, userId);
  if (updated) return updated;

  const task = await taskRepository.findByIdAny(id);
  if (!task || String(task.creator) !== String(userId)) {
    throw new NotFoundError('Tâche introuvable');
  }
  throw new ConflictError("Cette tâche n'est pas supprimée");
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

// Les 5 fonctions ci-dessous acceptent `scope='all'` selon la même règle que
// listTasks (effectif uniquement pour un admin) : c'est ce qui permet aux
// tableaux de bord admin (AdminDashboard/AdminStatistics côté frontend)
// d'afficher des chiffres à l'échelle de la plateforme plutôt que ceux du
// seul admin connecté, sans dupliquer la logique d'autorisation.
async function getStats(user, scope) {
  const tasks = await taskRepository.findMany(resolveFilter(user, scope), { skip: 0, limit: 0, sort: {} });
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'done').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length,
    pending: tasks.filter((t) => t.status === 'todo').length,
    overdue: tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < now).length,
  };
}

async function getEvolution(user, days = 14, scope) {
  const tasks = await taskRepository.findMany(resolveFilter(user, scope), { skip: 0, limit: 0, sort: {} });
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

async function getStatusDistribution(user, scope) {
  const tasks = await taskRepository.findMany(resolveFilter(user, scope), { skip: 0, limit: 0, sort: {} });
  return TASK_STATUSES.map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));
}

async function getAssigneeDistribution(user, scope) {
  const tasks = await taskRepository.findMany(resolveFilter(user, scope), { skip: 0, limit: 0, sort: {} });
  const counts = new Map();
  tasks.forEach((t) => {
    if (!t.assignee) return;
    const key = String(t.assignee);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([userId2, count]) => ({ userId: userId2, count }));
}

async function getRecentActivity(user, limit = 8, scope) {
  const tasks = await taskRepository.findMany(resolveFilter(user, scope), { skip: 0, limit: 0, sort: {} });
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
  restoreTask,
  addComment,
  addAttachment,
  getStats,
  getEvolution,
  getStatusDistribution,
  getAssigneeDistribution,
  getRecentActivity,
};
