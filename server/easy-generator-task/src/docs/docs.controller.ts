import { Controller, Get } from '@nestjs/common';
import { openApiDocument } from './openapi.js';

@Controller('openapi.json')
export class DocsController {
  @Get()
  document() {
    return openApiDocument;
  }
}
