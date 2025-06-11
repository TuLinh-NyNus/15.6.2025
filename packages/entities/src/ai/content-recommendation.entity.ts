import { User } from '../users/user.entity';

export class ContentRecommendation {
  id: string;
  userId: string;
  user?: User;
  contentId: string;
  contentType: string;
  score: number;
  reason: string[];
  isViewed: boolean;
  isEnrolled: boolean;
  createdAt: Date;
  expiresAt?: Date;
} 