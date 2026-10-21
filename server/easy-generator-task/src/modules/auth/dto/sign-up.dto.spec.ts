import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { SignUpDto } from './sign-up.dto.js';

const valid = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Secure123!',
};
const pipe = new ValidationPipe({
  expectedType: SignUpDto,
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
const validate = (value: unknown) => pipe.transform(value, { type: 'body' });

describe('SignUpDto', () => {
  it.each(['short1!', '12345678!', 'Password!', 'Password1', 'Password1 '])(
    'rejects password policy violation: %s',
    async (password) => {
      await expect(validate({ ...valid, password })).rejects.toThrow();
    },
  );
  it('normalizes email and name without changing passwords', async () => {
    expect(
      await validate({
        ...valid,
        name: ' Test User ',
        email: ' TEST@EXAMPLE.COM ',
        password: ' Secure123! ',
      }),
    ).toMatchObject({ ...valid, password: ' Secure123! ' });
  });
  it.each([
    { ...valid, name: 'ab' },
    { ...valid, email: 'invalid' },
    { ...valid, password: 'a'.repeat(129) },
    { ...valid, admin: true },
    { ...valid, email: { $ne: null } },
  ])('rejects invalid or unexpected input', async (payload) => {
    await expect(validate(payload)).rejects.toThrow();
  });
});
