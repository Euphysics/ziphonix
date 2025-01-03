import { Container } from 'inversify';

import { TYPES } from '@/containers/types';
import { bindIfNotBound } from '@/containers/utils';
import { UserService } from '@/features/account/application/UserService';
import { UserRepository } from '@/features/account/infrastructure/UserRepository';
import { AuthService } from '@/features/auth/application/AuthService';
import { AuthRepository } from '@/features/auth/infrastructure/AuthRepository';
import { AuthManager } from '@/features/integration/application/AuthManager';
import { IntegrationApp } from '@/features/integration/presentation';

import type { IUserRepository, IUserService } from '@/features/account/types';
import type { IAuthRepository, IAuthService } from '@/features/auth/types';
import type { IAuthManager } from '@/features/integration/types';

export const createIntegrationContainer = (container: Container): Container => {
  bindIfNotBound<IUserRepository>(
    container,
    TYPES.UserRepository,
    UserRepository,
    'Singleton',
  );
  bindIfNotBound<IUserService>(
    container,
    TYPES.UserService,
    UserService,
    'Singleton',
  );
  bindIfNotBound<IAuthRepository>(
    container,
    TYPES.AuthRepository,
    AuthRepository,
    'Singleton',
  );
  bindIfNotBound<IAuthService>(
    container,
    TYPES.AuthService,
    AuthService,
    'Singleton',
  );
  bindIfNotBound<IAuthManager>(
    container,
    TYPES.AuthManager,
    AuthManager,
    'Singleton',
  );
  bindIfNotBound<IntegrationApp>(
    container,
    TYPES.IntegrationApp,
    IntegrationApp,
    'Singleton',
  );

  return container;
};
