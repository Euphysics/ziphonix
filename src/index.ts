import { bootstrap } from '@/bootstrap';
import { registerRoutes } from '@/routes';

const { hono, container } = bootstrap();

const app = registerRoutes(hono, container);

export default app;

export type AppType = typeof app;
