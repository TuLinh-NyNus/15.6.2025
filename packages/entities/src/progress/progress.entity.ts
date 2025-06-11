import { Enrollment } from '../enrollments/enrollment.entity';
import { Lesson } from '../lessons/lesson.entity';

export enum LessonDifficulty {
  EASY,
  MEDIUM,
  HARD
}

export class Progress {
  id: string;
  enrollmentId: string;
  enrollment?: Enrollment;
  lessonId: string;
  lesson?: Lesson;
  completed: boolean;
  lastAccessed?: Date;
  timeSpent?: number; // Thời gian dành cho bài học (giây)
  attentionScore?: number; // Đánh giá mức độ tập trung (0-100)
  interactionCount?: number; // Số lượng tương tác với bài học
  notes?: string; // Ghi chú của người dùng
  difficulty?: LessonDifficulty; // Mức độ khó đối với người dùng
  revisitCount: number; // Số lần xem lại
  createdAt: Date;
  updatedAt: Date;
} 