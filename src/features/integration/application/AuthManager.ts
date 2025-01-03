import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';

import type { User } from '@/features/account/domain/User';
import type { IUserService } from '@/features/account/types';
import type { IAuthService } from '@/features/auth/types';
import type { IAuthManager } from '@/features/integration/types';
import type { AppLogger } from '@/types';
import type { PrismaClient, Provider } from '@prisma/client';

@injectable()
export class AuthManager implements IAuthManager {
  constructor(
    @inject(TYPES.UserService)
    private readonly userService: IUserService,
    @inject(TYPES.AuthService)
    private readonly authService: IAuthService,
    @inject(TYPES.PrismaClient)
    private readonly prisma: PrismaClient,
    @inject(TYPES.Logger)
    private readonly logger: AppLogger,
  ) {}

  /**
   * Handles the user login process.
   * @param credentials - The user's login credentials.
   * @returns The authenticated User object if successful, otherwise null.
   */
  async login(credentials: {
    email: string;
    password?: string;
    provider: Provider;
  }): Promise<User | null> {
    try {
      const authResult = await this.authService.login(credentials);
      if (!authResult) {
        return null;
      }

      if (this.isSocialProvider(credentials.provider) && authResult.isNewUser) {
        return await this.handleSocialRegistration(credentials);
      }

      return await this.userService.login(authResult.userId);
    } catch (error) {
      // Consider logging the error with a logger service if available
      if (error instanceof Error) {
        this.logger.error(`Login failed: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Handles the registration process for social logins.
   * @param credentials - The user's registration credentials.
   * @returns The authenticated User object if registration and login are successful, otherwise null.
   */
  private async handleSocialRegistration(credentials: {
    email: string;
    provider: Provider;
  }): Promise<User | null> {
    const { email, provider } = credentials;

    const user = await this.register({
      name: '', // Consider prompting the user for a name or fetching from provider
      email,
      provider,
    });

    if (!user) {
      return null;
    }

    return await this.userService.login(user.id);
  }

  /**
   * Registers a new user within a database transaction.
   * @param userDetails - The user's registration details.
   * @returns The newly created User object if successful, otherwise null.
   */
  async register(details: {
    name: string;
    email: string;
    password?: string;
    provider: Provider;
  }): Promise<User> {
    return await this.prisma.$transaction(async (transaction) => {
      const user = await this.userService.createUser(
        {
          name: details.name,
          role: 'USER',
        },
        transaction,
      );

      await this.authService.register(
        {
          email: details.email,
          password: details.password,
          provider: details.provider,
          userId: user.id,
        },
        transaction,
      );
      return user;
    });
  }

  /**
   * Determines if the provider is a social provider.
   * @param provider - The authentication provider.
   * @returns True if the provider is a social provider, otherwise false.
   */
  private isSocialProvider(provider: Provider): boolean {
    return provider !== 'CREDENTIAL';
  }
}
