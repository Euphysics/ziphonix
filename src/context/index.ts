import { getContext } from 'hono/context-storage';
import { injectable } from 'inversify';

import type { IContextHelper, HonoEnv } from '@/types';

@injectable()
export class ContextHelper implements IContextHelper {
  public getRequestId() {
    return getContext<HonoEnv>().var.requestId;
  }
}
