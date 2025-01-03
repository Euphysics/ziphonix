import { Prefix } from '@/constants/prefix';
import { accountBootstrap } from '@/features/account/bootstrap';
import { authBootstrap } from '@/features/auth/bootstrap';
import { integrationBootstrap } from '@/features/integration/bootstrap';

import type { OpenAPIHono } from '@hono/zod-openapi';
import type { Hono } from 'hono';
import type { Container } from 'inversify';

export const registerRoutes = (
  hono: Hono<{}, {}, `${typeof Prefix.GLOBAL}`>,
  container: Container,
) =>
  hono
    .route(Prefix.ACCOUNT, accountBootstrap(container))
    .route(Prefix.AUTH, authBootstrap(container))
    .route(Prefix.INTEGRATION, integrationBootstrap(container));

export const registerDocsRoutes = (
  hono: OpenAPIHono<{}, {}, `${typeof Prefix.GLOBAL}`>,
  container: Container,
) =>
  hono
    .route(Prefix.ACCOUNT, accountBootstrap(container))
    .route(Prefix.AUTH, authBootstrap(container))
    .route(Prefix.INTEGRATION, integrationBootstrap(container));
