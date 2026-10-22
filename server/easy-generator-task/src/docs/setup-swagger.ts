import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { openApiDocument } from './openapi.js';

export function setupSwagger(app: INestApplication) {
  SwaggerModule.setup('docs', app, openApiDocument as OpenAPIObject, {
    raw: false, // Keep /openapi.json as the single machine-readable contract.
    customSiteTitle: 'Easygenerator API documentation',
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: false,
      validatorUrl: null,
      displayRequestDuration: true,
    },
  });
}
