export function validateEnvironment(env: Record<string, unknown>) {
  const text = (key: string, fallback: string) => {
    const value = env[key] ?? fallback;
    if (typeof value !== 'string' || !value.trim())
      throw new Error(`${key} must be a nonempty string`);
    return value;
  };
  const nodeEnv = text('NODE_ENV', 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv))
    throw new Error('Invalid NODE_ENV');
  const mongoUri = text(
    'MONGODB_URI',
    'mongodb://127.0.0.1:27017/easygenerator',
  );
  if (!/^mongodb(?:\+srv)?:\/\//.test(mongoUri))
    throw new Error('Invalid MONGODB_URI');
  if (nodeEnv === 'production' && !env.MONGODB_URI)
    throw new Error('MONGODB_URI is required in production');
  const origin = text('CLIENT_ORIGIN', 'http://localhost:5173');
  const parsedOrigin = new URL(origin);
  if (
    parsedOrigin.origin !== origin ||
    !['http:', 'https:'].includes(parsedOrigin.protocol)
  ) {
    throw new Error(
      'CLIENT_ORIGIN must be an HTTP(S) origin without a trailing slash',
    );
  }
  if (nodeEnv === 'production' && parsedOrigin.protocol !== 'https:')
    throw new Error('Production requires an HTTPS CLIENT_ORIGIN');
  const port = Number(env.PORT ?? 3000);
  const sessionTtl = Number(env.SESSION_TTL_SECONDS ?? 604800);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid PORT');
  if (!Number.isInteger(sessionTtl) || sessionTtl < 60 || sessionTtl > 2592000)
    throw new Error('SESSION_TTL_SECONDS must be between 60 and 2592000');
  return {
    ...env,
    NODE_ENV: nodeEnv,
    MONGODB_URI: mongoUri,
    CLIENT_ORIGIN: origin,
    PORT: port,
    SESSION_TTL_SECONDS: sessionTtl,
  };
}
