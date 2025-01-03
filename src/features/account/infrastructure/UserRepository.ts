import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';
import { User } from '@/features/account/domain/User';
import { decrypt, encrypt } from '@/pkgs/security';

import type { IUserRepository } from '@/features/account/types';
import type { PrismaTransaction } from '@/types/prisma';
import type { PrismaClient, Role } from '@prisma/client';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient,
  ) {}

  async create(
    data: { name: string; role?: Role },
    transaction?: PrismaTransaction,
  ): Promise<User> {
    const encryptedName = encrypt(data.name);

    const prisma = transaction || this.prisma;

    const result = await prisma.user.create({
      data: {
        name: encryptedName,
        role: data.role,
      },
      select: { id: true },
    });

    return new User({
      id: result.id,
      name: data.name,
      role: data.role,
    });
  }

  async findById(userId: string): Promise<User | null> {
    const foundUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, lastLogin: true },
    });
    return foundUser
      ? new User({
          id: foundUser.id,
          name: decrypt(foundUser.name),
          role: foundUser.role,
          lastLogin: foundUser.lastLogin,
        })
      : null;
  }

  async updateName(userId: string, name: string): Promise<User> {
    const encryptedName = encrypt(name);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { name: encryptedName },
      select: { id: true, name: true, role: true, lastLogin: true },
    });
    return new User({
      id: updatedUser.id,
      name: decrypt(updatedUser.name),
      role: updatedUser.role,
      lastLogin: updatedUser.lastLogin,
    });
  }

  async updateLastLogin(userId: string, date: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: date },
      select: { id: true },
    });
  }

  async delete(userId: string, transaction?: PrismaTransaction): Promise<void> {
    const prisma = transaction || this.prisma;
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
