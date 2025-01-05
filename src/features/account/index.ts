import { baseBootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { accountBootstrap } from '@/features/account/bootstrap';

const { hono, container } = baseBootstrap();

export const accountApp = hono.route(
  Prefix.ACCOUNT,
  accountBootstrap(container),
);

export type AccountAppType = typeof accountApp;
