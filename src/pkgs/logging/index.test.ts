import { appendFile } from 'node:fs/promises';

import { vi, type Mock, type Mocked } from 'vitest';

import { LogLevel, type IConfig } from '@/types';

import { Logger } from './index';

vi.mock('node:fs/promises', () => ({
  appendFile: vi.fn(),
}));

vi.mock('@/middlewares/requestId', () => ({
  getRequestId: vi.fn(() => 'test-request-id'),
}));

describe('Logger', () => {
  let mockConfigService: Mocked<IConfig>;
  let logger: Logger;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue({
        enableConsole: true,
        enableFile: false,
        level: LogLevel.DEBUG,
        format: 'text',
        enableColor: true,
        bufferFlushInterval: 5000,
        bufferSize: 10,
        filePath: './logs/test.log',
      }),
    } as unknown as Mocked<IConfig>;

    logger = new Logger(mockConfigService);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log methods', () => {
    it('should log debug messages', () => {
      logger.debug('debug message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('info message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('warn message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('error message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log fatal messages', () => {
      logger.fatal('fatal message');
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('file logging', () => {
    it('should write logs to file when enabled', async () => {
      mockConfigService.get.mockReturnValueOnce({
        ...mockConfigService.get('logger'),
        enableFile: true,
      });
      logger = new Logger(mockConfigService);

      logger.info('file log message');
      await logger['flushLogBuffer']();

      expect(appendFile).toHaveBeenCalledWith(
        './logs/test.log',
        expect.stringContaining('file log message\n'),
        'utf-8',
      );
    });

    it('should handle flush errors gracefully', async () => {
      mockConfigService.get.mockReturnValueOnce({
        ...mockConfigService.get('logger'),
        enableFile: true,
        filePath: './logs/test.log',
      });
      logger = new Logger(mockConfigService);
      logger['logBuffer'] = ['test log message']; // Simulate a log buffer

      (appendFile as Mock).mockRejectedValueOnce(new Error('File write error'));

      await logger['flushLogBuffer']();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to write to log file:',
        expect.any(Error),
      );
    });
  });

  describe('buffer flush', () => {
    it('should flush logs when buffer is full', () => {
      mockConfigService.get.mockReturnValueOnce({
        ...mockConfigService.get('logger'),
        enableFile: true,
        bufferSize: 2,
      });
      logger = new Logger(mockConfigService);

      logger.info('message 1');
      logger.info('message 2');

      expect(appendFile).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should stop the buffer flush timer and flush remaining logs', () => {
      const flushSpy = vi
        .spyOn(logger, 'flushLogBuffer' as never)
        .mockImplementation(() => Promise.resolve());

      logger.shutdown();

      expect(flushSpy).toHaveBeenCalled();
      flushSpy.mockRestore();
    });
  });

  describe('setLogLevel', () => {
    it('should update the log level', () => {
      logger.setLogLevel(LogLevel.ERROR);
      expect(mockConfigService.get('logger').level).toBe(LogLevel.ERROR);
    });
  });

  describe('configuration errors', () => {
    it('should throw an error if file logging is enabled without a filePath', () => {
      mockConfigService.get.mockReturnValueOnce({
        ...mockConfigService.get('logger'),
        enableFile: true,
        filePath: undefined,
      });

      expect(() => new Logger(mockConfigService)).toThrow(
        'filePath must be specified if enableFile is true',
      );
    });
  });
});
