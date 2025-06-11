import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
import { Progress } from '../progress/progress.entity';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class Enrollment {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  progress?: Progress[];
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
} 