import { Catch, HttpException, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { TracedRequest } from './request-logging.js';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<TracedRequest>();
    const response = http.getResponse<Response>();
    const requestId = request.requestId ?? randomUUID();
    let statusCode = 500;
    let message: string | string[] = 'Internal server error';
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      const detail =
        typeof body === 'string'
          ? body
          : (body as Record<string, unknown>).message;
      if (
        typeof detail === 'string' ||
        (Array.isArray(detail) &&
          detail.every((item) => typeof item === 'string'))
      )
        message = detail;
    }
    if (statusCode >= 500) {
      message = 'Internal server error';
      this.logger.error({
        event: 'http.error',
        requestId,
        statusCode,
        errorType:
          exception instanceof Error
            ? exception.constructor.name
            : 'UnknownError',
      });
    }
    if (response.headersSent) {
      response.end();
      return;
    }
    response.setHeader('X-Request-ID', requestId);
    response.setHeader('Cache-Control', 'no-store');
    response
      .status(statusCode)
      .json({
        statusCode,
        message,
        error: STATUS_CODES[statusCode] ?? 'Error',
        requestId,
        timestamp: new Date().toISOString(),
      });
  }
}
