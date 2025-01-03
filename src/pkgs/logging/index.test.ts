import { appendFile } from 'node:fs/promises';

import { Container } from 'inversify';

import { TYPES } from '@/containers/types';
import { Logger } from '@/pkgs/logging';
import { LogLevel } from '@/types';

import type { IConfig, IContextHelper } from '@/types';

vi.mock('node:fs/promises', () => ({
  appendFile: vi.fn().mockResolvedValue(undefined),
}));

describe('Logger', () => {
  let logger: Logger;
  let mockConfigService: IConfig;
  let mockContextHelper: IContextHelper;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue({
        enableConsole: true,
        enableFile: true,
        filePath: 'test.log',
        level: LogLevel.DEBUG,
        format: 'text',
        enableColor: true,
        bufferFlushInterval: 5000,
        bufferSize: 10,
      }),
      set: vi.fn(),
    };

    mockContextHelper = {
      getRequestId: vi.fn().mockReturnValue('test-request-id'),
    };

    const container = new Container();
    container.bind<IConfig>(TYPES.Config).toConstantValue(mockConfigService);
    container
      .bind<IContextHelper>(TYPES.ContextHelper)
      .toConstantValue(mockContextHelper);
    container.bind<Logger>(Logger).toSelf();

    logger = container.get<Logger>(Logger);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const logLevels = [
    { method: 'debug', level: LogLevel.DEBUG },
    { method: 'info', level: LogLevel.INFO },
    { method: 'warn', level: LogLevel.WARN },
    { method: 'error', level: LogLevel.ERROR },
    { method: 'fatal', level: LogLevel.FATAL },
  ];

  logLevels.forEach(({ method, level }) => {
    it(`should log ${method} messages`, () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      // @ts-expect-error - we are testing dynamic method calls
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      logger[method](`${method} message`);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[${LogLevel[level]}]`),
      );
      consoleSpy.mockRestore();
    });
  });

  it('should write logs to file when buffer size is reached', () => {
    for (let i = 0; i < 10; i++) {
      logger.debug(`test log ${i}`);
    }

    expect(appendFile).toHaveBeenCalledWith(
      'test.log',
      expect.stringContaining('test log 9'),
      'utf-8',
    );
  });

  it('should flush log buffer on shutdown', () => {
    const flushSpy = vi
      .spyOn(logger, 'flushLogBuffer' as never)
      .mockImplementation(() => Promise.resolve());
    logger.shutdown();
    expect(flushSpy).toHaveBeenCalled();
    flushSpy.mockRestore();
  });

  it('should respect log level settings', () => {
    logger.setLogLevel(LogLevel.WARN);
    logger.debug('should not log this');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.warn('should log this');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
    consoleSpy.mockRestore();
  });

  it('should throw an error if filePath is not provided when enableFile is true', () => {
    mockConfigService.get = vi.fn().mockReturnValue({ enableFile: true });
    expect(() => new Logger(mockConfigService, mockContextHelper)).toThrow(
      'filePath must be specified if enableFile is true',
    );
  });
});
