import 'reflect-metadata';

import { createBaseContainer } from '@/containers/base';
import { TYPES } from '@/containers/types';
import { setupGracefulShutdown } from '@/pkgs/lifecycle/gracefulShutdown';

import type { BaseApp } from '@/app';

export const bootstrap = () => {
  // Your app initialization code here
  const container = createBaseContainer();
  const app = container.get<BaseApp>(TYPES.BaseApp);
  setupGracefulShutdown(app.shutdown);
  return {
    hono: app.hono,
    container,
  };
};
