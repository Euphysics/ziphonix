import type { User } from '@/features/account/domain/User';
import type { PrismaTransaction } from '@/types/prisma';
import type { Role } from '@prisma/client';

export interface IUserRepository {
  create(
    data: { name: string; role?: Role },
    transaction?: PrismaTransaction,
  ): Promise<User>;
  findById(userId: string): Promise<User | null>;
  updateName(userId: string, name: string): Promise<User>;
  updateLastLogin(userId: string, date: Date): Promise<void>;
  delete(userId: string, transaction?: PrismaTransaction): Promise<void>;
}

export interface IUserService {
  createUser(
    input: { name: string; role?: Role },
    transaction?: PrismaTransaction,
  ): Promise<User>;
  login(userId: string): Promise<User | null>;
  getProfile(userId: string): Promise<User | null>;
  updateProfile(
    userId: string,
    input: Partial<{ name: string; role?: Role }>,
  ): Promise<User>;
  deleteProfile(userId: string, transaction?: PrismaTransaction): Promise<void>;
}
