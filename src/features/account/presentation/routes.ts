import { createRoute } from '@hono/zod-openapi';

import {
  UserSchema,
  GetProfileSchema,
  UpdateUserSchema,
} from '@/features/account/schema';
import { ErrorResponse } from '@/schema';

export const getProfileRoute = createRoute({
  method: 'get',
  path: '/profile/:id',
  request: {
    params: GetProfileSchema,
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

export const updateProfileRoute = createRoute({
  method: 'put',
  path: '/profile',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateUserSchema,
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
      description: 'Updated user profile',
    },
    ...ErrorResponse,
  },
});
