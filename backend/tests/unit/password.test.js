const { hashPassword, comparePassword } = require('../../src/utils/password');

describe('utils/password', () => {
  it('hash un mot de passe puis valide la comparaison correcte', async () => {
    const plain = 'Sup3r$ecret!';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    await expect(comparePassword(plain, hashed)).resolves.toBe(true);
  });

  it('rejette une comparaison avec un mauvais mot de passe', async () => {
    const hashed = await hashPassword('Sup3r$ecret!');
    await expect(comparePassword('wrong-password', hashed)).resolves.toBe(false);
  });
});
