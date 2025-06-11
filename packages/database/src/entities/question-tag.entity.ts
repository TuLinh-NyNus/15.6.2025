/**
 * Entity cho model QuestionTag - phân loại câu hỏi
 */
export class QuestionTag {
  id: string;
  name: string;           // Tên tag
  description?: string;   // Mô tả
  createdAt: Date;        // Thời điểm tạo
  updatedAt: Date;        // Thời điểm cập nhật

  constructor(partial: Partial<QuestionTag>) {
    Object.assign(this, partial);
  }
} 