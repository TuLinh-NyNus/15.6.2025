import { ApiProperty } from '@nestjs/swagger';
import { Difficulty, ExamCategory, ExamForm, ExamType } from '@project/entities';

export class ExamResponseDto {
  @ApiProperty({ description: 'ID bài thi' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài thi' })
  title: string;

  @ApiProperty({ description: 'Thông tin mô tả về bài thi', required: false })
  description: Record<string, unknown> | null;

  @ApiProperty({ description: 'Danh sách ID của các câu hỏi', type: [Number] })
  questions: number[];

  @ApiProperty({ description: 'Thời gian làm bài (phút)' })
  duration: number;

  @ApiProperty({ description: 'Độ khó', enum: Difficulty })
  difficulty: Difficulty;

  @ApiProperty({ description: 'Môn học' })
  subject: string;

  @ApiProperty({ description: 'Khối lớp' })
  grade: number;

  @ApiProperty({ description: 'Hình thức bài thi', enum: ExamForm })
  form: ExamForm;

  @ApiProperty({ description: 'ID của người tạo' })
  createdBy: string;

  @ApiProperty({ description: 'Điểm trung bình', required: false })
  averageScore: number | null;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Thẻ phân loại', type: [String] })
  tags: string[];

  @ApiProperty({ description: 'Loại bài thi', enum: ExamCategory })
  examCategory: ExamCategory;

  @ApiProperty({ description: 'Trạng thái bài thi', enum: ExamType })
  type: ExamType;

  constructor(partial: Partial<ExamResponseDto>) {
    Object.assign(this, partial);
  }
} 