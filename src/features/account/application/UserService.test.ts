/* eslint-disable @typescript-eslint/unbound-method */

import { UserService } from './UserService';

import type { IUserRepository } from '@/features/account/types';
import type { Mocked } from 'vitest';

describe('UserService', () => {
  let mockUserRepository: Mocked<IUserRepository>;
  let userService: UserService;

  beforeEach(() => {
    mockUserRepository = {
      create: vi.fn(),
      updateLastLogin: vi.fn(),
      findById: vi.fn(),
      updateName: vi.fn(),
      delete: vi.fn(),
    };

    userService = new UserService(mockUserRepository);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        role: 'USER' as const,
        lastLogin: new Date(),
      };
      mockUserRepository.create.mockResolvedValueOnce(mockUser);

      const result = await userService.createUser({ name: 'John Doe' });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        { name: 'John Doe', role: undefined },
        undefined,
      );
    });
  });

  describe('login', () => {
    it('should update last login and return the user', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Jane Doe',
        role: 'ADMIN' as const,
        lastLogin: new Date(),
      };
      mockUserRepository.updateLastLogin.mockResolvedValueOnce(undefined);
      mockUserRepository.findById.mockResolvedValueOnce(mockUser);

      const result = await userService.login('user123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(
        'user123',
        expect.any(Date),
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
    });

    it('should return null if the user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);

      const result = await userService.login('user123');

      expect(result).toBeNull();
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(
        'user123',
        expect.any(Date),
      );
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        role: 'USER' as const,
        lastLogin: new Date(),
      };
      mockUserRepository.findById.mockResolvedValueOnce(mockUser);

      const result = await userService.getProfile('user123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
    });

    it('should return null if the user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);

      const result = await userService.getProfile('user123');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update the user name', async () => {
      const mockUser = {
        id: 'user123',
        name: 'Updated Name',
        role: 'USER' as const,
        lastLogin: new Date(),
      };
      mockUserRepository.updateName.mockResolvedValueOnce(mockUser);

      const result = await userService.updateProfile('user123', {
        name: 'Updated Name',
      });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.updateName).toHaveBeenCalledWith(
        'user123',
        'Updated Name',
      );
    });

    it('should throw an error if role update is attempted', async () => {
      await expect(
        userService.updateProfile('user123', { role: 'ADMIN' }),
      ).rejects.toThrow('Role update is not supported');
    });
  });

  describe('deleteProfile', () => {
    it('should delete the user profile', async () => {
      mockUserRepository.delete.mockResolvedValueOnce(undefined);

      await userService.deleteProfile('user123');

      expect(mockUserRepository.delete).toHaveBeenCalledWith(
        'user123',
        undefined,
      );
    });
  });
});
