import { contextStorage } from 'hono/context-storage';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import { inject, injectable } from 'inversify';

import { Prefix } from '@/constants/prefix';
import { TYPES } from '@/containers/types';
import { loggerMiddleware } from '@/middlewares/logger';
import { requestId } from '@/middlewares/requestId';

import type { ErrorHandler } from '@/pkgs/error';
import type { AppLogger } from '@/types';
import type { Hono, Context } from 'hono';
import type { ClientErrorStatusCode } from 'hono/utils/http-status';

@injectable()
export class BaseApp {
  constructor(
    @inject(TYPES.Hono) private readonly app: Hono,
    @inject(TYPES.Logger) private readonly logger: AppLogger,
    @inject(TYPES.ErrorHandler) private readonly errorHandler: ErrorHandler,
  ) {}

  private handleError = (err: Error, c: Context) => {
    this.logger.error(err.stack || err.message);
    if (!(err instanceof HTTPException)) {
      // Unknown error: Return 500 to prevent information leakage
      return this.errorHandler.errorResponse(c, 500);
    }
    const status = err.status;
    if (400 <= status && status < 500) {
      // Client error
      return this.errorHandler.errorResponse(
        c,
        status as ClientErrorStatusCode,
      );
    }
    // Server error (500 <= status < 600) or unknown error (status < 400 or status >= 600)
    // Always return 500 for server errors to prevent leaking information
    return this.errorHandler.errorResponse(c, 500);
  };

  private handleNotFound = (c: Context) => {
    this.logger.warn(`Not Found: ${c.req.method} ${c.req.url}`);
    return this.errorHandler.errorResponse(c, 404);
  };

  get hono() {
    return (
      this.app
        .basePath(Prefix.GLOBAL)
        // Middlewares
        .use(contextStorage())
        .use(requestId())
        .use(loggerMiddleware(this.logger))
        .use(csrf())
        .use(secureHeaders())
        // Error handler
        .onError(this.handleError)
        .notFound(this.handleNotFound)
    );
  }

  public shutdown = () => {
    this.logger.shutdown();
  };
}
