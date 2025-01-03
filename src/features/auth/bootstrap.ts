import { createAuthContainer } from '@/containers/auth';
import { TYPES } from '@/containers/types';

import type { AuthApp } from '@/features/auth/presentation';
import type { Container } from 'inversify';

export const authBootstrap = (container: Container) => {
  // Create Account container
  const authContainer = createAuthContainer(container);
  const authApp = authContainer.get<AuthApp>(TYPES.AuthApp);
  return authApp.app;
};
