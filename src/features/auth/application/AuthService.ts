import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';
import { Authentication } from '@/features/auth/domain/Authentication';
import { verifyPassword } from '@/pkgs/security';

import type { IAuthRepository, IAuthService } from '@/features/auth/types';
import type { AppLogger } from '@/types';
import type { PrismaTransaction } from '@/types/prisma';
import type { Provider } from '@prisma/client';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.AuthRepository)
    private readonly authRepository: IAuthRepository,
    @inject(TYPES.Logger)
    private readonly logger: AppLogger,
  ) {}

  /**
   * Handles user login based on the authentication provider.
   * @param credentials - The user's login credentials.
   * @returns An Authentication object if successful, otherwise null.
   */
  async login(credentials: {
    email: string;
    password?: string;
    provider: Provider;
  }): Promise<Authentication | null> {
    const { email, provider } = credentials;
    const auth = await this.authRepository.findByEmail(email);

    if (provider === 'CREDENTIAL') {
      return this.handleCredentialLogin(auth, credentials);
    } else {
      return this.handleSocialLogin(auth, credentials);
    }
  }

  /**
   * Handles credential-based login.
   * @param auth - The authentication record from the repository.
   * @param credentials - The user's login credentials.
   * @returns An Authentication object if successful, otherwise null.
   */
  private handleCredentialLogin(
    auth: Authentication | null,
    credentials: { email: string; password?: string; provider: Provider },
  ): Authentication | null {
    const { password } = credentials;

    if (!this.isValidCredentialAuth(auth, password)) {
      this.logger.warn('Invalid credentials provided.');
      return null;
    }

    const isPasswordValid = verifyPassword(password!, auth!.passwordHash!);
    if (!isPasswordValid) {
      this.logger.warn('Password does not match.');
      return null;
    }

    return auth;
  }

  /**
   * Validates the authentication record and password presence for credential-based login.
   * @param auth - The authentication record from the repository.
   * @param password - The password provided by the user.
   * @returns True if valid, otherwise false.
   */
  private isValidCredentialAuth(
    auth: Authentication | null,
    password?: string,
  ): boolean {
    return (
      !!auth &&
      auth.provider === 'CREDENTIAL' &&
      !!auth.passwordHash &&
      !!password
    );
  }

  /**
   * Handles social login.
   * @param auth - The authentication record from the repository.
   * @param credentials - The user's login credentials.
   * @returns An Authentication object if successful or a new one for new users, otherwise null.
   */
  private handleSocialLogin(
    auth: Authentication | null,
    credentials: { email: string; provider: Provider },
  ): Authentication | null {
    const { email, provider } = credentials;

    if (!auth) {
      return this.createNewSocialAuth(email, provider);
    }

    if (auth.provider !== provider) {
      this.logger.warn('Email already exists with a different provider.');
      return null;
    }

    return auth;
  }

  /**
   * Creates a new Authentication instance for a social login.
   * @param email - The user's email.
   * @param provider - The social provider.
   * @returns A new Authentication object.
   */
  private createNewSocialAuth(
    email: string,
    provider: Provider,
  ): Authentication {
    return new Authentication({
      userId: '',
      email,
      provider,
      isNewUser: true,
      passwordHash: '',
    });
  }

  /**
   * Registers a new user.
   * @param userDetails - The user's registration details.
   * @param transaction - Optional Prisma transaction.
   * @returns An Authentication object if successful, otherwise null.
   */
  async register(
    userDetails: {
      email: string;
      password?: string;
      provider: Provider;
      userId: string;
    },
    transaction?: PrismaTransaction,
  ): Promise<Authentication> {
    return await this.authRepository.create(userDetails, transaction);
  }

  /**
   * Deletes a user's authentication record.
   * @param userId - The ID of the user to delete.
   * @param transaction - Optional Prisma transaction.
   * @returns True if deletion was successful, otherwise false.
   */
  async delete(userId: string, transaction?: PrismaTransaction): Promise<void> {
    try {
      return await this.authRepository.delete(userId, transaction);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete user with ID: ${userId}, ${error.message}`,
        );
      }
    }
  }
}
