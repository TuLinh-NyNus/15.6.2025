import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  ValidateNested,
  IsBoolean,
  IsNotEmpty,
  IsUrl
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuestionStatus, QuestionDifficulty, QuestionImageType } from '@project/entities';
import { QuestionType } from '@project/entities/dist/enums/question-enums';

export class QuestionAnswerDto {
  @ApiProperty({ description: 'ID của đáp án' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Nội dung đáp án' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Đánh dấu đáp án đúng hay sai', required: false })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiProperty({ description: 'Giải thích cho đáp án', required: false })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ description: 'Thứ tự hiển thị đáp án', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class QuestionImageDto {
  @ApiProperty({ description: 'ID của hình ảnh', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'URL của hình ảnh' })
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Loại hình ảnh',
    enum: QuestionImageType,
    example: 'QUESTION'
  })
  @IsEnum(QuestionImageType)
  type: QuestionImageType;
}

export class CreateQuestionDto {
  @ApiProperty({ description: 'Nội dung câu hỏi đã xử lý' })
  @IsString()
  @IsNotEmpty()
  content: string; // 6. Content

  @ApiProperty({ description: 'Nội dung gốc LaTex của câu hỏi' })
  @IsString()
  @IsNotEmpty()
  rawContent: string; // 1. RawContent

  @ApiProperty({
    description: 'Loại câu hỏi',
    enum: QuestionType,
    example: 'MC'
  })
  @IsEnum(QuestionType)
  type: QuestionType; // 4. Type

  @ApiProperty({ description: 'QuestionID để phân loại (dạng XXXXX-X)', required: false })
  @IsOptional()
  @IsString()
  questionId?: string; // 2. QuestionID

  @ApiProperty({ description: 'Dành cho học sinh dễ truy vấn câu hỏi (dạng XX.N)', required: false })
  @IsOptional()
  @IsString()
  subcount?: string; // 3. Subcount

  @ApiProperty({ description: 'Nguồn câu hỏi', required: false })
  @IsOptional()
  @IsString()
  source?: string; // 5. Source

  @ApiProperty({
    description: 'Danh sách các đáp án (cho MC và TF)',
    type: [QuestionAnswerDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  answers?: QuestionAnswerDto[]; // 7. Answers

  @ApiProperty({
    description: 'Đáp án đúng',
    type: [String],
    required: false,
    example: ['1', '3']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctAnswer?: string[]; // 8. CorrectAnswer

  @ApiProperty({ description: 'Lời giải', required: false })
  @IsOptional()
  @IsString()
  solution?: string; // 9. Solution

  @ApiProperty({
    description: 'Danh sách hình ảnh',
    type: [QuestionImageDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionImageDto)
  images?: QuestionImageDto[]; // 10. Images

  @ApiProperty({
    description: 'Các nhãn phân loại câu hỏi',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // 11. Tags

  @ApiProperty({ description: 'ID của người tạo câu hỏi' })
  @IsUUID()
  creatorId: string; // 13. Creator

  @ApiProperty({
    description: 'Trạng thái câu hỏi',
    enum: QuestionStatus,
    default: QuestionStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus = QuestionStatus.ACTIVE; // 14. Status

  @ApiProperty({
    description: 'Tham chiếu đến các bài kiểm tra',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examRefs?: string[]; // 15. ExamRefs

  @ApiProperty({
    description: 'Độ khó của câu hỏi',
    enum: QuestionDifficulty,
    required: false
  })
  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty; // Bổ sung
}