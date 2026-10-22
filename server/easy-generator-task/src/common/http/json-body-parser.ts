import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

const parse = express.json({ limit: '16kb' });

export function jsonBodyParser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  parse(request, response, (error: unknown) => {
    // Normalize before Nest's adapter can reflect JSON.parse's input-dependent message.
    if (typeof error === 'object' && error !== null && 'type' in error) {
      if (error.type === 'entity.parse.failed')
        return next(new BadRequestException('Malformed JSON request body'));
      if (error.type === 'entity.too.large')
        return next(new PayloadTooLargeException('Request body is too large'));
    }
    next(error);
  });
}
