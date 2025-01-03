/* eslint-disable @typescript-eslint/unbound-method */

import { AuthManager } from './AuthManager';

import type { IUserService } from '@/features/account/types';
import type { IAuthService } from '@/features/auth/types';
import type { AppLogger } from '@/types';
import type { PrismaClient } from '@prisma/client';
import type { Mocked } from 'vitest';

describe('AuthManager', () => {
  let mockUserService: Mocked<IUserService>;
  let mockAuthService: Mocked<IAuthService>;
  let mockPrisma: Mocked<PrismaClient>;
  let mockLogger: Mocked<AppLogger>;
  let authManager: AuthManager;

  beforeEach(() => {
    mockUserService = {
      login: vi.fn(),
      createUser: vi.fn(),
    } as unknown as Mocked<IUserService>;

    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
    } as unknown as Mocked<IAuthService>;

    mockPrisma = {
      $transaction: vi.fn(),
    } as unknown as Mocked<PrismaClient>;

    mockLogger = {
      error: vi.fn(),
    } as unknown as Mocked<AppLogger>;

    authManager = new AuthManager(
      mockUserService,
      mockAuthService,
      mockPrisma,
      mockLogger,
    );
  });

  describe('login', () => {
    it('should return User object if authentication is successful', async () => {
      const mockAuthResult = {
        userId: 'user123',
        isNewUser: false,
        provider: 'CREDENTIAL' as const,
        email: 'example@example.com',
        passwordHash: 'password123',
      };
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        role: 'USER' as const,
        lastLogin: new Date(),
      };

      mockAuthService.login.mockResolvedValueOnce(mockAuthResult);
      mockUserService.login.mockResolvedValueOnce(mockUser);

      const result = await authManager.login({
        email: 'test@example.com',
        provider: 'CREDENTIAL',
      });

      expect(result).toEqual(mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        provider: 'CREDENTIAL',
      });
      expect(mockUserService.login).toHaveBeenCalledWith('user123');
    });

    it('should return null if authentication fails', async () => {
      mockAuthService.login.mockResolvedValueOnce(null);

      const result = await authManager.login({
        email: 'test@example.com',
        provider: 'CREDENTIAL',
      });

      expect(result).toBeNull();
    });

    it('should handle social registration for new social users', async () => {
      const mockAuthResult = {
        userId: 'user123',
        isNewUser: true,
        provider: 'GOOGLE' as const,
        email: 'example@gmail.com',
        passwordHash: null,
      };
      const mockUser = {
        id: 'user123',
        name: 'Jane Doe',
        role: 'USER' as const,
        lastLogin: new Date(),
      };

      mockAuthService.login.mockResolvedValueOnce(mockAuthResult);
      mockUserService.login.mockResolvedValueOnce(mockUser);
      mockPrisma.$transaction.mockResolvedValueOnce(mockUser);

      const result = await authManager.login({
        email: 'social@example.com',
        provider: 'GOOGLE',
      });

      expect(result).toEqual(mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'social@example.com',
        provider: 'GOOGLE',
      });
    });

    it('should log an error and return null if an exception occurs', async () => {
      const mockError = new Error('Unexpected error');
      mockAuthService.login.mockRejectedValueOnce(mockError);

      const result = await authManager.login({
        email: 'error@example.com',
        provider: 'CREDENTIAL',
      });

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Login failed: ${mockError.message}`,
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user456',
        name: 'New User',
        role: 'USER' as const,
        lastLogin: new Date(),
      };

      mockUserService.createUser.mockResolvedValueOnce(mockUser);
      // @ts-expect-error null is a valid return value
      mockAuthService.register.mockResolvedValueOnce(null);
      mockPrisma.$transaction.mockImplementationOnce((fn) => fn(mockPrisma));

      const result = await authManager.register({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        provider: 'CREDENTIAL',
      });

      expect(result).toEqual(mockUser);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        { name: 'New User', role: 'USER' },
        mockPrisma,
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(
        {
          email: 'newuser@example.com',
          password: 'password123',
          provider: 'CREDENTIAL',
          userId: 'user456',
        },
        mockPrisma,
      );
    });

    it('should throw an error if registration fails', async () => {
      const mockError = new Error('Database error');
      mockPrisma.$transaction.mockRejectedValueOnce(mockError);

      await expect(
        authManager.register({
          name: 'Fail User',
          email: 'fail@example.com',
          password: 'password123',
          provider: 'CREDENTIAL',
        }),
      ).rejects.toThrow('Database error');
    });
  });
});
