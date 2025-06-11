import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Interface cho một câu trả lời trong bài thi
 */
export interface QuestionAnswer {
  selectedOptionIds?: number[];
  textAnswer?: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  timeSpent?: number;
  feedback?: string;
}

/**
 * DTO khi tạo mới kết quả bài thi
 */
export class CreateExamResultDto {
  @ApiProperty({ description: 'ID người dùng' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID bài thi' })
  @IsString()
  examId: string;

  @ApiProperty({ description: 'Điểm số' })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Điểm tối đa' })
  @IsNumber()
  maxScore: number;

  @ApiProperty({ description: 'Thời gian bắt đầu làm bài' })
  @IsDateString()
  startedAt: string;

  @ApiProperty({ description: 'Thời gian hoàn thành bài' })
  @IsDateString()
  completedAt: string;

  @ApiProperty({ description: 'Thời gian làm bài (giây)' })
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Chi tiết câu trả lời', required: false, type: Object })
  @IsOptional()
  @IsObject()
  answers?: Record<string, QuestionAnswer>;
}

/**
 * DTO cho kết quả bài thi trả về cho client
 */
export class ExamResultResponseDto {
  @ApiProperty({ description: 'ID kết quả bài thi' })
  id: string;

  @ApiProperty({ description: 'ID người dùng' })
  userId: string;

  @ApiProperty({ description: 'ID bài thi' })
  examId: string;

  @ApiProperty({ description: 'Điểm số' })
  score: number;

  @ApiProperty({ description: 'Điểm tối đa' })
  maxScore: number;

  @ApiProperty({ description: 'Thời gian bắt đầu làm bài' })
  startedAt: Date;

  @ApiProperty({ description: 'Thời gian hoàn thành bài' })
  completedAt: Date;

  @ApiProperty({ description: 'Thời gian làm bài (giây)' })
  duration: number;

  @ApiProperty({ description: 'Chi tiết câu trả lời', required: false, type: Object })
  answers: Record<string, QuestionAnswer> | null;

  constructor(partial: Partial<ExamResultResponseDto>) {
    Object.assign(this, partial);
  }
} 