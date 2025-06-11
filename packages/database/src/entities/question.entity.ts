import { QuestionDifficulty, QuestionStatus, QuestionType } from './question-enums';
import { QuestionImage } from './question-image.entity';

/**
 * Interface cho cấu trúc đáp án
 */
export interface QuestionAnswer {
  id: string;
  content: string;
  isCorrect?: boolean;
  explanation?: string;
  order?: number;
}

/**
 * Entity cho model Question
 */
export class Question {
  id: string;
  content: string;           // 6. Content: Nội dung câu hỏi đã xử lý
  rawContent: string;        // 1. RawContent: Nội dung gốc LaTex của câu hỏi
  type: QuestionType;        // 4. Type: Loại câu hỏi (MC, TF, SA, ES)
  questionId?: string | null; // 2. QuestionID: Mục đích dùng để phân loại câu hỏi
  subcount?: string | null;   // 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi
  source?: string | null;     // 5. Source: Nguồn câu hỏi
  answers?: QuestionAnswer[] | null; // 7. Answers: Danh sách đáp án của câu hỏi để chọn
  correctAnswer?: string[] | null;   // 8. CorrectAnswer: Đáp án đúng
  solution?: string | null;   // 9. Solution: Lời giải câu hỏi
  images?: QuestionImage[] | null; // 10. Images: Danh sách hình ảnh
  tags?: string[] | null;     // 11. Tags: Nhãn phân loại
  usageCount: number;        // 12. UsageCount: Số lần sử dụng
  creatorId: string;         // 13. Creator: ID của người tạo
  status: QuestionStatus;    // 14. Status: Trạng thái câu hỏi
  examRefs?: string[] | null; // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
  feedback: number;          // 16. Feedback: Số lần câu hỏi này được feedback
  difficulty?: QuestionDifficulty | null; // Độ khó của câu hỏi (bổ sung)
  createdAt: Date;           // Thời gian tạo
  updatedAt: Date;           // Thời gian cập nhật

  constructor(partial: Partial<Question>) {
    Object.assign(this, partial);
  }
}