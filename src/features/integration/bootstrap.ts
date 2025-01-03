import { createIntegrationContainer } from '@/containers/integration';
import { TYPES } from '@/containers/types';
import { IntegrationApp } from '@/features/integration/presentation';

import type { Container } from 'inversify';

export const integrationBootstrap = (container: Container) => {
  // Create Integration container
  const integrationContainer = createIntegrationContainer(container);
  const integrationApp = integrationContainer.get<IntegrationApp>(
    TYPES.IntegrationApp,
  );
  return integrationApp.app;
};
