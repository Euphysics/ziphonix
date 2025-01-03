/* eslint-disable @typescript-eslint/unbound-method */

import { ErrorCodes, ErrorMessages } from '@/constants/error';

import type { AppLogger, ZodResult } from '@/types';
import type { Context } from 'hono';
import type { ZodError } from 'zod';

import { ErrorHandler } from './index';

describe('ErrorHandler', () => {
  const mockLogger: AppLogger = {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    setLogLevel: vi.fn(),
    shutdown: vi.fn(),
  };

  const mockContext = {
    json: vi.fn(),
  };

  const errorHandler = new ErrorHandler(mockLogger);

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('errorResponse', () => {
    it('should return a JSON response with the correct code and message', () => {
      const code = ErrorCodes.InternalServerError;
      const response = errorHandler.errorResponse(
        mockContext as unknown as Context,
        code,
      );

      expect(mockContext.json).toHaveBeenCalledWith(
        {
          code,
          message: ErrorMessages[code],
        },
        code,
      );
      expect(response).toEqual(mockContext.json.mock.results[0].value);
    });
  });

  describe('handleInternalServerErrors', () => {
    it('should log the error and return an internal server error response', () => {
      const error = new Error('Test error');
      const response = errorHandler.handleInternalServerErrors({
        e: error,
        c: mockContext as unknown as Context,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        error.stack || error.message,
      );
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          code: ErrorCodes.InternalServerError,
          message: ErrorMessages[ErrorCodes.InternalServerError],
        },
        ErrorCodes.InternalServerError,
      );
      expect(response).toEqual(mockContext.json.mock.results[0].value);
    });
  });

  describe('handleZodErrors', () => {
    it('should log the error and return a bad request response if validation fails', () => {
      const result: ZodResult = {
        success: false,
        error: {
          message: 'Validation error',
        } as ZodError,
      };
      const response = errorHandler.handleZodErrors({
        result,
        c: mockContext,
      } as unknown as { result: ZodResult; c: Context });

      expect(mockLogger.error).toHaveBeenCalledWith(result.error.message);
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          code: ErrorCodes.BadRequest,
          message: ErrorMessages[ErrorCodes.BadRequest],
        },
        ErrorCodes.BadRequest,
      );
      expect(response).toEqual(mockContext.json.mock.results[0].value);
    });

    it('should not log an error or return a response if validation succeeds', () => {
      const result: ZodResult = {
        success: true,
        data: {},
      };
      const response = errorHandler.handleZodErrors({
        result,
        c: mockContext,
      } as unknown as { result: ZodResult; c: Context });

      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockContext.json).not.toHaveBeenCalled();
      expect(response).toBeUndefined();
    });
  });
});
