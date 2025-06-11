import { ApiProperty } from '@nestjs/swagger';
import { Lesson, LessonType } from '@project/entities';

export class LessonResponseDto {
  @ApiProperty({ description: 'ID của bài học' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài học' })
  title: string;

  @ApiProperty({ description: 'Mô tả ngắn về bài học' })
  description?: string;
  
  @ApiProperty({ description: 'Nội dung chi tiết của bài học' })
  content: string;
  
  @ApiProperty({ description: 'Thứ tự hiển thị trong khóa học' })
  order: number;
  
  @ApiProperty({ description: 'Loại bài học', enum: LessonType })
  type: LessonType;
  
  @ApiProperty({ description: 'Tài nguyên đính kèm (URL video, file, etc.)' })
  resourceUrl?: string;
  
  @ApiProperty({ description: 'Thời lượng bài học (phút)' })
  duration?: number;
  
  @ApiProperty({ description: 'ID khóa học chứa bài học này' })
  courseId: string;
  
  @ApiProperty({ description: 'Đánh dấu là bài học miễn phí (preview)' })
  isFree: boolean;
  
  @ApiProperty({ description: 'Ngày tạo bài học' })
  createdAt: Date;
  
  @ApiProperty({ description: 'Ngày cập nhật bài học' })
  updatedAt: Date;

  // Static method to convert entity to DTO
  static fromEntity(lesson: Lesson): LessonResponseDto {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      order: lesson.order,
      type: lesson.type,
      resourceUrl: lesson.resourceUrl,
      duration: lesson.duration,
      courseId: lesson.courseId,
      isFree: lesson.isFree || false,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    };
  }
} 