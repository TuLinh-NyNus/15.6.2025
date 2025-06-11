import { ApiProperty } from '@nestjs/swagger';
import { QuestionAnswerDto, QuestionImageDto } from './create-question.dto';
import { QuestionType, QuestionStatus, QuestionDifficulty } from '@project/entities';

export class QuestionVersionDto {
  @ApiProperty({ description: 'ID của phiên bản' })
  id: string;

  @ApiProperty({ description: 'Phiên bản' })
  version: number;

  @ApiProperty({ description: 'Nội dung câu hỏi' })
  content: string;

  @ApiProperty({ description: 'Nội dung gốc LaTex' })
  rawContent: string;

  @ApiProperty({ description: 'Danh sách đáp án', type: [QuestionAnswerDto] })
  answers: QuestionAnswerDto[];

  @ApiProperty({ description: 'Lời giải' })
  solution: string;

  @ApiProperty({ description: 'Thời gian tạo phiên bản' })
  createdAt: Date;
}

export class QuestionResponseDto {
  @ApiProperty({ description: 'ID câu hỏi' })
  id: string;

  @ApiProperty({ description: 'Nội dung câu hỏi' })
  content: string; // 6. Content

  @ApiProperty({ description: 'Nội dung gốc LaTex của câu hỏi' })
  rawContent: string; // 1. RawContent

  @ApiProperty({
    description: 'Loại câu hỏi',
    enum: QuestionType
  })
  type: QuestionType; // 4. Type

  @ApiProperty({ description: 'QuestionID để phân loại (dạng XXXXX-X)', required: false })
  questionId?: string; // 2. QuestionID

  @ApiProperty({ description: 'Dành cho học sinh dễ truy vấn câu hỏi (dạng XX.N)', required: false })
  subcount?: string; // 3. Subcount

  @ApiProperty({ description: 'Nguồn câu hỏi', required: false })
  source?: string; // 5. Source

  @ApiProperty({
    description: 'Danh sách các đáp án',
    type: [QuestionAnswerDto]
  })
  answers: QuestionAnswerDto[]; // 7. Answers

  @ApiProperty({
    description: 'Đáp án đúng',
    type: [String]
  })
  correctAnswer: string[]; // 8. CorrectAnswer

  @ApiProperty({ description: 'Lời giải' })
  solution: string; // 9. Solution

  @ApiProperty({ description: 'Danh sách hình ảnh', type: [QuestionImageDto] })
  images: QuestionImageDto[]; // 10. Images

  @ApiProperty({
    description: 'Các nhãn phân loại câu hỏi',
    type: [String]
  })
  tags: string[]; // 11. Tags

  @ApiProperty({ description: 'Số lần sử dụng' })
  usageCount: number; // 12. UsageCount

  @ApiProperty({ description: 'ID của người tạo câu hỏi' })
  creatorId: string; // 13. Creator

  @ApiProperty({
    description: 'Trạng thái câu hỏi',
    enum: QuestionStatus
  })
  status: QuestionStatus; // 14. Status

  @ApiProperty({
    description: 'Tham chiếu đến các bài kiểm tra',
    type: [String]
  })
  examRefs: string[]; // 15. ExamRefs

  @ApiProperty({ description: 'Số lần feedback' })
  feedback: number; // 16. Feedback

  @ApiProperty({
    description: 'Độ khó của câu hỏi',
    enum: QuestionDifficulty
  })
  difficulty: QuestionDifficulty; // Bổ sung

  @ApiProperty({ description: 'Lịch sử phiên bản', type: [QuestionVersionDto] })
  versions: QuestionVersionDto[];

  @ApiProperty({ description: 'Phiên bản hiện tại' })
  currentVersion: number;

  @ApiProperty({ description: 'Thời gian tạo câu hỏi' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật câu hỏi' })
  updatedAt: Date;
}