const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const Task = require('../../src/models/Task');
const emailService = require('../../src/services/email.service');
const { checkOverdueTasks } = require('../../src/jobs/overdueTasks.job');
const { sendWeeklyDigests } = require('../../src/jobs/weeklyDigest.job');
const { loginAs } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const tasksBase = `${env.apiPrefix}/tasks`;
const notifBase = `${env.apiPrefix}/notifications`;

beforeAll(connectTestDB);
afterEach(async () => {
  await clearTestDB();
  jest.restoreAllMocks();
});
afterAll(closeTestDB);

function payload(overrides = {}) {
  return {
    title: 'Tâche à surveiller',
    description: 'Description suffisamment longue pour passer la validation',
    category: 'development',
    ...overrides,
  };
}

const PAST_DATE = new Date(Date.now() - 24 * 3600_000).toISOString();
const FUTURE_DATE = new Date(Date.now() + 24 * 3600_000).toISOString();

describe('jobs/overdueTasks : checkOverdueTasks', () => {
  it('notifie une tâche dont la date limite est dépassée', async () => {
    const { accessToken } = await loginAs({ email: 'overdue-notify@example.com' });
    await request(app)
      .post(tasksBase)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload({ dueDate: PAST_DATE }));

    const notified = await checkOverdueTasks();
    expect(notified).toBe(1);

    const res = await request(app).get(notifBase).set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.filter((n) => n.type === 'task_overdue')).toHaveLength(1);

    const task = await Task.findOne({});
    expect(task.overdueNotifiedAt).not.toBeNull();
  });

  it('ne notifie pas deux fois la même tâche (exécutions successives du job)', async () => {
    const { accessToken } = await loginAs({ email: 'overdue-once@example.com' });
    await request(app)
      .post(tasksBase)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload({ dueDate: PAST_DATE }));

    await checkOverdueTasks();
    const secondRun = await checkOverdueTasks();
    expect(secondRun).toBe(0);

    const res = await request(app).get(notifBase).set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.filter((n) => n.type === 'task_overdue')).toHaveLength(1);
  });

  it("ignore une tâche dont l'échéance n'est pas encore dépassée", async () => {
    const { accessToken } = await loginAs({ email: 'overdue-future@example.com' });
    await request(app)
      .post(tasksBase)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload({ dueDate: FUTURE_DATE }));

    expect(await checkOverdueTasks()).toBe(0);
  });

  it('ignore une tâche déjà terminée même en retard', async () => {
    const { accessToken } = await loginAs({ email: 'overdue-done@example.com' });
    const created = await request(app)
      .post(tasksBase)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload({ dueDate: PAST_DATE }));
    await request(app)
      .patch(`${tasksBase}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'done' });

    expect(await checkOverdueTasks()).toBe(0);
  });

  it("re-notifie après un report d'échéance qui redevient dépassée (le report lève le verrou)", async () => {
    const { accessToken } = await loginAs({ email: 'overdue-reset@example.com' });
    const created = await request(app)
      .post(tasksBase)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload({ dueDate: PAST_DATE }));

    await checkOverdueTasks();

    // Report à une date future puis à nouveau dans le passé : la modification
    // de dueDate doit avoir levé overdueNotifiedAt (task.service.updateTask).
    await request(app)
      .patch(`${tasksBase}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ dueDate: FUTURE_DATE });
    await request(app)
      .patch(`${tasksBase}/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ dueDate: PAST_DATE });

    expect(await checkOverdueTasks()).toBe(1);
  });
});

describe('jobs/weeklyDigest : sendWeeklyDigests', () => {
  it('envoie un résumé uniquement aux utilisateurs ayant activé weeklyDigest', async () => {
    const spy = jest.spyOn(emailService, 'sendWeeklyDigestEmail').mockResolvedValue();

    await loginAs({
      email: 'digest-in@example.com',
      preferences: { darkMode: true, emailNotifications: false, pushNotifications: false, weeklyDigest: true },
    });
    await loginAs({
      email: 'digest-out@example.com',
      preferences: { darkMode: true, emailNotifications: false, pushNotifications: false, weeklyDigest: false },
    });

    const count = await sendWeeklyDigests();

    expect(count).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('digest-in@example.com', expect.objectContaining({ firstName: expect.any(String) }));
  });

  it("n'envoie rien à un compte désactivé même si weeklyDigest est activé", async () => {
    const spy = jest.spyOn(emailService, 'sendWeeklyDigestEmail').mockResolvedValue();
    const { user } = await loginAs({
      email: 'digest-inactive@example.com',
      preferences: { darkMode: true, emailNotifications: false, pushNotifications: false, weeklyDigest: true },
    });
    user.isActive = false;
    await user.save();

    await sendWeeklyDigests();
    expect(spy).not.toHaveBeenCalled();
  });
});
