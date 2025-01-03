import { Container } from 'inversify';

import { TYPES } from '@/containers/types';
import { bindIfNotBound } from '@/containers/utils';
import { UserService } from '@/features/account/application/UserService';
import { UserRepository } from '@/features/account/infrastructure/UserRepository';
import { AccountApp } from '@/features/account/presentation';

import type { IUserRepository, IUserService } from '@/features/account/types';

export const createAccountContainer = (container: Container): Container => {
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
  bindIfNotBound<AccountApp>(
    container,
    TYPES.AccountApp,
    AccountApp,
    'Singleton',
  );
  return container;
};
