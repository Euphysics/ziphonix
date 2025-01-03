import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';
import {
  loginRoute,
  registerRoute,
} from '@/features/integration/presentation/routes';

import type { IAuthManager } from '@/features/integration/types';
import type { ErrorHandler } from '@/pkgs/error';
import type { AppLogger } from '@/types';
import type { OpenAPIHono } from '@hono/zod-openapi';

@injectable()
export class IntegrationApp {
  constructor(
    @inject(TYPES.OpenAPIHono) private readonly hono: OpenAPIHono,
    @inject(TYPES.ErrorHandler) private readonly errorHandler: ErrorHandler,
    @inject(TYPES.Logger) private readonly logger: AppLogger,
    @inject(TYPES.AuthManager) private readonly authManager: IAuthManager,
  ) {}

  get app() {
    return this.hono
      .openapi(
        loginRoute,
        async (c) => {
          try {
            const { email, password, provider } = c.req.valid('json');
            const user = await this.authManager.login({
              email,
              password,
              provider,
            });
            if (!user) {
              this.logger.error(`Invalid credentials: ${email}`);
              return this.errorHandler.errorResponse(c, 401);
            }
            return c.json(
              {
                id: user.id,
                name: user.name,
                role: user.role,
                lastLogin: user.lastLogin ? user.lastLogin.toISOString() : '',
              },
              200,
            );
          } catch (e) {
            return this.errorHandler.handleInternalServerErrors({ e, c });
          }
        },
        (result, c) => this.errorHandler.handleZodErrors({ result, c }),
      )
      .openapi(
        registerRoute,
        async (c) => {
          try {
            const { name, email, password, provider } = c.req.valid('json');
            const user = await this.authManager.register({
              name,
              email,
              password,
              provider,
            });
            return c.json(
              {
                id: user.id,
                name: user.name,
                role: user.role,
                lastLogin: user.lastLogin ? user.lastLogin.toISOString() : '',
              },
              200,
            );
          } catch (e) {
            return this.errorHandler.handleInternalServerErrors({ e, c });
          }
        },
        (result, c) => this.errorHandler.handleZodErrors({ result, c }),
      );
  }
}
