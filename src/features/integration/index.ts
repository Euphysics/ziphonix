import { baseBootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { integrationBootstrap } from '@/features/integration/bootstrap';

const { hono, container } = baseBootstrap();

export const integrationApp = hono.route(
  Prefix.INTEGRATION,
  integrationBootstrap(container),
);

export type IntegrationAppType = typeof integrationApp;
