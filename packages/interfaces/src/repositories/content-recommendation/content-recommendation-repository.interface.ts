import { IBaseRepository } from '../base/base-repository.interface';

// Interface cho entity
export interface ContentRecommendation {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  score: number;
  reason?: string;
  isViewed: boolean;
  isEnrolled: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface IContentRecommendationRepository extends IBaseRepository<ContentRecommendation, string> {
  findActiveByUserId(userId: string): Promise<ContentRecommendation[]>;
  findByContentId(contentId: string, contentType: string): Promise<ContentRecommendation[]>;
  markAsViewed(id: string): Promise<ContentRecommendation>;
  markAsEnrolled(id: string): Promise<ContentRecommendation>;
  findRecentRecommendations(userId: string, limit?: number): Promise<ContentRecommendation[]>;
  removeExpiredRecommendations(): Promise<number>;
} 