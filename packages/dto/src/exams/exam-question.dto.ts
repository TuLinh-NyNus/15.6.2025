import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@project/entities';

/**
 * DTO cho option của câu hỏi
 */
export class QuestionOptionDto {
  @ApiProperty({
    description: 'ID của lựa chọn',
    example: '1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Nội dung của lựa chọn',
    example: 'Đáp án A',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Có phải đáp án đúng không',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

/**
 * DTO khi tạo mới câu hỏi
 */
export class CreateExamQuestionDto {
  @ApiProperty({
    description: 'Nội dung câu hỏi',
    example: 'Cây nào sau đây thuộc họ cây lương thực?'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Loại câu hỏi',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
    required: true,
  })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @ApiProperty({
    description: 'Danh sách các lựa chọn cho câu hỏi',
    type: [QuestionOptionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[];

  @ApiProperty({
    description: 'Danh sách các câu trả lời đúng',
    example: ['1', '2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  correctAnswers?: string[];

  @ApiProperty({
    description: 'Giải thích cho câu trả lời',
    example: 'Giải thích chi tiết',
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({
    description: 'Điểm số cho câu hỏi',
    example: 1.5,
  })
  @IsNumber()
  score: number;

  @ApiProperty({
    description: 'Độ khó của câu hỏi',
    example: 'MEDIUM',
  })
  @IsString()
  @IsOptional()
  difficultyLevel?: string;

  @ApiProperty({
    description: 'Các thẻ gắn với câu hỏi',
    example: ['đại số', 'hàm số'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Môn học liên quan',
    example: 'Toán',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    description: 'Lớp học liên quan',
    example: '10',
  })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiProperty({
    description: 'ID của câu hỏi gốc từ ngân hàng câu hỏi',
    example: '5f9d5a5b-ca75-4c5f-a09e-bc4b362b4523',
    required: false
  })
  @IsString()
  @IsOptional()
  sourceQuestionId?: string;
}

/**
 * DTO khi cập nhật câu hỏi - extends từ CreateExamQuestionDto nhưng mọi trường đều optional
 */
export class UpdateExamQuestionDto extends PartialType(CreateExamQuestionDto) {
  // Không cần thêm gì vì đã kế thừa từ CreateExamQuestionDto
}

/**
 * DTO cho response khi trả về câu hỏi
 */
export class ExamQuestionResponseDto {
  @ApiProperty({
    description: 'ID của câu hỏi',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'ID của đề thi',
    example: 1,
  })
  examId: number;

  @ApiProperty({
    description: 'Nội dung câu hỏi',
    example: 'Cây nào sau đây thuộc họ cây lương thực?'
  })
  content: string;

  @ApiProperty({
    description: 'Loại câu hỏi',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE
  })
  type: QuestionType;

  @ApiProperty({
    description: 'Danh sách các lựa chọn cho câu hỏi',
    type: [QuestionOptionDto],
  })
  options: QuestionOptionDto[];

  @ApiProperty({
    description: 'Danh sách các câu trả lời đúng',
    example: ['1', '2'],
  })
  correctAnswers: string[];

  @ApiProperty({
    description: 'Giải thích cho câu trả lời',
    example: 'Giải thích chi tiết',
  })
  explanation?: string;

  @ApiProperty({
    description: 'Điểm số cho câu hỏi',
    example: 1.5,
  })
  score: number;

  @ApiProperty({
    description: 'Độ khó của câu hỏi',
    example: 'MEDIUM',
  })
  difficultyLevel?: string;

  @ApiProperty({
    description: 'Các thẻ gắn với câu hỏi',
    example: ['đại số', 'hàm số'],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Môn học liên quan',
    example: 'Toán',
  })
  subject?: string;

  @ApiProperty({
    description: 'Lớp học liên quan',
    example: '10',
  })
  grade?: string;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID của câu hỏi gốc từ ngân hàng câu hỏi',
    example: '5f9d5a5b-ca75-4c5f-a09e-bc4b362b4523',
    required: false
  })
  sourceQuestionId?: string;

  constructor(partial: Partial<ExamQuestionResponseDto>) {
    Object.assign(this, partial);
  }
} 