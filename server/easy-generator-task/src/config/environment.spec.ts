import { validateEnvironment } from './environment.js';

describe('environment', () => {
  it('provides local development defaults', () => {
    expect(validateEnvironment({})).toMatchObject({
      PORT: 3000,
      MONGODB_URI: 'mongodb://127.0.0.1:27017/easygenerator',
    });
  });
  it.each([
    { NODE_ENV: 'production' },
    {
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb://localhost/db',
      CLIENT_ORIGIN: 'http://example.com',
    },
    { PORT: 'invalid' },
    { SESSION_TTL_SECONDS: '-1' },
    { CLIENT_ORIGIN: 'https://example.com/path' },
  ])('rejects unsafe or invalid configuration', (env) => {
    expect(() => validateEnvironment(env)).toThrow();
  });
});
