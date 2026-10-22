import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import request from 'supertest';
import { setupApp } from '../src/setup-app.js';
import { hashToken } from '../src/modules/auth/utils/hash-token.js';

const origin = 'http://localhost:5173';
const credentials = { email: 'test@example.com', password: 'Secure123!' };

describe('MongoDB authentication (isolated database)', () => {
  let mongo: MongoMemoryServer;
  let app: INestApplication;
  let connection: Connection;
  let cookie: string;
  let token: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri('auth_test');
    process.env.NODE_ENV = 'test';
    process.env.CLIENT_ORIGIN = origin;
    const { AppModule } = await import('../src/app.module.js');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ bodyParser: false });
    setupApp(app);
    await app.init();
    connection = app.get<Connection>(getConnectionToken());
  }, 120000);

  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });

  const post = (path: string) =>
    request(app.getHttpServer()).post(path).set('Origin', origin);

  it('reports database readiness', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok' });
  });

  it('rejects missing/foreign origins and unauthenticated protected access', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(credentials)
      .expect(403);
    await post('/auth/sign-in')
      .set('Origin', 'https://attacker.example')
      .send(credentials)
      .expect(403);
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    await request(app.getHttpServer()).get('/auth/application').expect(401);
  });

  it('validates required fields, password policy, and rejects unknown properties', async () => {
    for (const payload of [
      { ...credentials, name: 'ab' },
      { email: 'invalid', name: 'Test User', password: 'weak' },
      { ...credentials, name: 'Test User', isAdmin: true },
    ]) {
      await post('/auth/sign-up').send(payload).expect(400);
    }
  });

  it('creates a normalized user, stores only a password hash, and enforces unique email', async () => {
    const response = await post('/auth/sign-up')
      .send({
        ...credentials,
        email: ' Test@Example.com ',
        name: ' Test User ',
      })
      .expect(201);
    expect(response.body.user).toMatchObject({
      email: credentials.email,
      name: 'Test User',
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');
    const stored = await connection
      .collection('users')
      .findOne({ email: credentials.email });
    expect(stored?.passwordHash).toMatch(/^scrypt\$v1\$/);
    expect(stored).not.toHaveProperty('password');
    await post('/auth/sign-up')
      .send({ ...credentials, name: 'Test User' })
      .expect(409);
    const indexes = await connection.collection('users').indexes();
    expect(indexes.some((index) => index.key.email === 1 && index.unique)).toBe(
      true,
    );
  });

  it('uses the same error for nonexistent users and incorrect passwords', async () => {
    const missing = await post('/auth/sign-in')
      .send({ ...credentials, email: 'missing@example.com' })
      .expect(401);
    const incorrect = await post('/auth/sign-in')
      .send({ ...credentials, password: 'Incorrect1!' })
      .expect(401);
    expect(missing.body.message).toBe(incorrect.body.message);
  });

  it('issues an HttpOnly session cookie, stores its hash, and serves protected endpoints', async () => {
    const response = await post('/auth/sign-in').send(credentials).expect(200);
    const setCookie = response.headers['set-cookie'] as unknown as string[];
    expect(setCookie[0]).toContain('HttpOnly');
    expect(setCookie[0]).toContain('SameSite=Lax');
    cookie = setCookie[0]!.split(';')[0]!;
    token = cookie.split('=')[1]!;
    const stored = await connection
      .collection('sessions')
      .findOne({ tokenHash: hashToken(token) });
    expect(stored).toBeTruthy();
    expect(stored).not.toHaveProperty('token');
    expect(stored?.userId.toHexString()).toBe(response.body.user.id);
    expect(response.body).not.toHaveProperty('token');
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    expect(me.body.user.email).toBe(credentials.email);
    expect(me.body.user).not.toHaveProperty('passwordHash');
    expect(me.headers['cache-control']).toBe('no-store');
    await request(app.getHttpServer())
      .get('/auth/application')
      .set('Cookie', cookie)
      .expect(200, { message: 'Welcome to the application.' });
    const indexes = await connection.collection('sessions').indexes();
    expect(
      indexes.some(
        (index) => index.key.expiresAt === 1 && index.expireAfterSeconds === 0,
      ),
    ).toBe(true);
  });

  it('rejects expired sessions before TTL cleanup', async () => {
    await connection
      .collection('sessions')
      .updateOne(
        { tokenHash: hashToken(token) },
        { $set: { expiresAt: new Date(Date.now() - 1000) } },
      );
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(401);
  });

  it('revokes a session on sign-out and cannot reuse the old cookie', async () => {
    const response = await post('/auth/sign-in').send(credentials).expect(200);
    cookie = (response.headers['set-cookie'] as unknown as string[])[0]!.split(
      ';',
    )[0]!;
    const logout = await post('/auth/sign-out')
      .set('Cookie', cookie)
      .expect(204);
    expect(logout.headers['set-cookie'][0]).toContain(
      'Expires=Thu, 01 Jan 1970',
    );
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(401);
    await post('/auth/sign-out').expect(204);
  });

  it('sets Secure cookies in production', async () => {
    const config = app.get(ConfigService);
    config.set('NODE_ENV', 'production');
    try {
      const response = await post('/auth/sign-in')
        .send(credentials)
        .expect(200);
      expect(response.headers['set-cookie'][0]).toContain('Secure');
    } finally {
      config.set('NODE_ENV', 'test');
    }
  });

  it('rate limits repeated sign-up attempts', async () => {
    await post('/auth/sign-up')
      .send({ ...credentials, name: 'Test User' })
      .expect(429);
  });
});
