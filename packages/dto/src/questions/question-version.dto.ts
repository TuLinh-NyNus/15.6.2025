import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionVersionResponseDto {
  @ApiProperty({ description: 'ID của phiên bản câu hỏi' })
  id: string;

  @ApiProperty({ description: 'ID của câu hỏi' })
  questionId: string;

  @ApiProperty({ description: 'Số phiên bản' })
  version: number;

  @ApiProperty({ description: 'Nội dung đã xử lý của câu hỏi' })
  content: string;

  @ApiProperty({ description: 'Nội dung gốc LaTeX của câu hỏi' })
  rawContent: string;

  @ApiProperty({ description: 'Thời điểm thay đổi' })
  changedAt: Date;

  @ApiProperty({ description: 'ID của người thay đổi' })
  changedById: string;

  @ApiPropertyOptional({ description: 'Thông tin người thay đổi' })
  changedBy?: {
    id: string;
    email: string;
    fullName?: string;
  };

  @ApiPropertyOptional({ description: 'ID phiên bản mà phiên bản này được khôi phục từ đó' })
  revertedFromVersionId?: string;

  constructor(partial: Partial<QuestionVersionResponseDto>) {
    Object.assign(this, partial);
  }
}

// Interface cho kết quả diff của thư viện diff
interface DiffResult {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export class QuestionVersionCompareDto {
  @ApiProperty({ description: 'So sánh nội dung giữa hai phiên bản' })
  contentDiff: DiffResult[];

  @ApiProperty({ description: 'So sánh phần giải thích giữa hai phiên bản' })
  explanationDiff: DiffResult[];

  @ApiProperty({ description: 'So sánh các tùy chọn giữa hai phiên bản' })
  optionsDiff: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };

  @ApiProperty({ description: 'So sánh các đáp án đúng giữa hai phiên bản' })
  correctOptionsDiff: {
    added: string[];
    removed: string[];
    unchanged: string[];
  };

  @ApiProperty({ description: 'Thông tin phiên bản thứ nhất' })
  version1: {
    id: string;
    version: number;
    createdAt: Date;
  };

  @ApiProperty({ description: 'Thông tin phiên bản thứ hai' })
  version2: {
    id: string;
    version: number;
    createdAt: Date;
  };

  constructor(partial: Partial<QuestionVersionCompareDto>) {
    Object.assign(this, partial);
  }
}

export class RevertQuestionVersionDto {
  @ApiProperty({ description: 'ID của người thực hiện khôi phục' })
  userId: string;

  constructor(partial: Partial<RevertQuestionVersionDto>) {
    Object.assign(this, partial);
  }
} 