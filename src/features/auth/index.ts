import { bootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { authBootstrap } from '@/features/auth/bootstrap';

const { hono, container } = bootstrap();

const authApp = hono.route(Prefix.AUTH, authBootstrap(container));

export default authApp;

export type AuthAppType = typeof authApp;
