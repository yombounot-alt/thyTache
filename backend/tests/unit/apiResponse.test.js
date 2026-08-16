const { sendSuccess, sendError } = require('../../src/utils/apiResponse');

function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('utils/apiResponse', () => {
  it('formate une réponse de succès standardisée', () => {
    const res = createMockRes();
    sendSuccess(res, { message: 'OK', data: { id: 1 } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'OK', data: { id: 1 } });
  });

  it('formate une réponse d\'erreur standardisée', () => {
    const res = createMockRes();
    sendError(res, { statusCode: 400, message: 'Erreur', errors: [{ field: 'x' }] });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: 'Erreur',
      errors: [{ field: 'x' }],
    });
  });
});
