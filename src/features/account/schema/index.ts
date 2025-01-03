import { z } from '@hono/zod-openapi';

const RoleSchema = z.enum(['ADMIN', 'USER']).openapi({
  description: 'User role',
  example: 'USER',
});
const DateISOStringSchema = z
  .string()
  .transform((val) => new Date(val).toISOString());
export const NameSchema = z.string().min(3).max(255).openapi({
  description: 'User name',
  example: 'Alice',
});
export const UserSchema = z.object({
  id: z.string().uuid().openapi({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  name: NameSchema,
  role: RoleSchema,
  lastLogin: DateISOStringSchema.openapi({
    description: 'Last login timestamp',
    example: '2021-09-22T00:00:00.000Z',
  }),
});
export const UpdateUserSchema = z
  .object({
    id: z.string().uuid(),
    name: NameSchema.optional(),
    role: RoleSchema.optional(),
  })
  .openapi({
    description: 'User update input',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Alice',
    },
  });
export const GetProfileSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({
      description: 'User ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
      param: {
        in: 'path',
        name: 'id',
        required: true,
      },
    }),
});
