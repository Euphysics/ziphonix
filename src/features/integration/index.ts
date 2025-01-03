import { bootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { integrationBootstrap } from '@/features/integration/bootstrap';

const { hono, container } = bootstrap();

const integrationApp = hono.route(
  Prefix.INTEGRATION,
  integrationBootstrap(container),
);

export default integrationApp;

export type IntegrationAppType = typeof integrationApp;
