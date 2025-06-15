import { Course, User } from '@project/entities';
import { CourseResponseDto } from '@project/dto';
import { ExtendedCourse, InstructorDto, mapUserToInstructorDto } from '../interfaces/extended-models.interface';

export class CourseMapper {
  /**
   * Chuyển đổi Course entity sang CourseResponseDto
   */
  static toResponseDto(course: Course): CourseResponseDto {
    const extendedCourse = course as ExtendedCourse;
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      shortDescription: extendedCourse.shortDescription || course.description?.substring(0, 100) || '',
      duration: course.duration,
      price: course.price,
      isFree: course.isFree,
      instructor: CourseMapper.mapInstructor(course.instructor),
      categories: extendedCourse.categories || (course.categoryId ? [course.categoryId] : []),
      thumbnail: course.thumbnail,
      introVideo: course.introVideo,
      prerequisites: course.prerequisites,
      learningOutcomes: course.learningOutcomes,
      totalStudents: course.totalStudents,
      totalLessons: course.totalLessons,
      status: course.status,
      language: course.language,
      averageRating: course.averageRating,
      totalRatings: course.totalRatings,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
  
  /**
   * Xử lý trường instructor để phù hợp với kiểu dữ liệu
   */
  private static mapInstructor(instructor: unknown): string | InstructorDto {
    if (typeof instructor === 'string') {
      return instructor;
    }
    
    if (!instructor) {
      return '';
    }
    
    return mapUserToInstructorDto(instructor as User);
  }
} 
