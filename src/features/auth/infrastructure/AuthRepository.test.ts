/* eslint-disable @typescript-eslint/unbound-method */

import { Authentication } from '@/features/auth/domain/Authentication';

import { AuthRepository } from './AuthRepository';

import type { PrismaTransaction } from '@/types/prisma';
import type { PrismaClient } from '@prisma/client';
import type { Mock, Mocked } from 'vitest';

vi.mock('@/pkgs/security', () => ({
  encrypt: vi.fn((value: string) => `encrypted-${value}`),
  decrypt: vi.fn((value: string) => value.replace('encrypted-', '')),
  hash: vi.fn((value: string) => `hashed-${value}`),
  hashPassword: vi.fn((value: string) => `hashedPassword-${value}`),
}));

describe('AuthRepository', () => {
  let mockPrisma: Mocked<PrismaClient>;
  let authRepository: AuthRepository;

  beforeEach(() => {
    mockPrisma = {
      authentication: {
        create: vi.fn(),
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
      },
    } as unknown as Mocked<PrismaClient>;

    authRepository = new AuthRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create a new authentication record', async () => {
      const mockData = {
        email: 'user@example.com',
        provider: 'CREDENTIAL' as const,
        password: 'password123',
        userId: 'user123',
      };

      const mockResult = { userId: 'user123', provider: 'CREDENTIAL' };
      (mockPrisma.authentication.create as Mock).mockResolvedValueOnce(
        mockResult,
      );

      const result = await authRepository.create(mockData);

      expect(result).toEqual(
        new Authentication({
          userId: 'user123',
          email: 'user@example.com',
          provider: 'CREDENTIAL',
          passwordHash: null,
        }),
      );

      expect(mockPrisma.authentication.create).toHaveBeenCalledWith({
        data: {
          emailEncrypted: 'encrypted-user@example.com',
          emailHash: 'hashed-user@example.com',
          password: 'hashedPassword-password123',
          provider: 'CREDENTIAL',
          userId: 'user123',
        },
        select: { userId: true, provider: true },
      });
    });

    it('should handle missing password for non-credential providers', async () => {
      const mockData = {
        email: 'user@example.com',
        provider: 'GOOGLE' as const,
        userId: 'user123',
      };

      const mockResult = { userId: 'user123', provider: 'GOOGLE' };
      (mockPrisma.authentication.create as Mock).mockResolvedValueOnce(
        mockResult,
      );

      const result = await authRepository.create(mockData);

      expect(result).toEqual(
        new Authentication({
          userId: 'user123',
          email: 'user@example.com',
          provider: 'GOOGLE',
          passwordHash: null,
        }),
      );

      expect(mockPrisma.authentication.create).toHaveBeenCalledWith({
        data: {
          emailEncrypted: 'encrypted-user@example.com',
          emailHash: 'hashed-user@example.com',
          password: null,
          provider: 'GOOGLE',
          userId: 'user123',
        },
        select: { userId: true, provider: true },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return an Authentication object if email is found', async () => {
      const mockResult = {
        userId: 'user123',
        emailEncrypted: 'encrypted-user@example.com',
        provider: 'CREDENTIAL',
        password: 'hashedPassword-password123',
      };

      (mockPrisma.authentication.findUnique as Mock).mockResolvedValueOnce(
        mockResult,
      );

      const result = await authRepository.findByEmail('user@example.com');

      expect(result).toEqual(
        new Authentication({
          userId: 'user123',
          email: 'user@example.com',
          provider: 'CREDENTIAL',
          passwordHash: 'hashedPassword-password123',
        }),
      );

      expect(mockPrisma.authentication.findUnique).toHaveBeenCalledWith({
        where: { emailHash: 'hashed-user@example.com' },
        select: {
          userId: true,
          emailEncrypted: true,
          provider: true,
          password: true,
        },
      });
    });

    it('should return null if email is not found', async () => {
      (mockPrisma.authentication.findUnique as Mock).mockResolvedValueOnce(
        null,
      );

      const result = await authRepository.findByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete authentication records by userId', async () => {
      const mockTransaction = {
        authentication: { deleteMany: vi.fn() },
      } as unknown as PrismaTransaction;
      (mockTransaction.authentication.deleteMany as Mock).mockResolvedValueOnce(
        undefined,
      );

      await authRepository.delete('user123', mockTransaction);

      expect(mockTransaction.authentication.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
    });

    it('should use the default prisma client if no transaction is provided', async () => {
      (mockPrisma.authentication.deleteMany as Mock).mockResolvedValueOnce(
        undefined,
      );

      await authRepository.delete('user123');

      expect(mockPrisma.authentication.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
    });
  });
});
