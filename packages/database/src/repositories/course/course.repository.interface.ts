import { Course } from '@project/entities';
import { Prisma } from '@prisma/client';
import { CourseFiltersDto } from '@project/dto';

export interface ICourseRepository {
  create(data: Prisma.CourseUncheckedCreateInput): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findAll(filters: CourseFiltersDto): Promise<{ courses: Course[]; total: number }>;
  findByInstructor(instructorId: string): Promise<Course[]>;
  findByCategory(categoryId: string): Promise<Course[]>;
  update(id: string, data: Prisma.CourseUncheckedUpdateInput): Promise<Course>;
  delete(id: string): Promise<void>;
  incrementStudentCount(id: string): Promise<Course>;
  updateRating(id: string, rating: number): Promise<Course>;
} 