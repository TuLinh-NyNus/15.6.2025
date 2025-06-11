import { Enrollment } from '@project/entities';
import { EnrollmentResponseDto } from '@project/dto';
import { CourseMapper } from './course.mapper';

export class EnrollmentMapper {
  /**
   * Chuyển đổi Enrollment entity sang EnrollmentResponseDto
   */
  static toResponseDto(enrollment: Enrollment): EnrollmentResponseDto {
    return {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      course: enrollment.course ? CourseMapper.toResponseDto(enrollment.course) : undefined,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      completionRate: EnrollmentMapper.calculateCompletionRate(enrollment),
    };
  }
  
  /**
   * Tính toán tỷ lệ hoàn thành khóa học
   */
  private static calculateCompletionRate(enrollment: Enrollment): number {
    // Triển khai logic tính toán tỷ lệ hoàn thành
    if (!enrollment.progress || !enrollment.course?.lessons?.length) {
      return 0;
    }
    
    // Giả sử progress là một map với key là lessonId và value là boolean
    // hoặc có thể là một đối tượng với các thuộc tính khác nhau
    const progressValues = Object.values(enrollment.progress);
    const completedLessons = progressValues.filter(status => 
      // Có thể status là một đối tượng phức tạp, vì vậy kiểm tra kiểu trước
      typeof status === 'boolean' ? status : 
      typeof status === 'object' && status !== null ? !!status.completed : false
    ).length;
    
    const totalLessons = enrollment.course.lessons.length;
    
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  }
} 