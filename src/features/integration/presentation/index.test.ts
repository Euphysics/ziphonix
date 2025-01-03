import { OpenAPIHono } from '@hono/zod-openapi';
import { testClient } from 'hono/testing';

import { IntegrationApp } from '@/features/integration/presentation';

import type { IAuthManager } from '@/features/integration/types';
import type { ErrorHandler } from '@/pkgs/error';
import type { AppLogger, ZodResult } from '@/types';
import type { Context } from 'hono';
import type { Mocked } from 'vitest';

type LoginRequest = {
  valid: {
    email: string;
    password: string;
    provider: 'CREDENTIAL';
  };
  invalid: {
    email: string;
    password: string;
    provider: 'CREDENTIAL';
  };
  invalidFormat: {
    email: string;
    password: string;
    provider: 'CREDENTIAL';
  };
};

type RegisterRequest = {
  valid: {
    name: string;
    email: string;
    password: string;
    provider: 'CREDENTIAL';
  };
  invalid: {
    name: string;
    email: string;
    password: string;
    provider: 'CREDENTIAL';
  };
  invalidFormat: {
    name: string;
    email: string;
    password: string;
    provider: 'CREDENTIAL';
  };
};

describe('IntegrationApp (with testClient)', () => {
  let mockAuthManager: Mocked<IAuthManager>;
  let mockErrorHandler: Mocked<ErrorHandler>;
  let mockLogger: Mocked<AppLogger>;
  let honoApp: OpenAPIHono;
  let integrationApp: IntegrationApp;

  const loginRequest: LoginRequest = {
    valid: {
      email: 'test@example.com',
      password: 'Password123',
      provider: 'CREDENTIAL',
    },
    invalid: {
      email: 'test@example.com',
      password: 'WrongPassword123',
      provider: 'CREDENTIAL',
    },
    invalidFormat: {
      email: 'invalid-email',
      password: 'short',
      provider: 'CREDENTIAL',
    },
  };

  const registerRequest: RegisterRequest = {
    valid: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123',
      provider: 'CREDENTIAL',
    },
    invalid: {
      name: 'Error User',
      email: 'error@example.com',
      password: 'WrongPassword123',
      provider: 'CREDENTIAL',
    },
    invalidFormat: {
      name: '',
      email: 'not-an-email',
      password: 'short',
      provider: 'CREDENTIAL',
    },
  };

  beforeEach(() => {
    mockAuthManager = {
      login: vi.fn(),
      register: vi.fn(),
    } as unknown as Mocked<IAuthManager>;

    mockErrorHandler = {
      errorResponse: vi.fn((c: Context, status: 401) =>
        c.json({ error: 'Unauthorized' }, status),
      ),
      handleInternalServerErrors: vi.fn(({ c }: { e: Error; c: Context }) =>
        c.json({ error: 'Internal error' }, 500),
      ),
      handleZodErrors: vi.fn(
        ({ result, c }: { result: ZodResult; c: Context }) => {
          if (!result.success) {
            const error = result.error;
            return c.json({ error: error.message }, 400);
          }
        },
      ),
    } as unknown as Mocked<ErrorHandler>;

    mockLogger = {
      error: vi.fn(),
    } as unknown as Mocked<AppLogger>;

    honoApp = new OpenAPIHono();
    integrationApp = new IntegrationApp(
      honoApp,
      mockErrorHandler,
      mockLogger,
      mockAuthManager,
    );
  });

  it('should return user data for loginRoute', async () => {
    const mockUser = {
      id: '123',
      name: 'John Doe',
      role: 'USER' as const,
      lastLogin: new Date(),
    };

    mockAuthManager.login.mockResolvedValueOnce(mockUser);

    const client = testClient(integrationApp.app);

    const res = await client.login.$post({
      json: loginRequest.valid,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      role: mockUser.role,
      lastLogin: mockUser.lastLogin.toISOString(),
    });
  });

  it('should return 401 if login credentials are invalid', async () => {
    mockAuthManager.login.mockResolvedValueOnce(null);

    const client = testClient(integrationApp.app);

    const res = await client.login.$post({
      json: loginRequest.invalid,
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 for invalid login request format', async () => {
    const client = testClient(integrationApp.app);

    const res = await client.login.$post({
      json: loginRequest.invalidFormat,
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: expect.any(String) as string,
    });
  });

  it('should return user data for registerRoute', async () => {
    const mockUser = {
      id: '124',
      name: 'Jane Doe',
      role: 'ADMIN' as const,
      lastLogin: new Date(),
    };

    mockAuthManager.register.mockResolvedValueOnce(mockUser);

    const client = testClient(integrationApp.app);

    const res = await client.register.$post({
      json: registerRequest.valid,
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      role: mockUser.role,
      lastLogin: mockUser.lastLogin.toISOString(),
    });
  });

  it('should handle internal server errors for registerRoute', async () => {
    mockAuthManager.register.mockRejectedValueOnce(new Error('Database error'));

    const client = testClient(integrationApp.app);

    const res = await client.register.$post({
      json: registerRequest.invalid,
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal error' });
  });

  it('should return 400 for invalid register request format', async () => {
    const client = testClient(integrationApp.app);

    const res = await client.register.$post({
      json: registerRequest.invalidFormat,
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: expect.any(String) as string,
    });
  });
});
