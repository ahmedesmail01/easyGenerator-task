import 'reflect-metadata';
import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { setupApp } from './setup-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: new ConsoleLogger({ json: true }),
  });
  setupApp(app);
  await app.listen(app.get(ConfigService).getOrThrow<number>('PORT'));
}
await bootstrap();
