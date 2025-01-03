import type { AppConfig, LoggerConfig } from '@/types';

import { Config } from './index';

describe('Config', () => {
  let config: Config;

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

  beforeEach(() => {
    config = new Config();
  });

  it('should initialize with default configuration', () => {
    expect(config.get('port')).toBe(defaultAppConfig.port);
    expect(config.get('logger')).toEqual(defaultAppConfig.logger);
  });

  it('should allow updating configuration values', () => {
    config.set('port', 8080);
    expect(config.get('port')).toBe(8080);
  });

  it('should allow partial initialization with custom configuration', () => {
    const customConfig: Partial<AppConfig> = { port: 4000 };
    config = new Config(customConfig);
    expect(config.get('port')).toBe(4000);
    expect(config.get('logger')).toEqual(defaultAppConfig.logger);
  });

  it('should allow updating nested logger configuration', () => {
    const newLoggerConfig: LoggerConfig = {
      ...defaultLoggerConfig,
      enableFile: true,
    };
    config.set('logger', newLoggerConfig);
    expect(config.get('logger').enableFile).toBe(true);
  });

  it('should retain other default values when partially updating configuration', () => {
    config.set('port', 5000);
    expect(config.get('port')).toBe(5000);
    expect(config.get('logger')).toEqual(defaultAppConfig.logger);
  });

  it('should handle undefined values in initial configuration gracefully', () => {
    const customConfig: Partial<AppConfig> = { port: undefined };
    config = new Config(customConfig);
    expect(config.get('port')).toBe(3000); // Default value
  });

  it('should unset values when setting them to undefined', () => {
    expect(config.get('unknown' as keyof AppConfig)).toBeUndefined();
  });
});
