import { Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import type { NextFunction, Response } from 'express';
import { requestLogging } from './request-logging.js';
import type { TracedRequest } from './request-logging.js';

it('logs one correlated record without bodies, cookies, queries, or client-supplied IDs', () => {
  const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  try {
    const request = {
      method: 'POST',
      route: { path: '/auth/sign-in' },
      body: { password: 'secret' },
      url: '/auth/sign-in?token=secret',
      headers: { cookie: 'secret', 'x-request-id': 'secret' },
    } as unknown as TracedRequest;
    const response = Object.assign(new EventEmitter(), {
      setHeader: vi.fn(),
      writableFinished: true,
      statusCode: 200,
    });
    const next = vi.fn();
    requestLogging(
      request,
      response as unknown as Response,
      next as NextFunction,
    );
    response.emit('finish');
    response.emit('close');
    expect(next).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        route: '/auth/sign-in',
        requestId: request.requestId,
        statusCode: 200,
      }),
    );
    expect(request.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
  } finally {
    log.mockRestore();
  }
});
