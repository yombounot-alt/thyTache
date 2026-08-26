const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const { createVerifiedUser, DEFAULT_PASSWORD } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/auth`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

async function loginUser(overrides = {}) {
  const user = await createVerifiedUser(overrides);
  const res = await request(app).post(`${base}/login`).send({ email: user.email, password: DEFAULT_PASSWORD });
  return { user, tokens: res.body.data };
}

describe('GET /auth/me', () => {
  it("retourne l'utilisateur courant avec un token valide", async () => {
    const { tokens } = await loginUser({ email: 'me-ok@example.com' });
    const res = await request(app).get(`${base}/me`).set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('me-ok@example.com');
    expect(res.body.data.password).toBeUndefined();
  });

  it('rejette une requête sans token', async () => {
    const res = await request(app).get(`${base}/me`);
    expect(res.status).toBe(401);
  });

  it('rejette un token invalide', async () => {
    const res = await request(app).get(`${base}/me`).set('Authorization', 'Bearer invalide.token.ici');
    expect(res.status).toBe(401);
  });

  it('rejette un token expiré', async () => {
    const expiredToken = jwt.sign({ sub: 'x' }, env.jwt.secret, { expiresIn: -10 });
    const res = await request(app).get(`${base}/me`).set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/refresh-token', () => {
  it("génère un nouveau couple de tokens à partir d'un refresh token valide (rotation)", async () => {
    const { tokens } = await loginUser({ email: 'refresh-ok@example.com' });
    const res = await request(app).post(`${base}/refresh-token`).send({ refreshToken: tokens.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(tokens.refreshToken);
  });

  it('rejette un refresh token déjà utilisé', async () => {
    const { tokens } = await loginUser({ email: 'refresh-reuse@example.com' });
    await request(app).post(`${base}/refresh-token`).send({ refreshToken: tokens.refreshToken });
    const res = await request(app).post(`${base}/refresh-token`).send({ refreshToken: tokens.refreshToken });

    expect(res.status).toBe(401);
  });

  it('rejette un refresh token manquant', async () => {
    const res = await request(app).post(`${base}/refresh-token`).send({});
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/logout', () => {
  it('révoque le refresh token courant', async () => {
    const { tokens } = await loginUser({ email: 'logout-ok@example.com' });

    const logoutRes = await request(app).post(`${base}/logout`).send({ refreshToken: tokens.refreshToken });
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app).post(`${base}/refresh-token`).send({ refreshToken: tokens.refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});
