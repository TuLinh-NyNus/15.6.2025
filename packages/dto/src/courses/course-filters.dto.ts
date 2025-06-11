import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseStatus } from '@project/entities';

export class CourseFiltersDto {
  @ApiProperty({ description: 'Tìm kiếm theo từ khóa trong tiêu đề và nội dung', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Tìm kiếm theo tiêu đề khóa học', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Lọc theo giá thấp nhất', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ description: 'Lọc theo giá cao nhất', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({ description: 'Lọc khóa học miễn phí', required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFree?: boolean;

  @ApiProperty({ description: 'Lọc theo ID giảng viên', required: false })
  @IsString()
  @IsOptional()
  instructorId?: string;

  @ApiProperty({ description: 'Lọc theo ID danh mục', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Lọc theo danh sách categories', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Lọc theo trạng thái khóa học', enum: CourseStatus, required: false })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiProperty({ description: 'Lọc theo ngôn ngữ khóa học', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: 'Sắp xếp kết quả (ví dụ: createdAt:desc)', required: false })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiProperty({ description: 'Trang hiện tại (pagination)', default: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng item trên mỗi trang', default: 10, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
} 