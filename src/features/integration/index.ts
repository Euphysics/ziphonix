import { baseBootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { integrationBootstrap } from '@/features/integration/bootstrap';

const { hono, container } = baseBootstrap();

const integrationApp = hono.route(
  Prefix.INTEGRATION,
  integrationBootstrap(container),
);

export default integrationApp;

export type IntegrationAppType = typeof integrationApp;
