import { QuestionImageType } from './question-enums';

/**
 * Entity cho model QuestionImage - quản lý hình ảnh cho câu hỏi
 */
export class QuestionImage {
  id: string;
  questionId: string;     // ID của câu hỏi
  url: string;            // URL của hình ảnh
  type: QuestionImageType; // Loại hình ảnh (QUESTION/SOLUTION)
  createdAt: Date;        // Thời điểm tạo

  constructor(partial: Partial<QuestionImage>) {
    Object.assign(this, partial);
  }
} 