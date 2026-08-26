const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const { createVerifiedUser, DEFAULT_PASSWORD } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/auth`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe('POST /auth/login', () => {
  it('connecte un utilisateur vérifié avec les bons identifiants', async () => {
    const user = await createVerifiedUser({ email: 'login-ok@example.com' });
    const res = await request(app).post(`${base}/login`).send({ email: user.email, password: DEFAULT_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejette un mauvais mot de passe', async () => {
    const user = await createVerifiedUser({ email: 'login-badpass@example.com' });
    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: user.email, password: 'MauvaisMotDePasse123!' });

    expect(res.status).toBe(401);
  });

  it('rejette un utilisateur inexistant', async () => {
    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: 'inexistant@example.com', password: DEFAULT_PASSWORD });

    expect(res.status).toBe(401);
  });

  it('rejette un utilisateur non vérifié', async () => {
    const user = await createVerifiedUser({ email: 'login-unverified@example.com', isEmailVerified: false });
    const res = await request(app).post(`${base}/login`).send({ email: user.email, password: DEFAULT_PASSWORD });

    expect(res.status).toBe(403);
  });

  it('rejette un utilisateur désactivé', async () => {
    const user = await createVerifiedUser({ email: 'login-disabled@example.com', isActive: false });
    const res = await request(app).post(`${base}/login`).send({ email: user.email, password: DEFAULT_PASSWORD });

    expect(res.status).toBe(403);
  });
});
