import { IBaseRepository } from '../base/base-repository.interface';

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

export interface UserLearningStyle {
  id: string;
  userId: string;
  primaryStyle: LearningStyleDimension;
  secondaryStyle?: LearningStyleDimension;
  visualScore?: number;
  auditoryScore?: number;
  kinestheticScore?: number;
  readingWritingScore?: number;
  activeReflectiveScore?: number;
  sequentialGlobalScore?: number;
  sensingIntuitiveScore?: number;
  assessmentDate: Date;
  detailedResults?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserLearningStyleRepository extends IBaseRepository<UserLearningStyle, string> {
  findByUserId(userId: string): Promise<UserLearningStyle | null>;
  updateScores(
    id: string, 
    scores: Partial<{
      visualScore: number;
      auditoryScore: number;
      kinestheticScore: number;
      readingWritingScore: number;
      activeReflectiveScore: number;
      sequentialGlobalScore: number;
      sensingIntuitiveScore: number;
    }>
  ): Promise<UserLearningStyle>;
  updatePrimaryStyle(id: string, style: LearningStyleDimension): Promise<UserLearningStyle>;
  findByPrimaryStyle(style: LearningStyleDimension): Promise<UserLearningStyle[]>;
  findUsersByLearningStylePreference(
    preferences: Partial<{
      primaryStyle: LearningStyleDimension;
      secondaryStyle: LearningStyleDimension;
    }>,
    limit?: number
  ): Promise<UserLearningStyle[]>;
} 