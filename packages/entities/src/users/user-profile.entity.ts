import { User } from './user.entity';

export enum PreferredLanguage {
  VIETNAMESE = 'vi',
  ENGLISH = 'en'
}

export enum PreferredContentFormat {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  INTERACTIVE = 'INTERACTIVE',
  MIXED = 'MIXED'
}

export class UserProfile {
  id: string;
  userId: string;
  user?: User;
  bio?: string;
  phoneNumber?: string;
  address?: string;
  birthDate?: Date;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, unknown>;
  completionRate: number;
  avatar?: string;
  preferredLanguage?: PreferredLanguage;
  preferredContentFormat?: PreferredContentFormat;
  notificationSettings?: Record<string, boolean>;
  learningGoals?: string[];
  availableHoursPerWeek?: number;
  timezone?: string;
  professionalBackground?: string;
  educationBackground?: string;
  createdAt: Date;
  updatedAt: Date;
} 