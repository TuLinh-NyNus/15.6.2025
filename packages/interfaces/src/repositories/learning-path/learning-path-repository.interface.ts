import { IBaseRepository } from '../base/base-repository.interface';

export enum LearningPathStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  ABANDONED = 'ABANDONED'
}

export enum LearningPathStepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

// Interface cho LearningPathStep
export interface LearningPathStep {
  id: string;
  pathId: string;
  contentId: string;
  contentType: string;
  order: number;
  isRequired: boolean;
  status: LearningPathStepStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface cho LearningPath
export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  description?: string;
  goals?: string[];
  estimatedCompletionTime?: number;
  status: LearningPathStatus;
  steps: LearningPathStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearningPathRepository extends IBaseRepository<LearningPath, string> {
  findByUserId(userId: string): Promise<LearningPath[]>;
  findActiveByUserId(userId: string): Promise<LearningPath[]>;
  addStep(pathId: string, step: Omit<LearningPathStep, 'id' | 'pathId' | 'createdAt' | 'updatedAt'>): Promise<LearningPathStep>;
  removeStep(stepId: string): Promise<void>;
  updateStepStatus(stepId: string, status: LearningPathStepStatus): Promise<LearningPathStep>;
  reorderSteps(pathId: string, stepOrder: { id: string; order: number }[]): Promise<LearningPathStep[]>;
  updatePathStatus(pathId: string, status: LearningPathStatus): Promise<LearningPath>;
  getRecommendedPaths(userId: string, limit?: number): Promise<LearningPath[]>;
} 