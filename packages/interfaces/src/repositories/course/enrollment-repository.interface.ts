import { Enrollment } from '@project/entities';
import { EnrollmentFiltersDto } from '@project/dto';

export interface IEnrollmentRepository {
  findAll(filters: EnrollmentFiltersDto): Promise<{ enrollments: Enrollment[]; total: number }>;
  findById(id: string): Promise<Enrollment | null>;
  findByUser(userId: string): Promise<Enrollment[]>;
  findByCourse(courseId: string): Promise<Enrollment[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
  create(userId: string, courseId: string, status?: string): Promise<Enrollment>;
  update(id: string, enrollment: Partial<Enrollment>): Promise<Enrollment>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<Enrollment>;
  updateProgress(id: string, lessonId: string, completed: boolean): Promise<Enrollment>;
} 