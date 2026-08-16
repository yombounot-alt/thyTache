const userRepository = require('../repositories/user.repository');

async function listUsers() {
  return userRepository.findAll();
}

module.exports = { listUsers };
