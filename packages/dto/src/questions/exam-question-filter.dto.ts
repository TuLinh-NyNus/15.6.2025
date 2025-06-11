import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { QuestionDifficulty, QuestionStatus, QuestionType } from '@project/entities';
import { Type } from 'class-transformer';

export class ExamQuestionFilterDto {
  @ApiProperty({ description: 'Trang hiện tại', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: 'Số lượng kết quả trên mỗi trang', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ description: 'Tìm kiếm theo từ khóa', required: false })
  @IsOptional()
  @IsString()
  search?: string;

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

  @ApiProperty({ description: 'Lọc theo người tạo', required: false })
  @IsOptional()
  @IsUUID(4)
  creatorId?: string;
  
  @ApiProperty({ description: 'Lọc theo danh sách nhãn', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
