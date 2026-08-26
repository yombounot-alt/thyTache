const userRepository = require('../repositories/user.repository');
const { ConflictError, NotFoundError } = require('../errors');

function normalizeRole(role) {
  return role === 'user' ? 'member' : role;
}

async function listUsers({ page = 1, pageSize = 10, search, role, status } = {}) {
  const users = await userRepository.findMany();
  const normalizedSearch = search?.toLowerCase();
  const filtered = users.filter((user) => {
    const matchesSearch = !normalizedSearch || `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(normalizedSearch);
    const matchesRole = !role || normalizeRole(user.role) === role;
    const matchesStatus = !status || (user.isActive ? 'active' : 'inactive') === status;
    return matchesSearch && matchesRole && matchesStatus;
  });
  const start = (Number(page) - 1) * Number(pageSize);
  return {
    data: filtered.slice(start, start + Number(pageSize)),
    meta: { page: Number(page), pageSize: Number(pageSize), total: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / Number(pageSize))) },
  };
}

async function createUser({ firstName, lastName, email, role }) {
  if (await userRepository.findByEmail(email)) throw new ConflictError('Un compte existe déjà avec cette adresse e-mail');
  return userRepository.create({ firstName, lastName, email, role: normalizeRole(role), password: `Temp${Date.now()}Aa!`, isEmailVerified: true });
}

async function getUser(id) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  return user;
}

async function updateUser(id, patch) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  Object.assign(user, patch);
  await user.save();
  return user;
}

async function deleteUser(id) {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  await userRepository.deleteById(id);
}

async function setStatus(id, isActive) { return updateUser(id, { isActive }); }
async function setRole(id, role) { return updateUser(id, { role: normalizeRole(role) }); }
async function resetPassword(id) {
  const temporaryPassword = `Temp${Date.now().toString().slice(-6)}Aa!`;
  await updateUser(id, { password: temporaryPassword });
  return { temporaryPassword };
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, setStatus, setRole, resetPassword };
