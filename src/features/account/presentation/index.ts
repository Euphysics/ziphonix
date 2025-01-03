import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';
import {
  getProfileRoute,
  updateProfileRoute,
} from '@/features/account/presentation/routes';

import type { IUserService } from '@/features/account/types';
import type { ErrorHandler } from '@/pkgs/error';
import type { AppLogger } from '@/types';
import type { OpenAPIHono } from '@hono/zod-openapi';

@injectable()
export class AccountApp {
  constructor(
    @inject(TYPES.OpenAPIHono) private readonly hono: OpenAPIHono,
    @inject(TYPES.ErrorHandler) private readonly errorHandler: ErrorHandler,
    @inject(TYPES.Logger) private readonly logger: AppLogger,
    @inject(TYPES.UserService) private readonly userService: IUserService,
  ) {}

  get app() {
    return this.hono
      .openapi(
        getProfileRoute,
        async (c) => {
          try {
            const { id } = c.req.valid('param');
            const user = await this.userService.getProfile(id);
            if (!user) {
              this.logger.error(`User not found: ${id}`);
              return this.errorHandler.errorResponse(c, 404);
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
        updateProfileRoute,
        async (c) => {
          try {
            const { id, name } = c.req.valid('json');
            const user = await this.userService.updateProfile(id, { name });
            if (!user) {
              this.logger.error(`User not found: ${id}`);
              return this.errorHandler.errorResponse(c, 404);
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
      );
  }
}
