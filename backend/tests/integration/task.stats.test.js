const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const { loginAs } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/tasks`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

function payload(overrides = {}) {
  return {
    title: 'Tâche de test',
    description: 'Description suffisamment longue pour passer la validation',
    category: 'development',
    ...overrides,
  };
}

describe('GET /tasks/stats', () => {
  it('agrège total/completed/inProgress/pending pour l’utilisateur connecté', async () => {
    const { accessToken } = await loginAs({ email: 'stats@example.com' });

    const t1 = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(payload({ title: 'Tâche A' }));
    await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(payload({ title: 'Tâche B' }));
    const t3 = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(payload({ title: 'Tâche C' }));

    await request(app)
      .patch(`${base}/${t1.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'done' });
    await request(app)
      .patch(`${base}/${t3.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });

    const res = await request(app).get(`${base}/stats`).set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ total: 3, completed: 1, inProgress: 1, pending: 1 });
  });
});

describe('GET /tasks/stats?scope=all (RBAC admin)', () => {
  it('agrège les tâches de toute la plateforme pour un admin avec scope=all', async () => {
    const { accessToken: memberToken } = await loginAs({ email: 'stats-member@example.com', role: 'member' });
    const { accessToken: adminToken } = await loginAs({ email: 'stats-admin@example.com', role: 'admin' });

    await request(app).post(base).set('Authorization', `Bearer ${memberToken}`).send(payload({ title: 'Tâche membre' }));
    await request(app).post(base).set('Authorization', `Bearer ${adminToken}`).send(payload({ title: 'Tâche admin' }));

    const allScope = await request(app).get(`${base}/stats`).query({ scope: 'all' }).set('Authorization', `Bearer ${adminToken}`);
    const mineScope = await request(app).get(`${base}/stats`).set('Authorization', `Bearer ${adminToken}`);

    expect(allScope.body.data.total).toBe(2);
    expect(mineScope.body.data.total).toBe(1);
  });

  it("ignore scope=all pour un utilisateur standard (reste cantonné à ses tâches)", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'stats-std-a@example.com', role: 'member' });
    const { accessToken: tokenB } = await loginAs({ email: 'stats-std-b@example.com', role: 'member' });

    await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(payload({ title: 'Tâche A' }));
    await request(app).post(base).set('Authorization', `Bearer ${tokenB}`).send(payload({ title: 'Tâche B' }));

    const res = await request(app).get(`${base}/stats`).query({ scope: 'all' }).set('Authorization', `Bearer ${tokenA}`);

    expect(res.body.data.total).toBe(1);
  });
});

describe('GET /tasks/status-distribution', () => {
  it('retourne un compte par statut couvrant tous les statuts possibles', async () => {
    const { accessToken } = await loginAs({ email: 'status-dist@example.com' });
    await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(payload());

    const res = await request(app).get(`${base}/status-distribution`).set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const todo = res.body.data.find((entry) => entry.status === 'todo');
    expect(todo.count).toBe(1);
  });
});

describe('GET /tasks/evolution', () => {
  it('retourne une série avec autant de points que de jours demandés', async () => {
    const { accessToken } = await loginAs({ email: 'evolution@example.com' });
    await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(payload());

    const res = await request(app).get(`${base}/evolution?days=7`).set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(7);
    expect(res.body.data.at(-1).created).toBe(1);
  });
});

describe('GET /tasks/activity', () => {
  it("retourne l'historique le plus récent en premier, borné par limit", async () => {
    const { accessToken } = await loginAs({ email: 'activity@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(payload());
    await request(app)
      .patch(`${base}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });

    const res = await request(app).get(`${base}/activity?limit=1`).set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].action).toBe('updated');
  });
});
