const Task = require('../models/Task');

function create(data) {
  return Task.create(data);
}

function findMany(filter, { skip, limit, sort }) {
  return Task.find(filter).sort(sort).skip(skip).limit(limit);
}

function count(filter) {
  return Task.countDocuments(filter);
}

function findById(id) {
  return Task.findById(id);
}

function deleteById(id) {
  return Task.findByIdAndDelete(id);
}

module.exports = { create, findMany, count, findById, deleteById };
