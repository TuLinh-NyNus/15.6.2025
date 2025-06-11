import { User } from '../users/user.entity';

export enum LearningStyleDimension {
  VISUAL = 'VISUAL',
  AUDITORY = 'AUDITORY',
  KINESTHETIC = 'KINESTHETIC',
  READING_WRITING = 'READING_WRITING',
  ACTIVE = 'ACTIVE',
  REFLECTIVE = 'REFLECTIVE',
  SEQUENTIAL = 'SEQUENTIAL',
  GLOBAL = 'GLOBAL',
  SENSING = 'SENSING',
  INTUITIVE = 'INTUITIVE'
}

export class UserLearningStyle {
  id: string;
  userId: string;
  user?: User;
  primaryStyle: LearningStyleDimension;
  secondaryStyle?: LearningStyleDimension;
  visualScore?: number; // 0-100
  auditoryScore?: number; // 0-100
  kinestheticScore?: number; // 0-100
  readingWritingScore?: number; // 0-100
  activeReflectiveScore?: number; // -100 (active) to 100 (reflective)
  sequentialGlobalScore?: number; // -100 (sequential) to 100 (global)
  sensingIntuitiveScore?: number; // -100 (sensing) to 100 (intuitive)
  assessmentDate: Date;
  detailedResults?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}