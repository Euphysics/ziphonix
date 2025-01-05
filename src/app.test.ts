/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { testClient } from 'hono/testing';

import { BaseApp } from '@/app';

import type { ErrorHandler } from '@/pkgs/error';
import type { AppLogger } from '@/types';
import type { Context } from 'hono';
import type { Mocked } from 'vitest';

describe('BaseApp', () => {
  let mockLogger: Mocked<AppLogger>;
  let mockErrorHandler: Mocked<ErrorHandler>;
  let app: OpenAPIHono;
  let baseApp: BaseApp;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      shutdown: vi.fn(),
    } as unknown as Mocked<AppLogger>;

    mockErrorHandler = {
      errorResponse: vi.fn((c: Context, status: 400) =>
        c.text(`Error: ${status}`, status),
      ),
    } as unknown as Mocked<ErrorHandler>;

    app = new OpenAPIHono();
    baseApp = new BaseApp(app, mockLogger, mockErrorHandler);
  });

  describe('hono', () => {
    it('should set up the application with middlewares and routes', () => {
      const honoApp = baseApp.hono;

      expect(honoApp.basePath).toBeDefined();
    });

    it('should handle not found errors', async () => {
      const client = testClient(baseApp.hono);
      // @ts-expect-error non-existent route
      const result = (await client.api.non.$get()) as Response;

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Not Found: GET http://localhost/api/non',
      );
      expect(result.status).toBe(404);
    });

    it('should handle HTTPException errors', async () => {
      baseApp.hono.get('/error', () => {
        throw new HTTPException(400, { message: 'Bad Request' });
      });

      const client = testClient(baseApp.hono);
      // @ts-expect-error non-existent route
      const result = (await client.api.error.$get()) as Response;

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Bad Request'),
      );
      expect(result.status).toBe(400);
      expect(await result.text()).toBe('Error: 400');
    });

    it('should handle unknown errors as 500', async () => {
      baseApp.hono.get('/unknown-error', () => {
        throw new Error('Unexpected error');
      });

      const client = testClient(baseApp.hono);
      // @ts-expect-error non-existent route
      const result = (await client.api['unknown-error'].$get()) as Response;

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected error'),
      );
      expect(result.status).toBe(500);
      expect(await result.text()).toBe('Error: 500');
    });

    it('should handle all server errors as 500', async () => {
      baseApp.hono.get('/server-error', () => {
        throw new HTTPException(503, { message: 'Service Unavailable' });
      });

      const client = testClient(baseApp.hono);
      // @ts-expect-error non-existent route
      const result = (await client.api['server-error'].$get()) as Response;

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Service Unavailable'),
      );
      expect(result.status).toBe(500);
      expect(await result.text()).toBe('Error: 500');
    });
  });

  describe('shutdown', () => {
    it('should shut down the logger', () => {
      baseApp.shutdown();

      expect(mockLogger.shutdown).toHaveBeenCalled();
    });
  });
});
