import { createIntegrationContainer } from '@/containers/integration';
import { TYPES } from '@/containers/types';

import { integrationBootstrap } from './bootstrap';

import type { IntegrationApp } from '@/features/integration/presentation';
import type { Container } from 'inversify';
import type { Mock } from 'vitest';

vi.mock('@/containers/integration', () => ({
  createIntegrationContainer: vi.fn(),
}));

describe('integrationBootstrap', () => {
  it('should create integration container and return integration app', () => {
    const mockContainer = {} as Container;
    const mockIntegrationApp = { app: 'mockApp' } as unknown as IntegrationApp;
    const mockIntegrationContainer = {
      get: vi.fn().mockReturnValue(mockIntegrationApp),
    };

    (createIntegrationContainer as Mock).mockReturnValue(
      mockIntegrationContainer,
    );

    const result = integrationBootstrap(mockContainer);

    expect(createIntegrationContainer).toHaveBeenCalledWith(mockContainer);
    expect(mockIntegrationContainer.get).toHaveBeenCalledWith(
      TYPES.IntegrationApp,
    );
    expect(result).toBe('mockApp');
  });
});
