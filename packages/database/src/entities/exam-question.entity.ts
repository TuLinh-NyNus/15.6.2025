import { Difficulty, QuestionType } from './exam-enums';

/**
 * Entity cho option của câu hỏi trong Exam
 */
export interface ExamQuestionOption {
  id: number;
  content: string; // Nội dung lựa chọn
  isCorrect: boolean; // Đáp án đúng/sai
}

/**
 * Entity cho model ExamQuestion
 */
export class ExamQuestion {
  id: number;
  content: string; // Nội dung câu hỏi
  type: QuestionType; // Loại câu hỏi
  options?: ExamQuestionOption[]; // Các lựa chọn (cho câu trắc nghiệm)
  correctAnswers?: number[]; // ID các đáp án đúng
  explanation?: string; // Giải thích đáp án
  score: number; // Điểm tối đa cho câu hỏi
  difficultyLevel?: Difficulty; // Độ khó
  tags?: string[]; // Thẻ phân loại
  subject?: string; // Môn học
  grade?: number; // Lớp
  sourceQuestionId?: string; // ID của câu hỏi gốc từ ngân hàng câu hỏi
  examId?: string; // ID của bài thi

  constructor(partial: Partial<ExamQuestion>) {
    Object.assign(this, partial);
  }
} 