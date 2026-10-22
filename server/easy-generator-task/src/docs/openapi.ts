// Small, dependency-free OpenAPI contract. Shared responses prevent schema drift.
type Schema = Record<string, unknown>;
const schema = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (value: Schema) => ({ 'application/json': { schema: value } });
const response = (description: string, value: Schema) => ({
  description,
  content: json(value),
});
const errors = (...codes: number[]) =>
  Object.fromEntries(
    codes.map((code) => [
      String(code),
      { $ref: `#/components/responses/Error${code}` },
    ]),
  );
const origin = {
  name: 'Origin',
  in: 'header',
  required: true,
  description: 'Must exactly match CLIENT_ORIGIN. Required on all mutations.',
  schema: { type: 'string' },
  example: 'https://easygenerator.ahmed-esmail.tech',
};
const userResult = {
  type: 'object',
  required: ['user'],
  properties: { user: schema('User') },
};
const signInProperties = {
  email: { type: 'string', format: 'email', maxLength: 254 },
  password: {
    type: 'string',
    minLength: 1,
    maxLength: 128,
    format: 'password',
    writeOnly: true,
  },
};
const body = (name: string) => ({
  required: true,
  content: json(schema(name)),
});
const protectedGet = (summary: string, value: Schema) => ({
  tags: ['Authentication'],
  summary,
  security: [{ sessionCookie: [] }],
  responses: { '200': response(summary, value), ...errors(401, 429, 500) },
});
const errorDescriptions: Record<number, string> = {
  400: 'Invalid fields or malformed JSON',
  401: 'Invalid credentials or missing/expired/revoked session',
  403: 'Missing or disallowed Origin',
  409: 'Email already registered',
  413: 'JSON body exceeds 16 KiB',
  429: 'Rate limit exceeded; wait before retrying',
  500: 'Unexpected server error; report requestId',
  503: 'Database unavailable',
};

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Easygenerator Authentication API',
    version: '1.0.0',
    description:
      'Revocable server-side cookie sessions. No bearer JWT or localStorage token. Mutations require the configured Origin. Every response includes X-Request-ID. Never send confirmPassword to the API.',
  },
  servers: [
    { url: '/api', description: 'Same-origin production API' },
    { url: 'http://localhost:3000', description: 'Local NestJS server' },
  ],
  paths: {
    '/auth/sign-up': {
      post: {
        tags: ['Authentication'],
        summary: 'Create an account; then sign in',
        parameters: [origin],
        requestBody: body('SignUp'),
        responses: {
          '201': response('Account created', userResult),
          ...errors(400, 403, 409, 413, 429, 500),
        },
      },
    },
    '/auth/sign-in': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign in and issue an HttpOnly cookie',
        parameters: [origin],
        requestBody: body('SignIn'),
        responses: {
          '200': {
            ...response('Signed in', {
              type: 'object',
              required: ['user', 'expiresAt'],
              properties: {
                user: schema('User'),
                expiresAt: { type: 'string', format: 'date-time' },
              },
            }),
            headers: {
              'Set-Cookie': {
                description:
                  'eg_session=<opaque-token>; HttpOnly; SameSite=Lax; Path=/; Secure in production. Use a browser or cookie jar.',
                schema: { type: 'string' },
              },
            },
          },
          ...errors(400, 401, 403, 413, 429, 500),
        },
      },
    },
    '/auth/me': { get: protectedGet('Read the current user', userResult) },
    '/auth/application': {
      get: protectedGet('Protected application welcome message', {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', enum: ['Welcome to the application.'] },
        },
      }),
    },
    '/auth/sign-out': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke current session and clear cookie',
        description:
          'Works with or without a session. Returns 204 on repeated logout.',
        parameters: [origin],
        responses: {
          '204': { description: 'Session revoked; cookie cleared' },
          ...errors(403, 429, 500),
        },
      },
    },
    '/health': {
      get: {
        tags: ['Operations'],
        summary: 'Database readiness check',
        responses: {
          '200': response('Database reachable', {
            type: 'object',
            required: ['status'],
            properties: { status: { type: 'string', enum: ['ok'] } },
          }),
          ...errors(503),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: { type: 'apiKey', in: 'cookie', name: 'eg_session' },
    },
    responses: Object.fromEntries(
      Object.entries(errorDescriptions).map(([code, description]) => [
        `Error${code}`,
        {
          ...response(description, schema('ApiError')),
          headers: {
            'X-Request-ID': {
              description:
                'Server-generated correlation ID, also included in the response body',
              schema: { type: 'string', format: 'uuid' },
            },
          },
        },
      ]),
    ),
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SignIn: {
        type: 'object',
        additionalProperties: false,
        required: ['email', 'password'],
        properties: signInProperties,
      },
      SignUp: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'email', 'password'],
        properties: {
          ...signInProperties,
          name: { type: 'string', minLength: 3, maxLength: 100 },
          password: {
            ...signInProperties.password,
            minLength: 8,
            description:
              'At least one letter, number and non-whitespace special character. Passwords are never trimmed.',
          },
        },
      },
      ApiError: {
        type: 'object',
        required: ['statusCode', 'message', 'error', 'requestId', 'timestamp'],
        properties: {
          statusCode: { type: 'integer' },
          message: {
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } },
            ],
          },
          error: { type: 'string' },
          requestId: { type: 'string', format: 'uuid' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};
