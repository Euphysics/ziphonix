import { createAuthContainer } from '@/containers/auth';
import { TYPES } from '@/containers/types';

import { authBootstrap } from './bootstrap';

import type { AuthApp } from '@/features/auth/presentation';
import type { Container } from 'inversify';
import type { Mock } from 'vitest';

vi.mock('@/containers/auth', () => ({
  createAuthContainer: vi.fn(),
}));

describe('authBootstrap', () => {
  it('should create auth container and return auth app', () => {
    const mockContainer = {} as Container;
    const mockAuthApp = { app: 'mockApp' } as unknown as AuthApp;
    const mockAuthContainer = {
      get: vi.fn().mockReturnValue(mockAuthApp),
    };

    (createAuthContainer as Mock).mockReturnValue(mockAuthContainer);

    const result = authBootstrap(mockContainer);

    expect(createAuthContainer).toHaveBeenCalledWith(mockContainer);
    expect(mockAuthContainer.get).toHaveBeenCalledWith(TYPES.AuthApp);
    expect(result).toBe('mockApp');
  });
});
