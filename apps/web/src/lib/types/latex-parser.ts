/**
 * Định nghĩa các kiểu dữ liệu liên quan đến trích xuất LaTeX
 */

/**
 * Interface cho chi tiết QuestionID
 */
export interface QuestionIdDetails {
  fullId: string;
  grade: string;
  subject: string;
  chapter: string;
  level: string;
  lesson: string;
  type: string;
  form?: string; // Tham số 6 - dạng câu hỏi (xuất hiện sau dấu gạch ngang)
}

/**
 * Interface cho chi tiết Subcount
 */
export interface SubcountDetails {
  prefix: string;
  number: string;
  fullId: string;
}

/**
 * Interface cho đáp án được trích xuất
 */
export interface ExtractedAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

/**
 * Type cho đáp án có thể chỉnh sửa
 * Để hỗ trợ các trường hợp hiện tại trong code
 */
export type EditableAnswer = string | ExtractedAnswer;

/**
 * Interface cho kết quả trích xuất từ LaTeX
 */
export interface ExtractionResult {
  type: string;
  rawContent: string;
  content: string;
  questionId?: string;
  questionIdDetails?: QuestionIdDetails;
  subcount?: SubcountDetails;
  source?: string;
  solution?: string;
  solutions?: string[];
  answers: ExtractedAnswer[];
  correctAnswer?: string | string[];
}

/**
 * Interface cho kết quả decode MapID
 */
export interface MapIDResult {
  mapID: string;
  grade: {
    code: string;
    description: string;
  };
  subject: {
    code: string;
    description: string;
  };
  chapter: {
    code: string;
    description: string;
  };
  difficulty: {
    code: string;
    description: string;
  };
  lesson: {
    code: string;
    description: string;
  };
  form?: {
    code: string;
    description: string;
  };
  fullDescription: string;
}
