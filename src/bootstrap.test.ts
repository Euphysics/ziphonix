/* eslint-disable @typescript-eslint/unbound-method */

import { baseBootstrap, docsBootstrap, bootstrap } from '@/bootstrap';
import { Prefix } from '@/constants/prefix';
import { createBaseContainer } from '@/containers/base';
import { TYPES } from '@/containers/types';
import { setupGracefulShutdown } from '@/pkgs/lifecycle/gracefulShutdown';

import type { BaseApp } from '@/app';
import type { AccountApp } from '@/features/account/presentation';
import type { AuthApp } from '@/features/auth/presentation';
import type { IntegrationApp } from '@/features/integration/presentation';
import type { OpenAPIHono } from '@hono/zod-openapi';
import type { Container } from 'inversify';
import type { Mock, Mocked } from 'vitest';

vi.mock('@/containers/base', () => ({
  createBaseContainer: vi.fn(),
}));

vi.mock('@/pkgs/lifecycle/gracefulShutdown', () => ({
  setupGracefulShutdown: vi.fn(),
}));

describe('bootstrap', () => {
  let mockContainer: Mocked<Container>;
  let mockBaseApp: Mocked<BaseApp>;
  let mockAccountApp: Mocked<AccountApp>;
  let mockAuthApp: Mocked<AuthApp>;
  let mockIntegrationApp: Mocked<IntegrationApp>;
  let mockOpenAPIHono: Mocked<OpenAPIHono>;

  beforeEach(() => {
    mockBaseApp = {
      hono: { route: vi.fn().mockReturnThis() },
      shutdown: vi.fn(),
    } as unknown as Mocked<BaseApp>;

    mockAccountApp = {
      app: { route: vi.fn().mockReturnThis() },
    } as unknown as Mocked<AccountApp>;

    mockAuthApp = {
      app: { route: vi.fn().mockReturnThis() },
    } as unknown as Mocked<AuthApp>;

    mockIntegrationApp = {
      app: { route: vi.fn().mockReturnThis() },
    } as unknown as Mocked<IntegrationApp>;

    mockOpenAPIHono = {
      route: vi.fn().mockReturnThis(),
      basePath: vi.fn().mockReturnThis(),
    } as unknown as Mocked<OpenAPIHono>;

    mockContainer = {
      get: vi.fn((type: symbol) => {
        if (type === TYPES.BaseApp) return mockBaseApp;
        if (type === TYPES.OpenAPIHono) return mockOpenAPIHono;
        if (type === TYPES.AccountApp) return mockAccountApp;
        if (type === TYPES.AuthApp) return mockAuthApp;
        if (type === TYPES.IntegrationApp) return mockIntegrationApp;
        return null;
      }),
      isBound: vi.fn(() => true),
      bind: vi.fn(),
    } as unknown as Mocked<Container>;

    (createBaseContainer as Mock).mockReturnValue(mockContainer);
  });

  describe('baseBootstrap', () => {
    it('should initialize base application', () => {
      const result = baseBootstrap();

      expect(createBaseContainer).toHaveBeenCalled();
      expect(mockContainer.get).toHaveBeenCalledWith(TYPES.BaseApp);
      expect(setupGracefulShutdown).toHaveBeenCalledWith(mockBaseApp.shutdown);
      expect(result.hono).toBe(mockBaseApp.hono);
      expect(result.container).toBe(mockContainer);
    });
  });

  describe('docsBootstrap', () => {
    it('should setup API documentation routes', () => {
      const result = docsBootstrap();

      expect(createBaseContainer).toHaveBeenCalled();
      expect(mockContainer.get).toHaveBeenCalledWith(TYPES.OpenAPIHono);
      expect(mockOpenAPIHono.route).toHaveBeenNthCalledWith(
        1,
        Prefix.ACCOUNT,
        mockAccountApp.app,
      );
      expect(mockOpenAPIHono.route).toHaveBeenNthCalledWith(
        2,
        Prefix.AUTH,
        mockAuthApp.app,
      );
      expect(mockOpenAPIHono.route).toHaveBeenNthCalledWith(
        3,
        Prefix.INTEGRATION,
        mockIntegrationApp.app,
      );
      expect(result).toBe(mockOpenAPIHono);
    });
  });

  describe('bootstrap', () => {
    it('should setup application routes', () => {
      const result = bootstrap();

      expect(createBaseContainer).toHaveBeenCalled();
      expect(mockContainer.get).toHaveBeenCalledWith(TYPES.BaseApp);
      expect(mockBaseApp.hono.route).toHaveBeenNthCalledWith(
        1,
        Prefix.ACCOUNT,
        mockAccountApp.app,
      );
      expect(mockBaseApp.hono.route).toHaveBeenNthCalledWith(
        2,
        Prefix.AUTH,
        mockAuthApp.app,
      );
      expect(mockBaseApp.hono.route).toHaveBeenNthCalledWith(
        3,
        Prefix.INTEGRATION,
        mockIntegrationApp.app,
      );
      expect(result).toBe(mockBaseApp.hono);
    });
  });
});
