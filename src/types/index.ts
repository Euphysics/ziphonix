import type { ErrorCodes } from '@/constants/error';
import type { ZodError } from 'zod';

export type HonoEnv = {
  Variables: {
    requestId: string;
  };
};

export type AppConfig = {
  port: number;
  logger: LoggerConfig;
};

export type IConfig = {
  get<K extends keyof AppConfig>(key: K): AppConfig[K];
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void;
};

export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARN = 30,
  ERROR = 40,
  FATAL = 50,
}

export interface AppLogger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  fatal(message: string): void;
  setLogLevel(level: LogLevel): void;
  shutdown(): void;
}

export type LoggerConfig = {
  level: LogLevel;
  format: 'human' | 'json';
  enableColor: boolean;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string; // Required if enableFile is true
  bufferFlushInterval?: number;
  bufferSize: number;
};

export interface IContextHelper {
  getRequestId(): string;
}

export type ZodResult =
  | {
      success: true;
      data: unknown;
    }
  | {
      success: false;
      error: ZodError;
    };

export type Codes = (typeof ErrorCodes)[keyof typeof ErrorCodes];
