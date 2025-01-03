import { getContext } from 'hono/context-storage';
import { v7 } from 'uuid';

import type { HonoEnv } from '@/types';
import type { Context, MiddlewareHandler } from 'hono';

export const requestId: () => MiddlewareHandler =
  () => async (c: Context<HonoEnv>, next) => {
    const requestId = v7();
    c.set('requestId', requestId);
    c.header('X-Request-ID', requestId);
    await next();
  };

export const getRequestId = () => getContext<HonoEnv>().var.requestId;
