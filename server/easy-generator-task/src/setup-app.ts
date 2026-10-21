import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import express from 'express';

export function setupApp(app: INestApplication) {
  const config = app.get(ConfigService);
  app.use(helmet());
  app.use(express.json({ limit: '16kb' }));
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
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();
}
