import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Enrollment } from '../enrollments/enrollment.entity';

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export class Course {
  id: string;
  title: string;
  description: string;
  duration: number = 0;
  price: number = 0;
  isFree: boolean = false;
  isPublished: boolean = false;
  categoryId: string;
  category?: Category;
  instructorId: string;
  instructor?: User;
  lessons?: Lesson[] = [];
  enrollments?: Enrollment[] = [];
  thumbnail?: string;
  introVideo?: string;
  prerequisites: string[] = [];
  learningOutcomes: string[] = [];
  totalStudents: number = 0;
  totalLessons: number = 0;
  status: CourseStatus = CourseStatus.DRAFT;
  language: string = 'en';
  averageRating: number = 0;
  totalRatings: number = 0;
  createdAt: Date;
  updatedAt: Date;
} 