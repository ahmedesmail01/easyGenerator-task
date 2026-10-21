import { PasswordService } from './password.service.js';

describe('PasswordService', () => {
  const passwords = new PasswordService();
  beforeAll(async () => {
    await passwords.onModuleInit();
  });

  it('salts hashes uniquely and verifies only the exact password', async () => {
    const first = await passwords.hash('Exact Password1!');
    const second = await passwords.hash('Exact Password1!');
    expect(first).not.toBe(second);
    expect(await passwords.verify('Exact Password1!', first)).toBe(true);
    expect(await passwords.verify('Exact Password1! ', first)).toBe(false);
    expect(await passwords.verify('incorrect', first)).toBe(false);
    expect(await passwords.verify('Exact Password1!')).toBe(false);
  });
});
