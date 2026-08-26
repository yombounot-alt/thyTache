const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const { loginAs } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/users`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe('GET /users', () => {
  it('liste les utilisateurs pour tout utilisateur authentifié (annuaire)', async () => {
    const { accessToken } = await loginAs({ email: 'directory@example.com' });
    const res = await request(app).get(base).set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.data[0].password).toBeUndefined();
  });

  it('rejette une requête non authentifiée', async () => {
    const res = await request(app).get(base);
    expect(res.status).toBe(401);
  });
});

describe('POST /users (admin uniquement)', () => {
  it('refuse la création à un utilisateur non-admin', async () => {
    const { accessToken } = await loginAs({ email: 'not-admin@example.com', role: 'member' });
    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Nouveau', lastName: 'Membre', email: 'created@example.com', role: 'member' });

    expect(res.status).toBe(403);
  });

  it('permet à un admin de créer un utilisateur', async () => {
    const { accessToken } = await loginAs({ email: 'admin-create@example.com', role: 'admin' });
    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Nouveau', lastName: 'Utilisateur', email: 'nouveau.utilisateur@example.com', role: 'manager' });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('manager');
    expect(res.body.data.email).toBe('nouveau.utilisateur@example.com');
  });

  it('rejette un rôle invalide', async () => {
    const { accessToken } = await loginAs({ email: 'admin-create-bad-role@example.com', role: 'admin' });
    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Nouveau', lastName: 'Utilisateur', email: 'bad-role@example.com', role: 'superadmin' });

    expect(res.status).toBe(422);
  });
});

describe('PATCH /users/:id/role', () => {
  it('permet à un admin de promouvoir un utilisateur manager (régression : enum Mongoose)', async () => {
    const { accessToken } = await loginAs({ email: 'admin-role@example.com', role: 'admin' });
    const { user: target } = await loginAs({ email: 'target-role@example.com', role: 'member' });

    const res = await request(app)
      .patch(`${base}/${target.id}/role`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ role: 'manager' });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('manager');
  });
});

describe('PATCH /users/:id/status', () => {
  it('désactive un utilisateur', async () => {
    const { accessToken } = await loginAs({ email: 'admin-status@example.com', role: 'admin' });
    const { user: target } = await loginAs({ email: 'target-status@example.com' });

    const res = await request(app)
      .patch(`${base}/${target.id}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });
});

describe('DELETE /users/:id', () => {
  it('supprime un utilisateur (admin uniquement)', async () => {
    const { accessToken } = await loginAs({ email: 'admin-delete@example.com', role: 'admin' });
    const { user: target } = await loginAs({ email: 'target-delete@example.com' });

    const res = await request(app).delete(`${base}/${target.id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);

    const getRes = await request(app).get(`${base}/${target.id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.status).toBe(404);
  });
});

describe('POST /users/:id/reset-password', () => {
  it('génère un mot de passe temporaire', async () => {
    const { accessToken } = await loginAs({ email: 'admin-reset@example.com', role: 'admin' });
    const { user: target } = await loginAs({ email: 'target-reset@example.com' });

    const res = await request(app)
      .post(`${base}/${target.id}/reset-password`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.temporaryPassword).toEqual(expect.any(String));
  });
});
