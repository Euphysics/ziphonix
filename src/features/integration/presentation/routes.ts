import { createRoute } from '@hono/zod-openapi';

import { UserSchema } from '@/features/account/schema';
import {
  CredentialsSchema,
  RegisterSchema,
} from '@/features/integration/schema';
import { ErrorResponse } from '@/schema';

export const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CredentialsSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User profile',
    },
    ...ErrorResponse,
  },
});

export const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'User profile',
    },
    ...ErrorResponse,
  },
});
