import { IBaseRepository } from '../base/base-repository.interface';

// Import từ user-activity-log.entity.ts
export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW_COURSE = 'VIEW_COURSE',
  VIEW_LESSON = 'VIEW_LESSON',
  START_LESSON = 'START_LESSON',
  COMPLETE_LESSON = 'COMPLETE_LESSON',
  ENROLL_COURSE = 'ENROLL_COURSE',
  COMPLETE_COURSE = 'COMPLETE_COURSE',
  TAKE_ASSESSMENT = 'TAKE_ASSESSMENT',
  SEARCH = 'SEARCH',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  INTERACT_FORUM = 'INTERACT_FORUM',
  VIEW_RECOMMENDATION = 'VIEW_RECOMMENDATION'
}

export interface UserActivityLog {
  id: string;
  userId: string;
  activityType: ActivityType;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: Date;
}

export interface IUserActivityRepository extends IBaseRepository<UserActivityLog, string> {
  findByUserId(userId: string, limit?: number): Promise<UserActivityLog[]>;
  findByActivityType(type: ActivityType, limit?: number): Promise<UserActivityLog[]>;
  findUserActivitiesByTimeRange(userId: string, startDate: Date, endDate: Date): Promise<UserActivityLog[]>;
  findByEntityId(entityId: string, entityType: string): Promise<UserActivityLog[]>;
  findMostActiveUsers(limit?: number): Promise<{ userId: string; count: number }[]>;
  findMostViewedContent(entityType: string, limit?: number): Promise<{ entityId: string; count: number }[]>;
  getUserActivitySummary(userId: string): Promise<{ activityType: ActivityType; count: number }[]>;
} 