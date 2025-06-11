import { Course } from '../courses/course.entity';
import { Progress } from '../progress/progress.entity';
import { LessonType } from '../enums/lesson-type.enum';

export class Lesson {
  id: string;
  title: string;
  content: string;
  description?: string;
  resourceUrl?: string;
  duration?: number;
  order: number;
  type: LessonType = LessonType.VIDEO;
  isFree: boolean = false;
  courseId: string;
  course?: Course;
  progress?: Progress[];
  createdAt: Date;
  updatedAt: Date;
} 