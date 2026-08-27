const Task = require('../models/Task');

function create(data) {
  return Task.create(data);
}

// Toutes les lectures « normales » excluent les tâches supprimées
// logiquement par défaut : centralisé ici pour ne pas avoir à répéter
// `isDeleted: false` dans chaque appelant (liste, stats, évolution, etc.).
// `filter` peut explicitement fournir `isDeleted: true` pour lister la
// corbeille (cf. task.service.listTasks) : il est fusionné après le défaut,
// donc il le remplace plutôt que l'inverse.
function findMany(filter, { skip, limit, sort }) {
  return Task.find({ isDeleted: false, ...filter }).sort(sort).skip(skip).limit(limit);
}

function count(filter) {
  return Task.countDocuments({ isDeleted: false, ...filter });
}

function findById(id) {
  return Task.findOne({ _id: id, isDeleted: false });
}

// Réservé aux flux de suppression/restauration, qui doivent pouvoir
// distinguer « tâche inexistante » de « déjà supprimée ».
function findByIdAny(id) {
  return Task.findById(id);
}

// Mise à jour atomique (findOneAndUpdate) : la condition `isDeleted: false`
// fait partie du filtre, pas d'un check préalable en mémoire, ce qui évite
// la fenêtre de course d'un « find » suivi d'un « save » (deux suppressions
// concurrentes ne peuvent plus toutes les deux réussir).
function softDelete(id, userId) {
  return Task.findOneAndUpdate(
    { _id: id, creator: userId, isDeleted: false },
    {
      $set: { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
      $push: {
        history: { $each: [{ actor: userId, action: 'deleted', detail: 'Tâche supprimée' }], $position: 0 },
      },
    },
    { returnDocument: 'after' }
  );
}

// Symétrique de softDelete, même garantie d'atomicité.
function restore(id, userId) {
  return Task.findOneAndUpdate(
    { _id: id, creator: userId, isDeleted: true },
    {
      $set: { isDeleted: false, deletedAt: null, deletedBy: null },
      $push: {
        history: { $each: [{ actor: userId, action: 'restored', detail: 'Tâche restaurée' }], $position: 0 },
      },
    },
    { returnDocument: 'after' }
  );
}

// Les 5 fonctions suivantes alimentent les tableaux de bord (task.service
// getStats/getEvolution/getStatusDistribution/getAssigneeDistribution/
// getRecentActivity) via un pipeline d'agrégation Mongo plutôt que de charger
// toute la collection en mémoire pour la filtrer/compter côté Node — ce qui
// devient coûteux dès que `scope=all` (admin) porte sur toute la plateforme.

async function aggregateStats(filter) {
  const now = new Date();
  const [result] = await Task.aggregate([
    { $match: { isDeleted: false, ...filter } },
    {
      $facet: {
        total: [{ $count: 'count' }],
        completed: [{ $match: { status: 'done' } }, { $count: 'count' }],
        inProgress: [{ $match: { status: { $in: ['in_progress', 'in_review'] } } }, { $count: 'count' }],
        pending: [{ $match: { status: 'todo' } }, { $count: 'count' }],
        overdue: [{ $match: { status: { $ne: 'done' }, dueDate: { $ne: null, $lt: now } } }, { $count: 'count' }],
      },
    },
  ]);

  const pick = (key) => result[key][0]?.count ?? 0;
  return {
    total: pick('total'),
    completed: pick('completed'),
    inProgress: pick('inProgress'),
    pending: pick('pending'),
    overdue: pick('overdue'),
  };
}

// Comptes par jour (créées / terminées) depuis `since`, regroupés en base :
// le service ne fait plus que projeter ces totaux sur la plage de jours demandée.
async function aggregateDailyCounts(filter, since) {
  const [result] = await Task.aggregate([
    { $match: { isDeleted: false, ...filter } },
    {
      $facet: {
        created: [
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        ],
        completed: [
          { $match: { completedAt: { $ne: null, $gte: since } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        ],
      },
    },
  ]);
  return result;
}

function aggregateStatusDistribution(filter) {
  return Task.aggregate([
    { $match: { isDeleted: false, ...filter } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
}

function aggregateAssigneeDistribution(filter) {
  return Task.aggregate([
    { $match: { isDeleted: false, ...filter, assignee: { $ne: null } } },
    { $group: { _id: '$assignee', count: { $sum: 1 } } },
  ]);
}

// $unwind + $sort + $limit sur l'historique : évite de rapatrier les
// commentaires/pièces jointes de chaque tâche juste pour lire son historique.
function aggregateRecentActivity(filter, limit) {
  return Task.aggregate([
    { $match: { isDeleted: false, ...filter } },
    { $unwind: '$history' },
    { $sort: { 'history.createdAt': -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        id: '$history._id',
        taskId: '$_id',
        taskTitle: '$title',
        actorId: '$history.actor',
        action: '$history.action',
        detail: '$history.detail',
        createdAt: '$history.createdAt',
      },
    },
  ]);
}

module.exports = {
  create,
  findMany,
  count,
  findById,
  findByIdAny,
  softDelete,
  restore,
  aggregateStats,
  aggregateDailyCounts,
  aggregateStatusDistribution,
  aggregateAssigneeDistribution,
  aggregateRecentActivity,
};
