const userRepository = require('../../src/repositories/user.repository');

const DEFAULT_PASSWORD = 'MotDePasseSecurise123!';

let counter = 0;

function uniqueEmail() {
  counter += 1;
  return `user${Date.now()}${counter}@example.com`;
}

async function createVerifiedUser(overrides = {}) {
  return userRepository.create({
    firstName: 'Lamah',
    lastName: 'Foromo',
    email: uniqueEmail(),
    password: DEFAULT_PASSWORD,
    role: 'user',
    isEmailVerified: true,
    isActive: true,
    ...overrides,
  });
}

module.exports = { createVerifiedUser, DEFAULT_PASSWORD };
