const Task = require('../models/Task');

function create(data) {
  return Task.create(data);
}

// Toutes les lectures « normales » excluent les tâches supprimées
// logiquement : centralisé ici pour ne pas avoir à répéter `isDeleted: false`
// dans chaque appelant (liste, stats, évolution, activité, etc.).
function findMany(filter, { skip, limit, sort }) {
  return Task.find({ ...filter, isDeleted: false }).sort(sort).skip(skip).limit(limit);
}

function count(filter) {
  return Task.countDocuments({ ...filter, isDeleted: false });
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

module.exports = { create, findMany, count, findById, findByIdAny, softDelete, restore };
