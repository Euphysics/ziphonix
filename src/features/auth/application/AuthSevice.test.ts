/* eslint-disable @typescript-eslint/unbound-method */

import { Authentication } from '@/features/auth/domain/Authentication';
import { verifyPassword } from '@/pkgs/security';

import { AuthService } from './AuthService';

import type { IAuthRepository } from '@/features/auth/types';
import type { AppLogger } from '@/types';
import type { Mock, Mocked } from 'vitest';

describe('AuthService', () => {
  let mockAuthRepository: Mocked<IAuthRepository>;
  let mockLogger: Mocked<AppLogger>;
  let authService: AuthService;

  beforeEach(() => {
    mockAuthRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    mockLogger = {
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as Mocked<AppLogger>;

    authService = new AuthService(mockAuthRepository, mockLogger);

    vi.mock('@/pkgs/security', () => ({
      verifyPassword: vi.fn(),
    }));
  });

  describe('login', () => {
    it('should return Authentication object for valid credentials', async () => {
      const mockAuth = new Authentication({
        userId: 'user123',
        email: 'test@example.com',
        provider: 'CREDENTIAL',
        passwordHash: 'hashed-password',
      });

      mockAuthRepository.findByEmail.mockResolvedValueOnce(mockAuth);
      (verifyPassword as Mock).mockReturnValueOnce(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
        provider: 'CREDENTIAL',
      });

      expect(result).toEqual(mockAuth);
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(verifyPassword).toHaveBeenCalledWith(
        'password123',
        mockAuth.passwordHash,
      );
    });

    it('should return null for invalid password', async () => {
      const mockAuth = new Authentication({
        userId: 'user123',
        email: 'test@example.com',
        provider: 'CREDENTIAL',
        passwordHash: 'hashed-password',
      });

      mockAuthRepository.findByEmail.mockResolvedValueOnce(mockAuth);
      (verifyPassword as Mock).mockReturnValueOnce(false);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
        provider: 'CREDENTIAL',
      });

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('Password does not match.');
    });

    it('should handle social login for new users', async () => {
      mockAuthRepository.findByEmail.mockResolvedValueOnce(null);

      const result = await authService.login({
        email: 'social@example.com',
        provider: 'GOOGLE',
      });

      expect(result).toEqual(
        expect.objectContaining({
          email: 'social@example.com',
          provider: 'GOOGLE',
          isNewUser: true,
        }),
      );
    });

    it('should log a warning if email exists with a different provider', async () => {
      const mockAuth = new Authentication({
        userId: 'user123',
        email: 'social@example.com',
        provider: 'CREDENTIAL',
        passwordHash: 'hashed-password',
      });

      mockAuthRepository.findByEmail.mockResolvedValueOnce(mockAuth);

      const result = await authService.login({
        email: 'social@example.com',
        provider: 'GOOGLE',
      });

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email already exists with a different provider.',
      );
    });
  });

  describe('register', () => {
    it('should create and return an Authentication object', async () => {
      const mockAuth = new Authentication({
        userId: 'user456',
        email: 'newuser@example.com',
        provider: 'CREDENTIAL',
        passwordHash: 'hashed-password',
      });

      mockAuthRepository.create.mockResolvedValueOnce(mockAuth);

      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        provider: 'CREDENTIAL',
        userId: 'user456',
      });

      expect(result).toEqual(mockAuth);
      expect(mockAuthRepository.create).toHaveBeenCalledWith(
        {
          email: 'newuser@example.com',
          password: 'password123',
          provider: 'CREDENTIAL',
          userId: 'user456',
        },
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('should call the repository to delete a user', async () => {
      await authService.delete('user123');

      expect(mockAuthRepository.delete).toHaveBeenCalledWith(
        'user123',
        undefined,
      );
    });

    it('should log an error if deletion fails', async () => {
      const mockError = new Error('Deletion failed');
      mockAuthRepository.delete.mockRejectedValueOnce(mockError);

      await authService.delete('user123');

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to delete user with ID: user123, ${mockError.message}`,
      );
    });
  });
});
