import { z } from '@hono/zod-openapi';

import { NameSchema } from '@/features/account/schema';

const ProviderSchema = z
  .enum(['GOOGLE', 'GITHUB', 'CREDENTIAL'])
  .openapi('AuthProvider', {
    description: 'Authentication provider',
    example: 'GOOGLE',
  });
const EmailSchema = z.string().email().openapi('UserEmail', {
  description: 'User email',
  example: 'example@example.com',
});
const PasswordSchema = z
  .string()
  .min(8)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .openapi('UserPassword', {
    description: 'User password',
    example: 'Password123',
  });
export const CredentialsSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema.optional(),
    provider: ProviderSchema,
  })
  .openapi('UserCredentials', {
    description: 'User credentials',
    example: {
      email: 'example@example.com',
      password: 'Password123',
      provider: 'GOOGLE',
    },
  });
export const RegisterSchema = z
  .object({
    name: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    provider: ProviderSchema,
  })
  .openapi('UserRegister', {
    description: 'User registration input',
    example: {
      name: 'Alice',
      email: 'example@example.com',
      password: 'Password123',
      provider: 'GOOGLE',
    },
  });
