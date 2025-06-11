/**
 * Entity cho model QuestionVersion - lưu trữ lịch sử thay đổi của câu hỏi
 */
export class QuestionVersion {
  id: string;
  questionId: string;      // ID của câu hỏi
  version: number;         // Số phiên bản
  content: string;         // Nội dung câu hỏi đã xử lý
  rawContent: string;      // Nội dung gốc LaTex
  changedAt: Date;         // Thời điểm thay đổi
  changedById: string;     // ID của người thay đổi

  constructor(partial: Partial<QuestionVersion>) {
    Object.assign(this, partial);
  }
} 