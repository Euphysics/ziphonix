import { OpenAPIHono } from '@hono/zod-openapi';
import { testClient } from 'hono/testing';

import { AccountApp } from '@/features/account/presentation';

import type { IUserService } from '@/features/account/types';
import type { ErrorHandler } from '@/pkgs/error';
import type { AppLogger } from '@/types';
import type { Context } from 'hono';
import type { Mocked } from 'vitest';

const uuid1 = '00000000-0000-0000-0000-000000000000';
const uuid2 = '00000000-0000-0000-0000-000000000001';

describe('AccountApp (with testClient)', () => {
  let mockUserService: Mocked<IUserService>;
  let mockErrorHandler: Mocked<ErrorHandler>;
  let mockLogger: Mocked<AppLogger>;
  let honoApp: OpenAPIHono;
  let accountApp: AccountApp;

  beforeEach(() => {
    mockUserService = {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
    } as unknown as Mocked<IUserService>;

    mockErrorHandler = {
      errorResponse: vi.fn((c: Context, status: 400) =>
        c.json({ error: 'Not found' }, status),
      ),
      handleInternalServerErrors: vi.fn((context: Context) =>
        context.json({ error: 'Internal error' }, 500),
      ),
      handleZodErrors: vi.fn(),
    } as unknown as Mocked<ErrorHandler>;
    mockLogger = {
      error: vi.fn(),
    } as unknown as Mocked<AppLogger>;

    honoApp = new OpenAPIHono();
    accountApp = new AccountApp(
      honoApp,
      mockErrorHandler,
      mockLogger,
      mockUserService,
    );
  });

  it('should return user data for getProfileRoute', async () => {
    const mockUser = {
      id: uuid1,
      name: 'John Doe',
      role: 'USER' as const,
      lastLogin: new Date(),
    };

    mockUserService.getProfile.mockResolvedValueOnce(mockUser);

    const client = testClient(accountApp.app);

    const res = await client.profile[':id'].$get({ param: { id: uuid1 } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      role: mockUser.role,
      lastLogin: mockUser.lastLogin.toISOString(),
    });
  });

  it('should return 404 if user is not found in getProfileRoute', async () => {
    mockUserService.getProfile.mockResolvedValueOnce(null);

    const client = testClient(accountApp.app);

    const res = await client.profile[':id'].$get({ param: { id: uuid2 } });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('should return user data for updateProfileRoute', async () => {
    const mockUser = {
      id: uuid1,
      name: 'Jane Doe',
      role: 'ADMIN' as const,
      lastLogin: new Date(),
    };

    mockUserService.updateProfile.mockResolvedValueOnce(mockUser);

    const client = testClient(accountApp.app);

    const res = await client.profile.$put({
      json: { id: uuid1, name: 'Jane Doe' },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      role: mockUser.role,
      lastLogin: mockUser.lastLogin.toISOString(),
    });
  });

  it('should return 404 if user is not found in updateProfileRoute', async () => {
    // @ts-expect-error mockResolvedValueOnce is not a function
    mockUserService.updateProfile.mockResolvedValueOnce(null);

    const client = testClient(accountApp.app);

    const res = await client.profile.$put({
      json: { id: uuid2, name: 'Jane Doe' },
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
