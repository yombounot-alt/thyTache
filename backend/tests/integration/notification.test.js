const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const { loginAs } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const tasksBase = `${env.apiPrefix}/tasks`;
const notifBase = `${env.apiPrefix}/notifications`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

function taskPayload(overrides = {}) {
  return {
    title: 'Tâche notifiée',
    description: 'Description suffisamment longue pour passer la validation',
    category: 'development',
    ...overrides,
  };
}

describe('Notifications générées par le cycle de vie des tâches', () => {
  it('crée une notification task_created à la création d’une tâche', async () => {
    const { accessToken } = await loginAs({ email: 'notif-create@example.com' });
    await request(app).post(tasksBase).set('Authorization', `Bearer ${accessToken}`).send(taskPayload());

    const res = await request(app).get(notifBase).set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ type: 'task_created', read: false });
  });

  it('crée une notification task_completed uniquement lors du premier passage à "done"', async () => {
    const { accessToken } = await loginAs({ email: 'notif-complete@example.com' });
    const created = await request(app).post(tasksBase).set('Authorization', `Bearer ${accessToken}`).send(taskPayload());

    await request(app)
      .patch(`${tasksBase}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'done' });
    // Deuxième update sans changement de statut réel (déjà "done") : ne doit pas re-notifier.
    await request(app)
      .patch(`${tasksBase}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'done' });

    const res = await request(app).get(notifBase).set('Authorization', `Bearer ${accessToken}`);
    const completedNotifs = res.body.data.filter((n) => n.type === 'task_completed');

    expect(completedNotifs).toHaveLength(1);
  });

  it("n'expose que les notifications de l'utilisateur connecté", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'notif-scope-a@example.com' });
    const { accessToken: tokenB } = await loginAs({ email: 'notif-scope-b@example.com' });

    await request(app).post(tasksBase).set('Authorization', `Bearer ${tokenA}`).send(taskPayload());

    const resB = await request(app).get(notifBase).set('Authorization', `Bearer ${tokenB}`);
    expect(resB.body.data).toHaveLength(0);
  });
});

describe('PATCH /notifications/:id/read', () => {
  it('marque une notification comme lue', async () => {
    const { accessToken } = await loginAs({ email: 'notif-read@example.com' });
    await request(app).post(tasksBase).set('Authorization', `Bearer ${accessToken}`).send(taskPayload());
    const list = await request(app).get(notifBase).set('Authorization', `Bearer ${accessToken}`);
    const notificationId = list.body.data[0].id;

    const res = await request(app)
      .patch(`${notifBase}/${notificationId}/read`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(true);
  });

  it("refuse de marquer comme lue la notification d'un autre utilisateur", async () => {
    const { accessToken: tokenA } = await loginAs({ email: 'notif-read-a@example.com' });
    const { accessToken: tokenB } = await loginAs({ email: 'notif-read-b@example.com' });

    await request(app).post(tasksBase).set('Authorization', `Bearer ${tokenA}`).send(taskPayload());
    const list = await request(app).get(notifBase).set('Authorization', `Bearer ${tokenA}`);
    const notificationId = list.body.data[0].id;

    const res = await request(app)
      .patch(`${notifBase}/${notificationId}/read`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /notifications/read-all', () => {
  it('marque toutes les notifications comme lues', async () => {
    const { accessToken } = await loginAs({ email: 'notif-read-all@example.com' });
    await request(app).post(tasksBase).set('Authorization', `Bearer ${accessToken}`).send(taskPayload({ title: 'Tâche A' }));
    await request(app).post(tasksBase).set('Authorization', `Bearer ${accessToken}`).send(taskPayload({ title: 'Tâche B' }));

    const markRes = await request(app).patch(`${notifBase}/read-all`).set('Authorization', `Bearer ${accessToken}`);
    expect(markRes.status).toBe(200);

    const list = await request(app).get(notifBase).set('Authorization', `Bearer ${accessToken}`);
    expect(list.body.data.every((n) => n.read)).toBe(true);
  });
});
