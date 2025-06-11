/**
 * Utility để trích xuất và xử lý answers và correctAnswer từ nội dung LaTeX
 * Dựa trên yêu cầu:
 *
 * 1. Answers: Danh sách đáp án của câu hỏi để chọn
 *    - MC và TF: Lưu thành mảng [đáp án 1, đáp án 2, đáp án 3, đáp án 4,...]
 *    - SA và ES: Để trống (null)
 *    - MA: Để trống (null)
 *
 * 2. CorrectAnswer: Đáp án đúng
 *    - MC: Phần phía sau \True, một câu hỏi chỉ có một đáp án đúng
 *    - TF: Phần phía sau \True, có thể có nhiều đáp án đúng hoặc không có đáp án đúng nào
 *    - SA: Nằm trong \shortans{'Đáp án đúng sẽ nằm ở đây'}
 */

import { Logger } from '@nestjs/common';

// Enum cho loại câu hỏi
enum QuestionType {
  MC = 'MC', // Multiple Choice - Trắc nghiệm một đáp án
  TF = 'TF', // True/False - Đúng/Sai
  SA = 'SA', // Short Answer - Trả lời ngắn
  MA = 'MA', // Matching - Ghép đôi
  ES = 'ES'  // Essay - Tự luận
}

// Logger
const logger = new Logger('QuestionAnswerExtractor');

/**
 * Interface cho kết quả trích xuất đáp án
 */
export interface ExtractedAnswers {
  type: string;
}

/**
 * Trích xuất type từ nội dung LaTeX
 * @param latexContent Nội dung LaTeX cần trích xuất
 * @returns ExtractedAnswers Đối tượng chứa type
 */
export function extractAnswersFromLatex(latexContent: string): ExtractedAnswers {
  try {
    // Xác định loại câu hỏi
    const questionType = identifyQuestionType(latexContent);

    return { type: questionType };
  } catch (error) {
    logger.error(`Lỗi khi trích xuất type: ${error.message}`);
    return { type: QuestionType.ES };
  }
}

/**
 * Xác định loại câu hỏi từ nội dung LaTeX
 * @param content Nội dung LaTeX
 * @returns Loại câu hỏi
 */
function identifyQuestionType(content: string): string {
  if (content.includes('\\choiceTF')) {
    return QuestionType.TF; // True/False
  } else if (content.includes('\\choice') && !content.includes('\\choiceTF')) {
    return QuestionType.MC; // Multiple Choice
  } else if (content.includes('\\shortans')) {
    return QuestionType.SA; // Short Answer
  } else if (content.includes('\\matching')) {
    return QuestionType.MA; // Matching
  } else {
    return QuestionType.ES; // Essay (mặc định)
  }
}

// Đã xóa các hàm không cần thiết
