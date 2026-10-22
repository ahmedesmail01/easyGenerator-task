import {
  BadRequestException,
  PayloadTooLargeException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter.js';

function handle(error: unknown) {
  const response = {
    headersSent: false,
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ requestId: 'test-request-id' }),
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  new ApiExceptionFilter().catch(error, host);
  return response;
}

describe('API error boundary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('preserves field validation messages and correlates the response', () => {
    const response = handle(
      new BadRequestException(['email must be an email']),
    );
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['email must be an email'],
        requestId: 'test-request-id',
      }),
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Request-ID',
      'test-request-id',
    );
  });

  it.each([
    new Error('mongodb://admin:secret@localhost'),
    new ServiceUnavailableException('sensitive database details'),
  ])('does not expose internal failures in responses or logs', (error) => {
    const log = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const response = handle(error);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
    expect(JSON.stringify(response.json.mock.calls)).not.toMatch(
      /secret|sensitive|mongodb/,
    );
    expect(JSON.stringify(log.mock.calls)).not.toMatch(
      /secret|sensitive|mongodb/,
    );
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'http.error',
        requestId: 'test-request-id',
      }),
    );
  });

  it.each([
    [
      new BadRequestException('Malformed JSON request body'),
      400,
      'Malformed JSON request body',
    ],
    [
      new PayloadTooLargeException('Request body is too large'),
      413,
      'Request body is too large',
    ],
  ])(
    'handles parser errors without reflecting submitted content',
    (error, status, message) => {
      const response = handle(error);
      expect(response.status).toHaveBeenCalledWith(status);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({ message }),
      );
    },
  );
});
