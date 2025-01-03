import 'reflect-metadata';

import { createBaseContainer } from '@/containers/base';
import { TYPES } from '@/containers/types';
import { setupGracefulShutdown } from '@/pkgs/lifecycle/gracefulShutdown';

import type { BaseApp } from '@/app';
import type { OpenAPIHono } from '@hono/zod-openapi';

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

export const docsBootstrap = () => {
  const container = createBaseContainer();
  const openAPIHono = container.get<OpenAPIHono>(TYPES.OpenAPIHono);
  return {
    hono: openAPIHono,
    container,
  };
};
