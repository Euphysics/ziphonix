import { z } from '@hono/zod-openapi';

const BadRequestSchema = z.object({
  code: z.literal(400),
  message: z.literal('Bad Request'),
});
const UnauthorizedSchema = z.object({
  code: z.literal(401),
  message: z.literal('Unauthorized'),
});
const NotFoundSchema = z.object({
  code: z.literal(404),
  message: z.string().openapi({
    description: 'Resource not found',
    example: 'User not found',
  }),
});
const InternalServerErrorSchema = z.object({
  code: z.literal(500),
  message: z.literal('Internal Server Error'),
});
export const ErrorResponse = {
  400: {
    content: {
      'application/json': {
        schema: BadRequestSchema,
      },
    },
    description: 'Bad Request',
  },
  401: {
    content: {
      'application/json': {
        schema: UnauthorizedSchema,
      },
    },
    description: 'Unauthorized',
  },
  404: {
    content: {
      'application/json': {
        schema: NotFoundSchema,
      },
    },
    description: 'Not Found',
  },
  500: {
    content: {
      'application/json': {
        schema: InternalServerErrorSchema,
      },
    },
    description: 'Internal Server Error',
  },
};
