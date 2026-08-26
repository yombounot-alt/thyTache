const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const otpService = require('../../src/services/otp.service');
const { createVerifiedUser, DEFAULT_PASSWORD } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/auth`;
const NEW_PASSWORD = 'NouveauMotDePasse456!';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe('POST /auth/forgot-password', () => {
  it('retourne une réponse neutre pour un e-mail inconnu', async () => {
    const res = await request(app).post(`${base}/forgot-password`).send({ email: 'inconnu@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retourne la même réponse neutre pour un compte existant', async () => {
    const user = await createVerifiedUser({ email: 'forgot-ok@example.com' });
    const res = await request(app).post(`${base}/forgot-password`).send({ email: user.email });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /auth/reset-password', () => {
  it('réinitialise le mot de passe avec un OTP valide', async () => {
    const user = await createVerifiedUser({ email: 'reset-ok@example.com' });
    const code = await otpService.issueOtp(user._id, 'password_reset');

    const res = await request(app)
      .post(`${base}/reset-password`)
      .send({ email: user.email, otp: code, newPassword: NEW_PASSWORD });
    expect(res.status).toBe(200);

    const loginRes = await request(app).post(`${base}/login`).send({ email: user.email, password: NEW_PASSWORD });
    expect(loginRes.status).toBe(200);
  });

  it('rejette un OTP/token de récupération incorrect', async () => {
    const user = await createVerifiedUser({ email: 'reset-wrong@example.com' });
    await otpService.issueOtp(user._id, 'password_reset');

    const res = await request(app)
      .post(`${base}/reset-password`)
      .send({ email: user.email, otp: '000000', newPassword: NEW_PASSWORD });
    expect(res.status).toBe(400);
  });

  it('rejette un OTP déjà utilisé', async () => {
    const user = await createVerifiedUser({ email: 'reset-reuse@example.com' });
    const code = await otpService.issueOtp(user._id, 'password_reset');

    await request(app)
      .post(`${base}/reset-password`)
      .send({ email: user.email, otp: code, newPassword: NEW_PASSWORD });
    const res = await request(app)
      .post(`${base}/reset-password`)
      .send({ email: user.email, otp: code, newPassword: 'AutreMotDePasse789!' });

    expect(res.status).toBe(400);
  });
});

describe('PATCH /auth/change-password', () => {
  async function loginAndGetToken(overrides) {
    const user = await createVerifiedUser(overrides);
    const loginRes = await request(app).post(`${base}/login`).send({ email: user.email, password: DEFAULT_PASSWORD });
    return { user, accessToken: loginRes.body.data.accessToken };
  }

  it('change le mot de passe avec le bon mot de passe actuel', async () => {
    const { accessToken, user } = await loginAndGetToken({ email: 'change-ok@example.com' });

    const res = await request(app)
      .patch(`${base}/change-password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: DEFAULT_PASSWORD, newPassword: NEW_PASSWORD });
    expect(res.status).toBe(200);

    const loginRes = await request(app).post(`${base}/login`).send({ email: user.email, password: NEW_PASSWORD });
    expect(loginRes.status).toBe(200);
  });

  it('rejette un mauvais mot de passe actuel', async () => {
    const { accessToken } = await loginAndGetToken({ email: 'change-badcurrent@example.com' });

    const res = await request(app)
      .patch(`${base}/change-password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'FauxMotDePasse123!', newPassword: NEW_PASSWORD });
    expect(res.status).toBe(400);
  });
});
