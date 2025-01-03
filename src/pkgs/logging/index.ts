import { appendFile } from 'node:fs/promises';

import chalk from 'chalk';
import { injectable, inject } from 'inversify';

import { TYPES } from '@/containers/types';
import { LogLevel } from '@/types';

import type { AppLogger, LoggerConfig, IConfig, IContextHelper } from '@/types';
import type { ChalkInstance } from 'chalk';

interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
}

@injectable()
export class Logger implements AppLogger {
  private config: LoggerConfig;
  private logBuffer: string[] = [];
  private readonly bufferFlushInterval: number;
  private flushTimer: NodeJS.Timeout | null = null;

  // ログレベルに対応する色のマッピング
  private levelColors: Record<LogLevel, ChalkInstance> = {
    [LogLevel.DEBUG]: chalk.gray,
    [LogLevel.INFO]: chalk.green,
    [LogLevel.WARN]: chalk.yellow,
    [LogLevel.ERROR]: chalk.red,
    [LogLevel.FATAL]: chalk.bgRed.white,
  };

  constructor(
    @inject(TYPES.Config) private readonly configService: IConfig,
    @inject(TYPES.ContextHelper) private readonly contextHelper: IContextHelper,
  ) {
    this.config = this.configService.get('logger');

    if (this.config.enableFile && !this.config.filePath) {
      throw new Error('filePath must be specified if enableFile is true');
    }

    this.bufferFlushInterval = this.config.bufferFlushInterval || 5000; // Default to 5 seconds
    if (this.config.enableFile) {
      this.startBufferFlush();
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = this.getTimestamp();
    const levelName = LogLevel[level];
    const requestId = this.contextHelper.getRequestId();

    if (this.config.format === 'json') {
      const logObject: LogMessage = {
        timestamp,
        level: levelName,
        message,
        requestId,
      };
      return JSON.stringify(logObject);
    } else {
      return `${timestamp} [${levelName}] [Request ID: ${requestId}] ${message}`;
    }
  }

  private writeLogAsync(formattedMessage: string, level: LogLevel): void {
    if (this.config.enableConsole) {
      const colorFn = this.config.enableColor
        ? (this.levelColors[level] ?? ((msg: string) => msg))
        : (msg: string) => msg;
      console.log(colorFn(formattedMessage));
    }

    if (this.config.enableFile && this.config.filePath) {
      this.logBuffer.push(formattedMessage);
      if (this.logBuffer.length >= this.config.bufferSize) {
        this.flushLogBuffer().catch((err) => {
          console.error('Failed to flush log buffer:', err);
        });
      }
    }
  }

  private async flushLogBuffer(): Promise<void> {
    if (
      !this.config.enableFile ||
      !this.config.filePath ||
      this.logBuffer.length === 0
    ) {
      return;
    }

    const logsToWrite = this.logBuffer.join('\n') + '\n';
    this.logBuffer = [];

    try {
      await appendFile(this.config.filePath, logsToWrite, 'utf-8');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  private startBufferFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushLogBuffer().catch((err) => {
        console.error('Failed to flush log buffer:', err);
      });
    }, this.bufferFlushInterval);
  }

  private stopBufferFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  public debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message);
      this.writeLogAsync(formatted, LogLevel.DEBUG);
    }
  }

  public info(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message);
      this.writeLogAsync(formatted, LogLevel.INFO);
    }
  }

  public warn(message: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message);
      this.writeLogAsync(formatted, LogLevel.WARN);
    }
  }

  public error(message: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message);
      this.writeLogAsync(formatted, LogLevel.ERROR);
    }
  }

  public fatal(message: string): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      const formatted = this.formatMessage(LogLevel.FATAL, message);
      this.writeLogAsync(formatted, LogLevel.FATAL);
    }
  }

  public shutdown(): void {
    this.stopBufferFlush();
    this.flushLogBuffer().catch((err) => {
      console.error('Failed to flush log buffer:', err);
    });
  }

  public setLogLevel(level: LogLevel): void {
    this.config.level = level;
  }
}
