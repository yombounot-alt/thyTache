const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const { loginAs } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/tasks`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

function validTaskPayload(overrides = {}) {
  return {
    title: 'Préparer la démo client',
    description: 'Préparer le support de démonstration pour le client X',
    category: 'development',
    ...overrides,
  };
}

describe('POST /tasks', () => {
  it('crée une tâche pour l’utilisateur connecté', async () => {
    const { accessToken, user } = await loginAs({ email: 'task-create@example.com' });
    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validTaskPayload());

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Préparer la démo client');
    expect(res.body.data.status).toBe('todo');
    expect(res.body.data.creatorId).toBe(user.id.toString());
    expect(res.body.data.assigneeId).toBeNull();
  });

  it("s'auto-assigne quand assigneeId correspond à l'utilisateur connecté", async () => {
    const { accessToken, user } = await loginAs({ email: 'task-self-assign@example.com' });
    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validTaskPayload({ assigneeId: user.id.toString() }));

    expect(res.status).toBe(201);
    expect(res.body.data.assigneeId).toBe(user.id.toString());
  });

  it("refuse d'assigner une tâche à quelqu'un d'autre", async () => {
    const { accessToken } = await loginAs({ email: 'task-assign-other@example.com' });
    const { user: other } = await loginAs({ email: 'task-assign-other-target@example.com' });

    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validTaskPayload({ assigneeId: other.id.toString() }));

    expect(res.status).toBe(403);
  });

  it('rejette une tâche sans titre', async () => {
    const { accessToken } = await loginAs({ email: 'task-invalid@example.com' });
    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validTaskPayload({ title: '' }));

    expect(res.status).toBe(422);
  });

  it('rejette une requête non authentifiée', async () => {
    const res = await request(app).post(base).send(validTaskPayload());
    expect(res.status).toBe(401);
  });
});

describe('GET /tasks et /tasks/:id', () => {
  it("ne liste que les tâches de l'utilisateur connecté", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'task-list-a@example.com' });
    const { accessToken: tokenB } = await loginAs({ email: 'task-list-b@example.com' });

    await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload({ title: 'Tâche A' }));
    await request(app).post(base).set('Authorization', `Bearer ${tokenB}`).send(validTaskPayload({ title: 'Tâche B' }));

    const res = await request(app).get(base).set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].title).toBe('Tâche A');
    expect(res.body.data.meta.total).toBe(1);
  });

  it("refuse l'accès au détail d'une tâche d'un autre utilisateur (404, pas 403)", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'task-detail-a@example.com' });
    const { accessToken: tokenB } = await loginAs({ email: 'task-detail-b@example.com' });

    const created = await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload());
    const res = await request(app)
      .get(`${base}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /tasks/:id', () => {
  it('met à jour le statut et calcule completedAt/progress à 100 quand status=done', async () => {
    const { accessToken } = await loginAs({ email: 'task-update-done@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app)
      .patch(`${base}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('done');
    expect(res.body.data.progress).toBe(100);
    expect(res.body.data.completedAt).not.toBeNull();
  });

  it("refuse la modification d'une tâche d'un autre utilisateur", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'task-update-a@example.com' });
    const { accessToken: tokenB } = await loginAs({ email: 'task-update-b@example.com' });

    const created = await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload());
    const res = await request(app)
      .patch(`${base}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Piraté' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('supprime une tâche dont on est le créateur', async () => {
    const { accessToken } = await loginAs({ email: 'task-delete@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);

    const getRes = await request(app).get(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.status).toBe(404);
  });
});

describe('POST /tasks/:id/comments', () => {
  it('ajoute un commentaire à une tâche accessible', async () => {
    const { accessToken } = await loginAs({ email: 'task-comment@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app)
      .post(`${base}/${created.body.data._id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Ça avance bien.' });

    expect(res.status).toBe(201);
    expect(res.body.data.comments).toHaveLength(1);
    expect(res.body.data.comments[0].content).toBe('Ça avance bien.');
  });

  it('rejette un commentaire vide', async () => {
    const { accessToken } = await loginAs({ email: 'task-comment-empty@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app)
      .post(`${base}/${created.body.data._id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: '' });

    expect(res.status).toBe(422);
  });
});

describe('POST /tasks/:id/attachments', () => {
  it('ajoute les métadonnées d’une pièce jointe', async () => {
    const { accessToken } = await loginAs({ email: 'task-attachment@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app)
      .post(`${base}/${created.body.data._id}/attachments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'cahier-des-charges.pdf', sizeKb: 245, type: 'application/pdf' });

    expect(res.status).toBe(201);
    expect(res.body.data.attachments).toHaveLength(1);
    expect(res.body.data.attachments[0].name).toBe('cahier-des-charges.pdf');
  });
});
