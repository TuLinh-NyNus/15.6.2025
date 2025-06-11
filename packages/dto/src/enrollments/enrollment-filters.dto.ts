import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EnrollmentStatus } from '@project/entities';

export class EnrollmentFiltersDto {
  @ApiProperty({ description: 'Lọc theo ID người dùng', required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Lọc theo ID khóa học', required: false })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ description: 'Lọc theo trạng thái đăng ký', enum: EnrollmentStatus, required: false })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

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