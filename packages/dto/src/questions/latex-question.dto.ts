import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { QuestionType } from '@project/entities';

export class LatexQuestionDto {
  @ApiProperty({ description: 'Nội dung LaTex của câu hỏi' })
  @IsString()
  @IsNotEmpty()
  latexContent: string;

  @ApiProperty({ 
    description: 'Loại câu hỏi', 
    enum: QuestionType,
    example: 'MC'
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ description: 'ID của người tạo câu hỏi' })
  @IsUUID()
  creatorId: string;

  @ApiProperty({ description: 'Danh sách tags', required: false })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
} 