const request = require('supertest');
const app = require('../../src/app');
const { env } = require('../../src/config/env');

describe('GET /api/v1/health', () => {
  it('retourne un statut 200 et confirme que l\'API est opérationnelle', async () => {
    const res = await request(app).get(`${env.apiPrefix}/health`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        message: 'API opérationnelle',
      })
    );
  });
});

describe('Routes inexistantes', () => {
  it('retourne une réponse 404 standardisée', async () => {
    const res = await request(app).get('/route/inexistante');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
