import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Difficulty, ExamCategory, ExamForm } from '@project/entities';

export class ExamFilterDto {
  @ApiProperty({ description: 'Trang hiện tại', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng kết quả mỗi trang', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: 'Lọc theo môn học', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Lọc theo khối lớp', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  grade?: number;

  @ApiProperty({ description: 'Lọc theo độ khó', required: false, enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ description: 'Lọc theo loại đề thi', required: false, enum: ExamCategory })
  @IsOptional()
  @IsEnum(ExamCategory)
  examCategory?: ExamCategory;

  @ApiProperty({ description: 'Lọc theo hình thức', required: false, enum: ExamForm })
  @IsOptional()
  @IsEnum(ExamForm)
  form?: ExamForm;

  @ApiProperty({ description: 'Lọc theo người tạo', required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ description: 'Tìm kiếm theo từ khóa', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Sắp xếp theo trường (title, createdAt, etc.)', required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false, default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';
} 