import { OpenAPIHono } from '@hono/zod-openapi';
import { PrismaClient } from '@prisma/client';
import { Hono } from 'hono';
import { Container } from 'inversify';

import { BaseApp } from '@/app';
import { Config } from '@/config';
import { TYPES } from '@/containers/types';
import { bindIfNotBound } from '@/containers/utils';
import { ContextHelper } from '@/context';
import { ErrorHandler } from '@/pkgs/error';
import { Logger } from '@/pkgs/logging';

import type { AppConfig, AppLogger, IConfig, IContextHelper } from '@/types';

export const createBaseContainer = (config?: Partial<AppConfig>): Container => {
  const container = new Container();

  // Common bindings
  container.bind<IConfig>(TYPES.Config).toConstantValue(new Config(config));
  bindIfNotBound<BaseApp>(container, TYPES.BaseApp, BaseApp, 'Singleton');
  bindIfNotBound<IContextHelper>(
    container,
    TYPES.ContextHelper,
    ContextHelper,
    'Singleton',
  );
  bindIfNotBound<ErrorHandler>(
    container,
    TYPES.ErrorHandler,
    ErrorHandler,
    'Singleton',
  );
  bindIfNotBound<AppLogger>(container, TYPES.Logger, Logger, 'Singleton');
  bindIfNotBound<Hono>(container, TYPES.Hono, Hono, 'Singleton');
  bindIfNotBound<OpenAPIHono>(
    container,
    TYPES.OpenAPIHono,
    OpenAPIHono,
    'Singleton',
  );
  bindIfNotBound<PrismaClient>(
    container,
    TYPES.PrismaClient,
    PrismaClient,
    'Singleton',
  );

  return container;
};
