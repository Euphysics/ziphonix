import type { AppLogger } from '@/types';
import type { MiddlewareHandler } from 'hono';

export const loggerMiddleware: (logger: AppLogger) => MiddlewareHandler =
  (logger: AppLogger) => async (c, next) => {
    const start = Date.now();
    logger.info(`Request started: ${c.req.method} ${c.req.url}`);

    await next();
    logger.info(`Request completed: ${c.res.status} ${Date.now() - start}ms`);
  };
