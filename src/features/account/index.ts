import { bootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { accountBootstrap } from '@/features/account/bootstrap';

const { hono, container } = bootstrap();

const accountApp = hono.route(Prefix.ACCOUNT, accountBootstrap(container));

export default accountApp;

export type AccountAppType = typeof accountApp;
