import type { Provider } from '@prisma/client';

export class Authentication {
  public userId: string;
  public email: string;
  public provider: Provider;
  public isNewUser: boolean = false;
  public passwordHash: string | null;

  constructor({
    userId,
    email,
    provider,
    isNewUser = false,
    passwordHash,
  }: {
    userId: string;
    email: string;
    provider: Provider;
    isNewUser?: boolean;
    passwordHash: string | null;
  }) {
    this.userId = userId;
    this.email = email;
    this.provider = provider;
    this.isNewUser = isNewUser;
    this.passwordHash = passwordHash;
  }
}
