const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');
const { loginAs } = require('../helpers/factories');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/db');

const base = `${env.apiPrefix}/users`;
const AVATAR_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');

const TINY_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64'
);

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

// Les fichiers écrits sur disque par multer ne sont pas nettoyés par
// clearTestDB (qui ne touche qu'à MongoDB) : on les supprime nous-mêmes
// pour ne pas laisser traîner de fichiers de test sur la machine.
afterEach(() => {
  if (!fs.existsSync(AVATAR_DIR)) return;
  for (const file of fs.readdirSync(AVATAR_DIR)) {
    fs.unlinkSync(path.join(AVATAR_DIR, file));
  }
});

describe('POST /users/me/avatar', () => {
  it('accepte un jpeg valide et enregistre le fichier sur disque', async () => {
    const { accessToken } = await loginAs({ email: 'avatar-ok@example.com' });

    const res = await request(app)
      .post(`${base}/me/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', TINY_JPEG, { filename: 'photo.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.data.avatarUrl).toMatch(/^\/uploads\/avatars\/.+\.jpg$/);

    const savedPath = path.join(AVATAR_DIR, path.basename(res.body.data.avatarUrl));
    expect(fs.existsSync(savedPath)).toBe(true);
  });

  it('remplace (et supprime) le fichier précédent lors d’un nouvel upload', async () => {
    const { accessToken } = await loginAs({ email: 'avatar-replace@example.com' });

    const first = await request(app)
      .post(`${base}/me/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', TINY_JPEG, { filename: 'first.jpg', contentType: 'image/jpeg' });
    const firstPath = path.join(AVATAR_DIR, path.basename(first.body.data.avatarUrl));

    const second = await request(app)
      .post(`${base}/me/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', TINY_JPEG, { filename: 'second.jpg', contentType: 'image/jpeg' });

    expect(second.status).toBe(200);
    expect(second.body.data.avatarUrl).not.toBe(first.body.data.avatarUrl);
    // Laisse le temps à l'unlink best-effort (asynchrone) de s'exécuter.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fs.existsSync(firstPath)).toBe(false);
  });

  it('rejette un type de fichier non autorisé', async () => {
    const { accessToken } = await loginAs({ email: 'avatar-bad-type@example.com' });

    const res = await request(app)
      .post(`${base}/me/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', Buffer.from('not an image'), { filename: 'file.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
  });

  it('rejette une requête sans fichier', async () => {
    const { accessToken } = await loginAs({ email: 'avatar-missing@example.com' });

    const res = await request(app).post(`${base}/me/avatar`).set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it('rejette une requête non authentifiée', async () => {
    const res = await request(app)
      .post(`${base}/me/avatar`)
      .attach('avatar', TINY_JPEG, { filename: 'photo.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(401);
  });
});
