/* eslint-disable @typescript-eslint/unbound-method */

import { User } from '@/features/account/domain/User';

import { UserRepository } from './UserRepository';

import type { PrismaTransaction } from '@/types/prisma';
import type { PrismaClient } from '@prisma/client';
import type { Mock, Mocked } from 'vitest';

vi.mock('@/pkgs/security', () => ({
  encrypt: vi.fn((value: string) => `encrypted-${value}`),
  decrypt: vi.fn((value: string) => value.replace('encrypted-', '')),
}));

describe('UserRepository', () => {
  let mockPrisma: Mocked<PrismaClient>;
  let userRepository: UserRepository;

  beforeEach(() => {
    mockPrisma = {
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    } as unknown as Mocked<PrismaClient>;

    userRepository = new UserRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create a new user with encrypted name', async () => {
      const mockResult = { id: 'user123' };
      (mockPrisma.user.create as Mock).mockResolvedValueOnce(mockResult);

      const result = await userRepository.create({
        name: 'John Doe',
        role: 'USER',
      });

      expect(result).toEqual(
        new User({ id: 'user123', name: 'John Doe', role: 'USER' }),
      );
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'encrypted-John Doe',
          role: 'USER',
        },
        select: { id: true },
      });
    });
  });

  describe('findById', () => {
    it('should return a user with decrypted name if found', async () => {
      const mockResult = {
        id: 'user123',
        name: 'encrypted-John Doe',
        role: 'USER',
        lastLogin: new Date(),
      };
      (mockPrisma.user.findUnique as Mock).mockResolvedValueOnce(mockResult);

      const result = await userRepository.findById('user123');

      expect(result).toEqual(
        new User({
          id: 'user123',
          name: 'John Doe',
          role: 'USER',
          lastLogin: mockResult.lastLogin,
        }),
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { id: true, name: true, role: true, lastLogin: true },
      });
    });

    it('should return null if no user is found', async () => {
      (mockPrisma.user.findUnique as Mock).mockResolvedValueOnce(null);

      const result = await userRepository.findById('user123');

      expect(result).toBeNull();
    });
  });

  describe('updateName', () => {
    it('should update the user name and return the updated user', async () => {
      const mockResult = {
        id: 'user123',
        name: 'encrypted-Updated Name',
        role: 'USER',
        lastLogin: new Date(),
      };
      (mockPrisma.user.update as Mock).mockResolvedValueOnce(mockResult);

      const result = await userRepository.updateName('user123', 'Updated Name');

      expect(result).toEqual(
        new User({
          id: 'user123',
          name: 'Updated Name',
          role: 'USER',
          lastLogin: mockResult.lastLogin,
        }),
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { name: 'encrypted-Updated Name' },
        select: { id: true, name: true, role: true, lastLogin: true },
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login date', async () => {
      const date = new Date();
      (mockPrisma.user.update as Mock).mockResolvedValueOnce({ id: 'user123' });

      await userRepository.updateLastLogin('user123', date);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { lastLogin: date },
        select: { id: true },
      });
    });
  });

  describe('delete', () => {
    it('should mark the user as deleted', async () => {
      const mockTransaction = {
        user: { update: vi.fn() },
      } as unknown as Mocked<PrismaTransaction>;
      (mockTransaction.user.update as Mock).mockResolvedValueOnce(undefined);

      await userRepository.delete('user123', mockTransaction);

      expect(mockTransaction.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { deletedAt: expect.any(Date) as Date },
      });
    });

    it('should use the default prisma client if no transaction is provided', async () => {
      (mockPrisma.user.update as Mock).mockResolvedValueOnce(undefined);

      await userRepository.delete('user123');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { deletedAt: expect.any(Date) as Date },
      });
    });
  });
});
