import { Course, User } from '@project/entities';
import { CourseFiltersDto } from '@project/dto';

export interface ICourseRepository {
  findAll(filters: CourseFiltersDto): Promise<{ courses: Course[]; total: number }>;
  findById(id: string): Promise<Course | null>;
  findByInstructor(instructorId: string): Promise<Course[]>;
  findByCategory(categoryId: string): Promise<Course[]>;
  create(course: Partial<Course>, instructor: User): Promise<Course>;
  update(id: string, course: Partial<Course>): Promise<Course>;
  delete(id: string): Promise<boolean>;
  incrementStudentCount(id: string): Promise<Course>;
  updateRating(id: string, rating: number): Promise<Course>;
} 