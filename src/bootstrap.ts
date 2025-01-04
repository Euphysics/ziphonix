import 'reflect-metadata';
import { Prefix } from '@/constants/prefix';
import { createBaseContainer } from '@/containers/base';
import { TYPES } from '@/containers/types';
import { accountBootstrap } from '@/features/account/bootstrap';
import { authBootstrap } from '@/features/auth/bootstrap';
import { integrationBootstrap } from '@/features/integration/bootstrap';
import { setupGracefulShutdown } from '@/pkgs/lifecycle/gracefulShutdown';

import type { BaseApp } from '@/app';
import type { OpenAPIHono } from '@hono/zod-openapi';

export const baseBootstrap = () => {
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
  return openAPIHono
    .basePath(Prefix.GLOBAL)
    .route(Prefix.ACCOUNT, accountBootstrap(container))
    .route(Prefix.AUTH, authBootstrap(container))
    .route(Prefix.INTEGRATION, integrationBootstrap(container));
};

export const bootstrap = () => {
  const { hono, container } = baseBootstrap();
  return hono
    .route(Prefix.ACCOUNT, accountBootstrap(container))
    .route(Prefix.AUTH, authBootstrap(container))
    .route(Prefix.INTEGRATION, integrationBootstrap(container));
};
