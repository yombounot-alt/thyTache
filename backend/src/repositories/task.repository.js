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

module.exports = { create, findMany, count, findById, findByIdAny };
