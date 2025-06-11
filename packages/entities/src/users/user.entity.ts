import { Course } from '../courses/course.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { UserProfile } from './user-profile.entity';

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  enrollments?: Enrollment[];
  createdCourses?: Course[];
} 