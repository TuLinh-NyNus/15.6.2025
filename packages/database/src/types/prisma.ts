import { PrismaClient } from '@prisma/client';

export interface UserProfileSocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  [key: string]: string | undefined;
}

export interface UserProfilePreferences {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  language?: string;
  theme?: string;
  [key: string]: unknown;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}

// Re-export types from Prisma Client
export type { PrismaClient }; 