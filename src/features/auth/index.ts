import { baseBootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { authBootstrap } from '@/features/auth/bootstrap';

const { hono, container } = baseBootstrap();

export const authApp = hono.route(Prefix.AUTH, authBootstrap(container));

export type AuthAppType = typeof authApp;
