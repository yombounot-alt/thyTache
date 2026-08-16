const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const User = require('../../src/models/User');
const Verification = require('../../src/models/Verification');
const otpService = require('../../src/services/otp.service');
const { sha256 } = require('../../src/utils/hash');
const { createVerifiedUser } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/auth`;

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

async function registerUnverifiedUser(email) {
  await request(app)
    .post(`${base}/register`)
    .send({ firstName: 'Lamah', lastName: 'Foromo', email, password: 'MotDePasseSecurise123!' });
  return User.findOne({ email });
}

describe('POST /auth/verify-email', () => {
  it('vérifie l\'e-mail avec un OTP valide', async () => {
    const email = 'otp-valid@example.com';
    const user = await registerUnverifiedUser(email);
    const code = await otpService.issueOtp(user._id, 'email_verification');

    const res = await request(app).post(`${base}/verify-email`).send({ email, otp: code });

    expect(res.status).toBe(200);
    const updated = await User.findOne({ email });
    expect(updated.isEmailVerified).toBe(true);
  });

  it('rejette un OTP incorrect', async () => {
    const email = 'otp-wrong@example.com';
    const user = await registerUnverifiedUser(email);
    await otpService.issueOtp(user._id, 'email_verification');

    const res = await request(app).post(`${base}/verify-email`).send({ email, otp: '000000' });
    expect(res.status).toBe(400);
  });

  it('rejette un OTP expiré', async () => {
    const email = 'otp-expired@example.com';
    const user = await registerUnverifiedUser(email);

    await Verification.create({
      user: user._id,
      codeHash: sha256('111111'),
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() - 1000),
    });

    const res = await request(app).post(`${base}/verify-email`).send({ email, otp: '111111' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/resend-otp', () => {
  it('bloque un renvoi immédiat (délai anti-abus)', async () => {
    const email = 'resend-cooldown@example.com';
    await registerUnverifiedUser(email);

    const res = await request(app).post(`${base}/resend-otp`).send({ email });
    expect(res.status).toBe(400);
  });

  it('autorise un renvoi une fois le délai écoulé et invalide l\'ancien code', async () => {
    const email = 'resend-ok@example.com';
    const user = await registerUnverifiedUser(email);

    // Mongoose protège `createdAt` (option `timestamps`) contre Model.updateOne(),
    // qui l'ignore silencieusement : on passe par le driver MongoDB natif pour antidater le document.
    await Verification.collection.updateOne(
      { user: user._id, purpose: 'email_verification' },
      { $set: { createdAt: new Date(Date.now() - 120 * 1000) } }
    );

    const res = await request(app).post(`${base}/resend-otp`).send({ email });
    expect(res.status).toBe(200);

    const active = await Verification.find({ user: user._id, purpose: 'email_verification', used: false });
    expect(active).toHaveLength(1);
  });

  it('renvoie une réponse neutre pour un e-mail inconnu', async () => {
    const res = await request(app).post(`${base}/resend-otp`).send({ email: 'inconnu@example.com' });
    expect(res.status).toBe(200);
  });

  it('renvoie une réponse neutre si le compte est déjà vérifié', async () => {
    const user = await createVerifiedUser({ email: 'deja-verifie@example.com' });
    const res = await request(app).post(`${base}/resend-otp`).send({ email: user.email });
    expect(res.status).toBe(200);
  });
});
