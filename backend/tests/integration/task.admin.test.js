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

describe('GET /tasks?scope=all (RBAC admin)', () => {
  it('un admin voit les tâches de tous les utilisateurs avec scope=all', async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'rbac-member-a@example.com', role: 'member' });
    const { accessToken: tokenB } = await loginAs({ email: 'rbac-member-b@example.com', role: 'member' });
    const { accessToken: adminToken } = await loginAs({ email: 'rbac-admin-1@example.com', role: 'admin' });

    await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload({ title: 'Tâche A' }));
    await request(app).post(base).set('Authorization', `Bearer ${tokenB}`).send(validTaskPayload({ title: 'Tâche B' }));
    await request(app).post(base).set('Authorization', `Bearer ${adminToken}`).send(validTaskPayload({ title: 'Tâche Admin' }));

    const res = await request(app).get(base).query({ scope: 'all' }).set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.meta.total).toBe(3);
    const titles = res.body.data.data.map((t) => t.title).sort();
    expect(titles).toEqual(['Tâche A', 'Tâche Admin', 'Tâche B']);
  });

  it("un admin ne voit que ses propres tâches par défaut (sans scope, ou scope=mine)", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'rbac-member-c@example.com', role: 'member' });
    const { accessToken: adminToken } = await loginAs({ email: 'rbac-admin-2@example.com', role: 'admin' });

    await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload({ title: 'Tâche membre' }));
    await request(app).post(base).set('Authorization', `Bearer ${adminToken}`).send(validTaskPayload({ title: 'Tâche admin' }));

    const res = await request(app).get(base).set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].title).toBe('Tâche admin');
  });

  it("un utilisateur standard qui force scope=all reste cantonné à ses propres tâches (RBAC appliqué côté backend)", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'rbac-member-d@example.com', role: 'member' });
    const { accessToken: tokenB } = await loginAs({ email: 'rbac-member-e@example.com', role: 'member' });

    await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload({ title: 'Tâche à moi' }));
    await request(app).post(base).set('Authorization', `Bearer ${tokenB}`).send(validTaskPayload({ title: 'Tâche autrui' }));

    const res = await request(app).get(base).query({ scope: 'all' }).set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data).toHaveLength(1);
    expect(res.body.data.data[0].title).toBe('Tâche à moi');
  });

  it('un admin peut consulter le détail de la tâche de n\'importe quel utilisateur', async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'rbac-member-f@example.com', role: 'member' });
    const { accessToken: adminToken } = await loginAs({ email: 'rbac-admin-3@example.com', role: 'admin' });

    const created = await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload());

    const res = await request(app)
      .get(`${base}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe(created.body.data.title);
  });

  it("le droit de lecture élargi de l'admin ne lui donne pas le droit de modifier la tâche d'un autre (toujours 404)", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'rbac-member-g@example.com', role: 'member' });
    const { accessToken: adminToken } = await loginAs({ email: 'rbac-admin-4@example.com', role: 'admin' });

    const created = await request(app).post(base).set('Authorization', `Bearer ${tokenA}`).send(validTaskPayload());

    const res = await request(app)
      .patch(`${base}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Modifié par admin' });

    expect(res.status).toBe(404);
  });
});

describe('POST /tasks (attribution admin)', () => {
  it('un admin crée une tâche pour lui-même comme un utilisateur normal', async () => {
    const { accessToken: adminToken, user: admin } = await loginAs({ email: 'rbac-admin-5@example.com', role: 'admin' });

    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validTaskPayload({ assigneeId: admin.id.toString() }));

    expect(res.status).toBe(201);
    expect(res.body.data.creatorId).toBe(admin.id.toString());
    expect(res.body.data.assigneeId).toBe(admin.id.toString());
  });

  it('un admin crée et attribue une tâche à un autre utilisateur existant', async () => {
    const { accessToken: adminToken, user: admin } = await loginAs({ email: 'rbac-admin-6@example.com', role: 'admin' });
    const { accessToken: memberToken, user: member } = await loginAs({
      email: 'rbac-member-h@example.com',
      role: 'member',
    });

    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validTaskPayload({ title: 'Tâche attribuée', assigneeId: member.id.toString() }));

    expect(res.status).toBe(201);
    expect(res.body.data.creatorId).toBe(admin.id.toString());
    expect(res.body.data.assigneeId).toBe(member.id.toString());

    // La tâche attribuée apparaît bien chez l'utilisateur concerné.
    const memberList = await request(app).get(base).set('Authorization', `Bearer ${memberToken}`);
    expect(memberList.body.data.data).toHaveLength(1);
    expect(memberList.body.data.data[0].title).toBe('Tâche attribuée');
    expect(memberList.body.data.data[0].creatorId).toBe(admin.id.toString());
  });

  it("refuse d'attribuer une tâche à un utilisateur inexistant, même pour un admin (404, jamais confiance au frontend)", async () => {
    const { accessToken: adminToken } = await loginAs({ email: 'rbac-admin-7@example.com', role: 'admin' });
    const fakeUserId = '64b7f3c2e1a2b3c4d5e6f789';

    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validTaskPayload({ assigneeId: fakeUserId }));

    expect(res.status).toBe(404);
  });

  it("un utilisateur standard ne peut toujours pas attribuer une tâche à quelqu'un d'autre (403)", async () => {
    const { accessToken } = await loginAs({ email: 'rbac-member-i@example.com', role: 'member' });
    const { user: other } = await loginAs({ email: 'rbac-member-j@example.com', role: 'member' });

    const res = await request(app)
      .post(base)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validTaskPayload({ assigneeId: other.id.toString() }));

    expect(res.status).toBe(403);
  });
});
