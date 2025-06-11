/**
 * Cấu trúc answers trong ExamResult
 */
export interface ExamResultAnswers {
  [questionId: string]: {
    selectedOptionIds?: number[]; // ID các lựa chọn đã chọn (trắc nghiệm)
    textAnswer?: string; // Câu trả lời dạng text (tự luận)
    isCorrect: boolean; // Đúng/sai
    score: number; // Điểm cho câu này
    maxScore: number; // Điểm tối đa có thể đạt
    timeSpent?: number; // Thời gian làm câu này (giây)
    feedback?: string; // Phản hồi từ hệ thống/giáo viên
  };
}

/**
 * Entity cho model ExamResult
 */
export class ExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  maxScore: number;
  startedAt: Date;
  completedAt: Date;
  duration: number; // Thời gian làm bài tính bằng giây
  answers: ExamResultAnswers | null;

  constructor(partial: Partial<ExamResult>) {
    Object.assign(this, partial);
  }
} 