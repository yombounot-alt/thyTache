const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const User = require('../../src/models/User');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/auth`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const validPayload = {
  firstName: 'Lamah',
  lastName: 'Foromo',
  email: 'lamah@example.com',
  password: 'MotDePasseSecurise123!',
};

describe('POST /auth/register', () => {
  it('inscrit un utilisateur valide avec le rôle member par défaut et un mot de passe hashé', async () => {
    const res = await request(app).post(`${base}/register`).send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: validPayload.email }).select('+password');
    expect(user).not.toBeNull();
    expect(user.role).toBe('member');
    expect(user.isEmailVerified).toBe(false);
    expect(user.password).not.toBe(validPayload.password);
  });

  it("empêche l'auto-attribution du rôle admin via le corps de la requête", async () => {
    await request(app)
      .post(`${base}/register`)
      .send({ ...validPayload, role: 'admin' });

    const user = await User.findOne({ email: validPayload.email });
    expect(user.role).toBe('member');
  });

  it('rejette un e-mail déjà utilisé', async () => {
    await request(app).post(`${base}/register`).send(validPayload);
    const res = await request(app).post(`${base}/register`).send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejette un e-mail invalide', async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ ...validPayload, email: 'pas-un-email' });

    expect(res.status).toBe(422);
  });

  it('rejette un mot de passe ne respectant pas la politique de sécurité', async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({ ...validPayload, password: 'faible' });

    expect(res.status).toBe(422);
  });
});
