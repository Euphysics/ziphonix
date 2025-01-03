import { baseBootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { authBootstrap } from '@/features/auth/bootstrap';

const { hono, container } = baseBootstrap();

const authApp = hono.route(Prefix.AUTH, authBootstrap(container));

export default authApp;

export type AuthAppType = typeof authApp;
