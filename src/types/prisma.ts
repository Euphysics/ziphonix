import type { PrismaClient } from '@prisma/client';
import type { ITXClientDenyList } from '@prisma/client/runtime/library';

export type PrismaTransaction = Omit<PrismaClient, ITXClientDenyList>;
