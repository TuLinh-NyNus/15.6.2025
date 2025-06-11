import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseStatus } from '@project/entities';

export class CreateCourseDto {
  @ApiProperty({ description: 'Tiêu đề khóa học' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Mô tả chi tiết khóa học' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Mô tả ngắn gọn khóa học', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  shortDescription?: string;

  @ApiProperty({ description: 'Thời lượng của khóa học (phút)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiProperty({ description: 'Giá của khóa học', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Khóa học miễn phí hay không', default: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiProperty({ description: 'ID của giảng viên' })
  @IsString()
  instructorId: string;

  @ApiProperty({ description: 'Danh sách ID của các danh mục', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiProperty({ description: 'URL của hình thumbnail khóa học', required: false })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ description: 'URL của video giới thiệu khóa học', required: false })
  @IsUrl()
  @IsOptional()
  introVideo?: string;

  @ApiProperty({ description: 'Các yêu cầu tiên quyết', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  prerequisites?: string[];

  @ApiProperty({ description: 'Các mục tiêu học tập', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  learningOutcomes?: string[];

  @ApiProperty({ description: 'Ngôn ngữ của khóa học', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: 'Trạng thái khóa học', enum: CourseStatus, default: CourseStatus.DRAFT })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
} 