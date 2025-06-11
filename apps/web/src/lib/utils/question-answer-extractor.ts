'use client';

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

import { QuestionTypeEnum } from './latex-parser';
import { extractFromLatex } from './latex-parser';
import logger from './logger';

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
    // Sử dụng LaTeXParser để trích xuất thông tin
    const extractedQuestion = extractFromLatex(latexContent);

    // Xác định loại câu hỏi
    const questionType = extractedQuestion.type;

    // Chuyển đổi type sang định dạng enum
    let type: string;
    switch (questionType) {
      case 'multiple-choice':
        type = QuestionTypeEnum.MC;
        break;
      case 'true-false':
        type = QuestionTypeEnum.TF;
        break;
      case 'short-answer':
        type = QuestionTypeEnum.SA;
        break;
      case 'matching':
        type = QuestionTypeEnum.MA;
        break;
      case 'essay':
      default:
        type = QuestionTypeEnum.ES;
        break;
    }

    return { type };
  } catch (error) {
    logger.error('Lỗi khi trích xuất type:', error);
    return { type: QuestionTypeEnum.ES }; // Mặc định là Essay nếu có lỗi
  }
}

// Đã xóa hàm prepareAnswersForDatabase

/**
 * Chuyển đổi type từ enum sang dạng đầy đủ
 * @param type Type dưới dạng enum
 * @returns Type dưới dạng đầy đủ
 */
export function convertTypeToFullForm(type: string): string {
  switch (type) {
    case QuestionTypeEnum.MC:
      return 'multiple-choice';
    case QuestionTypeEnum.TF:
      return 'true-false';
    case QuestionTypeEnum.SA:
      return 'short-answer';
    case QuestionTypeEnum.MA:
      return 'matching';
    case QuestionTypeEnum.ES:
    default:
      return 'essay';
  }
}
