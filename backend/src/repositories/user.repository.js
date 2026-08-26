const User = require('../models/User');

function findByEmail(email, { withPassword = false } = {}) {
  const query = User.findOne({ email });
  return withPassword ? query.select('+password') : query;
}

function findById(id, { withPassword = false } = {}) {
  const query = User.findById(id);
  return withPassword ? query.select('+password') : query;
}

function create(data) {
  return User.create(data);
}

function findAll() {
  return User.find({});
}

function findMany() {
  return User.find({}).sort({ createdAt: -1 });
}

function deleteById(id) {
  return User.findByIdAndDelete(id);
}

module.exports = { findByEmail, findById, create, findAll, findMany, deleteById };
