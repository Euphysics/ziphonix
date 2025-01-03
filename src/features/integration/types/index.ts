import type { User } from '@/features/account/domain/User';
import type { Provider } from '@prisma/client';

export interface IAuthManager {
  login(credentials: {
    email: string;
    password?: string;
    provider: Provider;
  }): Promise<User | null>;
  register(details: {
    name: string;
    email: string;
    password?: string;
    provider: Provider;
  }): Promise<User>;
}
