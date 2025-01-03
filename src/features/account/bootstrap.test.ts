import { createAccountContainer } from '@/containers/account';
import { TYPES } from '@/containers/types';

import { accountBootstrap } from './bootstrap';

import type { AccountApp } from '@/features/account/presentation';
import type { Container } from 'inversify';
import type { Mock } from 'vitest';

vi.mock('@/containers/account', () => ({
  createAccountContainer: vi.fn(),
}));

describe('accountBootstrap', () => {
  it('should create account container and return account app', () => {
    const mockContainer = {} as Container;
    const mockAccountApp = { app: 'mockApp' } as unknown as AccountApp;
    const mockAccountContainer = {
      get: vi.fn().mockReturnValue(mockAccountApp),
    };

    (createAccountContainer as Mock).mockReturnValue(mockAccountContainer);

    const result = accountBootstrap(mockContainer);

    expect(createAccountContainer).toHaveBeenCalledWith(mockContainer);
    expect(mockAccountContainer.get).toHaveBeenCalledWith(TYPES.AccountApp);
    expect(result).toBe('mockApp');
  });
});
