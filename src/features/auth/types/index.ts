import type { Authentication } from '@/features/auth/domain/Authentication';
import type { PrismaTransaction } from '@/types/prisma';
import type { Provider } from '@prisma/client';

export interface IAuthRepository {
  create(
    data: {
      email: string;
      provider: Provider;
      password?: string;
      userId: string;
    },
    transaction?: PrismaTransaction,
  ): Promise<Authentication>;
  findByEmail(email: string): Promise<Authentication | null>;
  delete(userId: string, transaction?: PrismaTransaction): Promise<void>;
}

export interface IAuthService {
  login({
    email,
    password,
    provider,
  }: {
    email: string;
    password?: string;
    provider: Provider;
  }): Promise<Authentication | null>;
  register(
    {
      email,
      password,
      provider,
      userId,
    }: {
      email: string;
      password?: string;
      provider: Provider;
      userId: string;
    },
    transaction?: PrismaTransaction,
  ): Promise<Authentication>;
  delete(userId: string, transaction?: PrismaTransaction): Promise<void>;
}
