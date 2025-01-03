import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';

import type { User } from '@/features/account/domain/User';
import type { IUserRepository, IUserService } from '@/features/account/types';
import type { PrismaTransaction } from '@/types/prisma';

interface CreateUserInput {
  name: string;
  role?: 'USER' | 'ADMIN';
}

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async createUser(
    input: CreateUserInput,
    transaction?: PrismaTransaction,
  ): Promise<User> {
    return await this.userRepository.create(input, transaction);
  }

  async login(userId: string): Promise<User | null> {
    await this.userRepository.updateLastLogin(userId, new Date());
    return await this.userRepository.findById(userId);
  }

  async getProfile(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  async updateProfile(
    userId: string,
    input: Partial<CreateUserInput>,
  ): Promise<User> {
    if (input.name) {
      return await this.userRepository.updateName(userId, input.name);
    }
    throw new Error('Role update is not supported');
  }

  async deleteProfile(
    userId: string,
    transaction?: PrismaTransaction,
  ): Promise<void> {
    await this.userRepository.delete(userId, transaction);
  }
}
