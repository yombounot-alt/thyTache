const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
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
    role: 'member',
    isEmailVerified: true,
    isActive: true,
    ...overrides,
  });
}

// Crée un utilisateur vérifié puis se connecte via /auth/login (comme un
// vrai client) pour obtenir un access token exploitable dans l'en-tête
// Authorization des tests d'intégration sur les routes protégées.
async function loginAs(overrides = {}) {
  const user = await createVerifiedUser(overrides);
  const res = await request(app)
    .post(`${env.apiPrefix}/auth/login`)
    .send({ email: user.email, password: DEFAULT_PASSWORD });
  return { user, accessToken: res.body.data.accessToken };
}

module.exports = { createVerifiedUser, loginAs, DEFAULT_PASSWORD };
