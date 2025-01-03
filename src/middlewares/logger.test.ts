/* eslint-disable @typescript-eslint/unbound-method */

import { loggerMiddleware } from './logger';

import type { AppLogger } from '@/types';
import type { Context } from 'hono';
import type { Mock, Mocked } from 'vitest';

describe('loggerMiddleware', () => {
  let mockLogger: Mocked<AppLogger>;
  let mockContext: Mocked<Context>;
  let next: Mock;

  beforeEach(() => {
    mockLogger = { info: vi.fn() } as unknown as Mocked<AppLogger>;
    mockContext = {
      req: { method: 'GET', url: '/test' },
      res: { status: 200 },
    } as unknown as Mocked<Context>;
    next = vi.fn().mockResolvedValue(undefined);
  });

  it('should log request started and completed', async () => {
    const middleware = loggerMiddleware(mockLogger);

    await middleware(mockContext, next);

    expect(mockLogger.info).toHaveBeenCalledWith(
      `Request started: ${mockContext.req.method} ${mockContext.req.url}`,
    );

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(`Request completed: ${mockContext.res.status} \\d+ms`),
      ),
    );

    expect(next).toHaveBeenCalled();
  });

  it('should correctly calculate response time', async () => {
    const middleware = loggerMiddleware(mockLogger);

    const delay = 100;
    next.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, delay)),
    );

    const startTime = Date.now();
    await middleware(mockContext, next);
    const duration = Date.now() - startTime;

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(
          `Request completed: ${mockContext.res.status} ${duration}ms`,
        ),
      ),
    );
  });
});
