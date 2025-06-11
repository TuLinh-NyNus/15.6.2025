import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDifficulty, QuestionStatus, QuestionType } from '@project/entities';

export class ExamQuestionSearchDto {
  @ApiProperty({ description: 'Từ khóa tìm kiếm', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng item trên 1 trang', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: 'Sắp xếp theo trường nào', required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Hướng sắp xếp', required: false, default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc' = 'desc';

  @ApiProperty({ 
    description: 'Lọc theo loại câu hỏi', 
    enum: QuestionType,
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsEnum(QuestionType, { each: true })
  @IsArray()
  types?: QuestionType[];

  @ApiProperty({ 
    description: 'Lọc theo trạng thái câu hỏi', 
    enum: QuestionStatus,
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsEnum(QuestionStatus, { each: true })
  @IsArray()
  statuses?: QuestionStatus[];

  @ApiProperty({ 
    description: 'Lọc theo độ khó', 
    enum: QuestionDifficulty,
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsEnum(QuestionDifficulty, { each: true })
  @IsArray()
  difficulties?: QuestionDifficulty[];

  @ApiProperty({ 
    description: 'Lọc theo danh sách nhãn', 
    type: [String],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
