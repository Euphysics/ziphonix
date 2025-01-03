import { inject, injectable } from 'inversify';

import { ErrorCodes, ErrorMessages } from '@/constants/error';
import { TYPES } from '@/containers/types';

import type { AppLogger, Codes, ZodResult } from '@/types';
import type { Context } from 'hono';

@injectable()
export class ErrorHandler {
  constructor(@inject(TYPES.Logger) private logger: AppLogger) {}

  public errorResponse<Code extends Codes>(c: Context, code: Code) {
    return c.json<{ code: Code; message: (typeof ErrorMessages)[Code] }, Code>(
      {
        code,
        message: ErrorMessages[code],
      },
      code,
    );
  }

  public handleInternalServerErrors({ e, c }: { e: unknown; c: Context }) {
    if (e instanceof Error) {
      this.logger.error(e.stack || e.message);
    }
    return this.errorResponse(c, ErrorCodes.InternalServerError);
  }

  public handleZodErrors({ result, c }: { result: ZodResult; c: Context }) {
    if (!result.success) {
      this.logger.error(result.error.message);
      return this.errorResponse(c, ErrorCodes.BadRequest);
    }
  }
}
