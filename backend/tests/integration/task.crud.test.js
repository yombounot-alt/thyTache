const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const Task = require('../../src/models/Task');
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

describe('DELETE /tasks/:id (suppression logique)', () => {
  it('supprime une tâche dont on est le créateur', async () => {
    const { accessToken } = await loginAs({ email: 'task-delete@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);

    const getRes = await request(app).get(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.status).toBe(404);
  });

  it('conserve la tâche en base avec isDeleted=true, deletedAt et deletedBy renseignés', async () => {
    const { accessToken, user } = await loginAs({ email: 'task-delete-soft@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const inDb = await Task.findById(created.body.data._id);
    expect(inDb).not.toBeNull();
    expect(inDb.isDeleted).toBe(true);
    expect(inDb.deletedAt).not.toBeNull();
    expect(String(inDb.deletedBy)).toBe(user.id.toString());
  });

  it("n'apparaît plus dans la liste normale après suppression", async () => {
    const { accessToken } = await loginAs({ email: 'task-delete-list@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());
    await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).get(base).set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.data).toHaveLength(0);
    expect(res.body.data.meta.total).toBe(0);
  });

  it('refuse de supprimer une tâche déjà supprimée (409)', async () => {
    const { accessToken } = await loginAs({ email: 'task-delete-twice@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());
    await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(409);
  });

  it('rejette une suppression non authentifiée', async () => {
    const { accessToken } = await loginAs({ email: 'task-delete-auth@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app).delete(`${base}/${created.body.data._id}`);
    expect(res.status).toBe(401);
  });

  it("refuse la suppression d'une tâche d'un autre utilisateur (404) sans la supprimer", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'task-delete-other-a@example.com' });
    const { accessToken: tokenB } = await loginAs({ email: 'task-delete-other-b@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload());

    const res = await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);

    const stillThere = await request(app).get(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${tokenA}`);
    expect(stillThere.status).toBe(200);
  });

  it('rejette un identifiant MongoDB invalide (422, pas une erreur 500)', async () => {
    const { accessToken } = await loginAs({ email: 'task-delete-invalid-id@example.com' });
    const res = await request(app).delete(`${base}/not-a-valid-id`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(422);
  });

  it("ne perturbe pas les autres tâches de l'utilisateur", async () => {
    const { accessToken } = await loginAs({ email: 'task-delete-others-unaffected@example.com' });
    const created1 = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validTaskPayload({ title: 'À supprimer' }));
    await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validTaskPayload({ title: 'À garder' }));

    await request(app).delete(`${base}/${created1.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).get(base).set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].title).toBe('À garder');
  });
});

describe('PATCH /tasks/:id/restore', () => {
  it('restaure une tâche supprimée', async () => {
    const { accessToken } = await loginAs({ email: 'task-restore@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());
    await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app)
      .patch(`${base}/${created.body.data._id}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isDeleted).toBe(false);
    expect(res.body.data.deletedAt).toBeNull();

    const getRes = await request(app).get(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.status).toBe(200);
  });

  it('refuse de restaurer une tâche non supprimée (409)', async () => {
    const { accessToken } = await loginAs({ email: 'task-restore-not-deleted@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload());

    const res = await request(app)
      .patch(`${base}/${created.body.data._id}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(409);
  });
});

describe('GET /tasks?deleted=true (corbeille)', () => {
  it('liste les tâches supprimées et exclut les tâches actives', async () => {
    const { accessToken } = await loginAs({ email: 'trash-list@example.com' });
    await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload({ title: 'Active' }));
    const deleted = await request(app).post(base).set('Authorization', `Bearer ${accessToken}`).send(validTaskPayload({ title: 'Supprimée' }));
    await request(app).delete(`${base}/${deleted.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const trash = await request(app).get(base).query({ deleted: 'true' }).set('Authorization', `Bearer ${accessToken}`);
    expect(trash.body.data.data).toHaveLength(1);
    expect(trash.body.data.data[0].title).toBe('Supprimée');

    const normal = await request(app).get(base).set('Authorization', `Bearer ${accessToken}`);
    expect(normal.body.data.data).toHaveLength(1);
    expect(normal.body.data.data[0].title).toBe('Active');
  });

  it("n'expose pas la corbeille d'un autre utilisateur", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'trash-scope-a@example.com' });
    const { accessToken: tokenB } = await loginAs({ email: 'trash-scope-b@example.com' });
    const created = await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload());
    await request(app).delete(`${base}/${created.body.data._id}`).set('Authorization', `Bearer ${tokenA}`);

    const res = await request(app).get(base).query({ deleted: 'true' }).set('Authorization', `Bearer ${tokenB}`);
    expect(res.body.data.data).toHaveLength(0);
  });

  it('rejette une valeur invalide pour deleted (422)', async () => {
    const { accessToken } = await loginAs({ email: 'trash-invalid@example.com' });
    const res = await request(app).get(base).query({ deleted: 'oui' }).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(422);
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
