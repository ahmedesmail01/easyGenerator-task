import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export type TracedRequest = Request & { requestId?: string };
const logger = new Logger('HTTP');

export function requestLogging(
  request: TracedRequest,
  response: Response,
  next: NextFunction,
) {
  // Generate IDs on the server; never trust arbitrary client headers in logs.
  const requestId = randomUUID();
  request.requestId = requestId;
  response.setHeader('X-Request-ID', requestId);
  const started = performance.now();
  let logged = false;
  const complete = () => {
    if (logged) return;
    logged = true;
    const route = request.route as { path?: unknown } | undefined;
    const record = {
      event: 'http.request',
      requestId,
      method: request.method,
      route: typeof route?.path === 'string' ? route.path : 'unmatched',
      statusCode: response.writableFinished ? response.statusCode : 499,
      durationMs: Math.round((performance.now() - started) * 100) / 100,
    };
    // Bodies, query strings, headers, cookies, tokens and email addresses are omitted.
    if (record.statusCode >= 500) logger.error(record);
    else if (record.statusCode >= 400) logger.warn(record);
    else logger.log(record);
  };
  response.once('finish', complete);
  response.once('close', complete);
  next();
}
