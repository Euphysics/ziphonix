import type { Role } from '@prisma/client';

export class User {
  public id: string;
  public name: string;
  public role: Role = 'USER';
  public lastLogin: Date | null = null;
  constructor({
    id,
    name,
    role = 'USER',
    lastLogin = null,
  }: {
    id: string;
    name: string;
    role?: Role;
    lastLogin?: Date | null;
  }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.lastLogin = lastLogin;
  }
}
