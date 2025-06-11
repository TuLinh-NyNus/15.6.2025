import { User } from '../users/user.entity';

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

export class UserActivityLog {
  id: string;
  userId: string;
  user?: User;
  activityType: ActivityType;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: Date;
} 