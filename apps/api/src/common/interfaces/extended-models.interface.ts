import { Course, User } from '@project/entities';

// Mở rộng entity Course để xử lý các trường thiếu
export interface ExtendedCourse extends Course {
  shortDescription?: string;
  categories?: string[];
}

// DTO cho instructor
export interface InstructorDto {
  id: string;
  name: string;
  email: string;
}

// Hàm mapper để chuyển đổi User sang InstructorDto
export function mapUserToInstructorDto(user: User): InstructorDto {
  return {
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email
  };
}

// Hàm mapper để xử lý Course cho các trường thiếu
export function enrichCourse(course: Course): ExtendedCourse {
  const enriched: ExtendedCourse = {
    ...course,
    shortDescription: course.description?.substring(0, 100) || '',
    categories: course.categoryId ? [course.categoryId] : []
  };
  return enriched;
} 