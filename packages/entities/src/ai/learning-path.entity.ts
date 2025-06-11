import { User } from '../users/user.entity';

export enum PathStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export class LearningPathStep {
  id: string;
  pathId: string;
  path?: LearningPath;
  contentId: string;
  contentType: string;
  order: number;
  isRequired: boolean;
  status: PathStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class LearningPath {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description?: string;
  goals: string[];
  estimatedCompletionTime: number;
  status: PathStatus;
  steps?: LearningPathStep[];
  createdAt: Date;
  updatedAt: Date;
} 