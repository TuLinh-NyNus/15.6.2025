import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '@project/entities';
import { CourseResponseDto } from '../courses';

export class EnrollmentResponseDto {
  @ApiProperty({ description: 'ID của đăng ký' })
  id: string;

  @ApiProperty({ description: 'ID của người dùng đăng ký' })
  userId: string;

  @ApiProperty({ description: 'ID của khóa học' })
  courseId: string;

  @ApiProperty({ description: 'Chi tiết khóa học', type: CourseResponseDto, required: false })
  course?: CourseResponseDto;

  @ApiProperty({ description: 'Trạng thái đăng ký', enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty({ description: 'Ngày đăng ký' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  @ApiProperty({ description: 'Tiến độ hoàn thành khóa học', type: Number, minimum: 0, maximum: 100 })
  completionRate?: number;
} 