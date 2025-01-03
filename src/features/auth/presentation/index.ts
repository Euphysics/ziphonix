import { inject, injectable } from 'inversify';

import { TYPES } from '@/containers/types';

import type { OpenAPIHono } from '@hono/zod-openapi';

@injectable()
export class AuthApp {
  constructor(@inject(TYPES.OpenAPIHono) private readonly hono: OpenAPIHono) {}

  get app() {
    // No routes registered yet
    return this.hono;
  }
}
