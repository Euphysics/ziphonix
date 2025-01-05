import { accountApp } from '@/features/account';
import { authApp } from '@/features/auth';
import { integrationApp } from '@/features/integration';

type Service = 'account' | 'auth' | 'integration';

const DEFAULT_SERVICE: Service = 'account';
const DEFAULT_PORT = 3000;

const isService = (service: string): service is Service =>
  ['account', 'auth', 'integration'].includes(service);

const parseArguments = (args: string[]): { service: Service; port: number } => {
  if (args.length > 2) {
    throw new Error(
      'Invalid number of arguments. Expected at most 2 arguments: [service] [port]',
    );
  }

  const [arg1, arg2] = args;
  const port = Number(arg2) || DEFAULT_PORT;

  if (args.length === 1) {
    if (isNaN(Number(arg1))) {
      throw new Error('Invalid port. Expected a numeric value.');
    }
    return { service: DEFAULT_SERVICE, port: Number(arg1) };
  }

  if (args.length === 2) {
    if (!isService(arg1)) {
      throw new Error(
        `Invalid service. Expected one of: account, auth, integration.`,
      );
    }
    if (isNaN(port)) {
      throw new Error('Invalid port. Expected a numeric value.');
    }
    return { service: arg1, port };
  }

  return { service: DEFAULT_SERVICE, port: DEFAULT_PORT };
};

const apps = {
  account: accountApp,
  auth: authApp,
  integration: integrationApp,
};

const { service, port } = parseArguments(process.argv.slice(2));

const app = apps[service];

export default {
  fetch: app.fetch,
  port,
};
