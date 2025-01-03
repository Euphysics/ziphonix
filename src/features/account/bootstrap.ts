import { createAccountContainer } from '@/containers/account';
import { TYPES } from '@/containers/types';

import type { AccountApp } from '@/features/account/presentation';
import type { Container } from 'inversify';

export const accountBootstrap = (container: Container) => {
  // Create Account container
  const accountContainer = createAccountContainer(container);
  const accountApp = accountContainer.get<AccountApp>(TYPES.AccountApp);
  return accountApp.app;
};
