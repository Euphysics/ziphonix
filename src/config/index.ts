import { injectable } from 'inversify';

import type { AppConfig, IConfig, LoggerConfig } from '@/types';

const defaultLoggerConfig: LoggerConfig = {
  level: 20, // INFO
  format: 'human',
  enableColor: true,
  enableConsole: true,
  enableFile: false,
  filePath: './logs/app.log',
  bufferFlushInterval: 5000,
  bufferSize: 100,
};

const defaultAppConfig: AppConfig = {
  port: 3000,
  logger: defaultLoggerConfig,
};

@injectable()
export class Config implements IConfig {
  private config: AppConfig;

  constructor(initialConfig: Partial<AppConfig> = {}) {
    this.config = {
      port: initialConfig.port || defaultAppConfig.port,
      logger: initialConfig.logger || defaultAppConfig.logger,
    };
  }

  public set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
  }

  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
}
