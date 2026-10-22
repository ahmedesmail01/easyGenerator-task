import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import express from 'express';
import { jsonBodyParser } from './common/http/json-body-parser.js';
import { requestLogging } from './common/http/request-logging.js';
import { setupSwagger } from './docs/setup-swagger.js';
import { ApiExceptionFilter } from './common/http/api-exception.filter.js';

export function setupApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const proxyHops = config.getOrThrow<number>('TRUST_PROXY_HOPS');
  if (proxyHops > 0) {
    const instance = app.getHttpAdapter().getInstance() as express.Express;
    instance.set('trust proxy', proxyHops);
  }
  app.use(requestLogging);
  app.useGlobalFilters(new ApiExceptionFilter());
  app.use(helmet());
  app.use(jsonBodyParser);
  app.use(cookieParser());
  app.use(
    (
      _request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      response.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
  app.enableCors({
    origin: config.getOrThrow<string>('CLIENT_ORIGIN'),
    credentials: true,
    exposedHeaders: ['X-Request-ID'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  setupSwagger(app);
  app.enableShutdownHooks();
}
