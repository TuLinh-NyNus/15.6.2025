import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsBoolean, Min } from 'class-validator';
import { LessonType } from '@project/entities';
import { Type } from 'class-transformer';

export class LessonFiltersDto {
  @ApiProperty({ description: 'Lọc theo ID khóa học', required: false })
  @IsUUID()
  @IsOptional()
  courseId?: string;
  
  @ApiProperty({ description: 'Lọc theo tiêu đề bài học', required: false })
  @IsString()
  @IsOptional()
  title?: string;
  
  @ApiProperty({ description: 'Lọc theo loại bài học', enum: LessonType, required: false })
  @IsEnum(LessonType)
  @IsOptional()
  type?: LessonType;
  
  @ApiProperty({ description: 'Lọc các bài học miễn phí', required: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;
  
  @ApiProperty({ description: 'Trang hiện tại', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;
  
  @ApiProperty({ description: 'Số lượng kết quả mỗi trang', default: 10 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
  
  @ApiProperty({ description: 'Sắp xếp kết quả', required: false })
  @IsString()
  @IsOptional()
  sort?: string;
} 