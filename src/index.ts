import { bootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { accountBootstrap } from '@/features/account/bootstrap';
import { authBootstrap } from '@/features/auth/bootstrap';
import { integrationBootstrap } from '@/features/integration/bootstrap';

const { hono, container } = bootstrap();
const app = hono
  .route(Prefix.ACCOUNT, accountBootstrap(container))
  .route(Prefix.AUTH, authBootstrap(container))
  .route(Prefix.INTEGRATION, integrationBootstrap(container));

export default app;

export type AppType = typeof app;
