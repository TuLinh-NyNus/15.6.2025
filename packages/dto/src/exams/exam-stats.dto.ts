import { ApiProperty } from '@nestjs/swagger';
import { Difficulty, ExamCategory, ExamForm } from '@project/entities';

/**
 * DTO cho thống kê chung về một bài thi
 */
export class ExamStatsDto {
  @ApiProperty({ description: 'ID bài thi' })
  examId: string;

  @ApiProperty({ description: 'Tiêu đề bài thi' })
  title: string;

  @ApiProperty({ description: 'Tổng số lượt làm bài' })
  totalAttempts: number;

  @ApiProperty({ description: 'Điểm trung bình' })
  averageScore: number;

  @ApiProperty({ description: 'Điểm cao nhất' })
  highestScore: number;

  @ApiProperty({ description: 'Điểm thấp nhất' })
  lowestScore: number;

  @ApiProperty({ description: 'Thời gian làm bài trung bình (giây)' })
  averageDuration: number;

  @ApiProperty({ description: 'Tỷ lệ đỗ (nếu có ngưỡng đỗ)', required: false })
  passRate?: number;

  @ApiProperty({ description: 'Phân phối điểm theo khoảng', type: Object })
  scoreDistribution: Record<string, number>;

  @ApiProperty({ description: 'Thời gian cập nhật thống kê' })
  updatedAt: Date;

  @ApiProperty({ description: 'Thông tin môn học' })
  subject: string;

  @ApiProperty({ description: 'Khối lớp' })
  grade: number;

  @ApiProperty({ description: 'Độ khó', enum: Difficulty })
  difficulty: Difficulty;

  @ApiProperty({ description: 'Loại bài thi', enum: ExamCategory })
  examCategory: ExamCategory;

  @ApiProperty({ description: 'Hình thức bài thi', enum: ExamForm })
  form: ExamForm;
}

/**
 * DTO cho thống kê chi tiết câu hỏi trong bài thi
 */
export class QuestionStatsDto {
  @ApiProperty({ description: 'ID của câu hỏi' })
  questionId: number;

  @ApiProperty({ description: 'Thứ tự câu hỏi trong bài thi', required: false })
  orderInExam?: number;

  @ApiProperty({ description: 'Tỷ lệ trả lời đúng' })
  correctRate: number;

  @ApiProperty({ description: 'Số người trả lời đúng' })
  correctCount: number;

  @ApiProperty({ description: 'Tổng số người trả lời' })
  totalAnswered: number;

  @ApiProperty({ description: 'Thời gian trung bình để trả lời (giây)' })
  averageTimeSpent: number;

  @ApiProperty({ description: 'Phân phối lựa chọn cho câu trắc nghiệm', type: Object, required: false })
  optionDistribution?: Record<string, number>;
}

/**
 * DTO cho thống kê chi tiết về một bài thi, bao gồm cả thống kê từng câu hỏi
 */
export class DetailedExamStatsDto extends ExamStatsDto {
  @ApiProperty({ description: 'Thống kê chi tiết theo từng câu hỏi', type: [QuestionStatsDto] })
  questionStats: QuestionStatsDto[];
}

/**
 * DTO cho params khi lấy thống kê bài thi
 */
export class ExamStatsParamsDto {
  @ApiProperty({ description: 'ID bài thi' })
  examId: string;

  @ApiProperty({ description: 'Bao gồm thống kê chi tiết các câu hỏi', required: false, default: false })
  includeQuestionStats?: boolean;
} 