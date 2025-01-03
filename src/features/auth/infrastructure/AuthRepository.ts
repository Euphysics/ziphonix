import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';
import { Authentication } from '@/features/auth/domain/Authentication';
import { decrypt, encrypt, hash, hashPassword } from '@/pkgs/security';

import type { IAuthRepository } from '@/features/auth/types';
import type { PrismaTransaction } from '@/types/prisma';
import type { PrismaClient, Provider } from '@prisma/client';

@injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  async create(
    data: {
      email: string;
      provider: Provider;
      password?: string;
      userId: string;
    },
    transaction?: PrismaTransaction,
  ): Promise<Authentication> {
    const prisma = transaction || this.prisma;

    const result = await prisma.authentication.create({
      data: {
        emailEncrypted: encrypt(data.email),
        emailHash: hash(data.email),
        password: data.password ? hashPassword(data.password) : null,
        provider: data.provider,
        userId: data.userId,
      },
      select: { userId: true, provider: true },
    });

    return new Authentication({
      userId: result.userId,
      email: data.email,
      provider: result.provider,
      passwordHash: null,
    });
  }

  async findByEmail(email: string): Promise<Authentication | null> {
    const foundAuth = await this.prisma.authentication.findUnique({
      where: { emailHash: hash(email) },
      select: {
        userId: true,
        emailEncrypted: true,
        provider: true,
        password: true,
      },
    });
    return foundAuth
      ? new Authentication({
          userId: foundAuth.userId,
          email: decrypt(foundAuth.emailEncrypted),
          provider: foundAuth.provider,
          passwordHash: foundAuth.password,
        })
      : null;
  }

  async delete(userId: string, transaction?: PrismaTransaction): Promise<void> {
    const prisma = transaction || this.prisma;

    await prisma.authentication.deleteMany({
      where: { userId },
    });
  }
}
