import { Container } from 'inversify';

import { TYPES } from '@/containers/types';
import { bindIfNotBound } from '@/containers/utils';
import { AuthService } from '@/features/auth/application/AuthService';
import { AuthRepository } from '@/features/auth/infrastructure/AuthRepository';
import { AuthApp } from '@/features/auth/presentation';

import type { IAuthService, IAuthRepository } from '@/features/auth/types';

export const createAuthContainer = (container: Container): Container => {
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
  bindIfNotBound<AuthApp>(container, TYPES.AuthApp, AuthApp, 'Singleton');

  return container;
};
