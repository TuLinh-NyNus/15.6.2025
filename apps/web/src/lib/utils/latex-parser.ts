'use client';

/**
 * Utility phân tích câu hỏi LaTeX
 * Dựa trên tài liệu parser từ project Database
 */

import { LaTeXParser } from './latex-parser/parser';
import { isBalancedBrackets } from './latex-parser-brackets';

// Không sử dụng các type này, nhưng giữ lại comment để tham khảo sau này
// import type {
//   ExtractedQuestion as NewExtractedQuestion,
//   QuestionIdDetails as NewQuestionIdDetails,
//   SubcountDetails as NewSubcountDetails
// } from './latex-parser/models';

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'essay' | 'unknown';

// Enum cho loại câu hỏi (tương ứng với QuestionType trong database)
export enum QuestionTypeEnum {
  MC = 'MC', // Multiple Choice - Trắc nghiệm một đáp án
  TF = 'TF', // True/False - Đúng/Sai
  SA = 'SA', // Short Answer - Trả lời ngắn
  MA = 'MA', // Matching - Ghép đôi
  ES = 'ES'  // Essay - Tự luận
}

export interface ExtractedQuestion {
  // Thông tin chung
  rawContent: string;
  content: string;
  type: QuestionType;

  // Thông tin định danh
  questionId: string | null;
  questionIdDetails: QuestionIdDetails | null;
  subcount: SubcountDetails | null;

  // Nội dung chi tiết
  source: string | null;
  solution: string | null;  // Lời giải đầu tiên hoặc tất cả gộp lại
  solutions: string[];      // Mảng chứa tất cả các lời giải riêng biệt

  // Đáp án
  answers: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string | string[];
}

export interface QuestionIdDetails {
  fullId: string;
  grade: string;
  subject: string;
  chapter: string;
  level: string;
  lesson: string;
  type: string;
}

export interface SubcountDetails {
  fullId: string;
  prefix: string;
  number: string;
}

// Các regex patterns được sử dụng bởi LaTeXParser
// Các pattern này được giữ lại trong LaTeXParser và không cần ở đây

// Pattern cho các môi trường hình ảnh - không được sử dụng trong file này
// const IMAGE_PATTERNS = [
//   /\\includegraphics(?:\[.*?\])?\{(.*?)\}/g,
//   /\\begin\{figure\}([\s\S]*?)\\end\{figure\}/g
// ];

// Hàm này không được sử dụng trong file này
// Có thể được chuyển vào LaTeXParser nếu cần
// /**
//  * Thay thế các môi trường hình ảnh bằng placeholder
//  */
// function replaceImageEnvironments(content: string): string {
//   let result = content;
//   for (const pattern of IMAGE_PATTERNS) {
//     result = result.replace(pattern, '[IMAGE]');
//   }
//   return result;
// }

/**
 * Trích xuất thông tin câu hỏi từ nội dung LaTeX
 * @param latexContent Nội dung LaTeX cần trích xuất
 * @returns ExtractedQuestion Đối tượng chứa thông tin trích xuất
 */
export function extractFromLatex(latexContent: string): ExtractedQuestion {
  if (!latexContent || !isBalancedBrackets(latexContent)) {
    throw new Error('Nội dung LaTeX không hợp lệ hoặc thiếu dấu ngoặc');
  }

  // Sử dụng LaTeXParser mới
  const extractedQuestion = LaTeXParser.extract(latexContent);

  if (!extractedQuestion) {
    throw new Error('Không thể trích xuất thông tin từ nội dung LaTeX');
  }

  // Thêm các lời giải từ phương pháp trích xuất khác
  const allSolutions = extractedQuestion.solutions.length > 0
    ? extractedQuestion.solutions
    : LaTeXParser.extractAllSolutions(latexContent).map((sol: string, idx: number) => `Lời giải ${idx + 1}: ${sol}`);

  // Đảm bảo type là QuestionType hợp lệ
  let questionType: QuestionType;

  // Chuyển đổi type từ extractedQuestion sang enum QuestionType
  const typeEnum = mapToQuestionTypeEnum(extractedQuestion.type);

  // Chuyển đổi từ enum QuestionType sang QuestionType cho UI
  switch (typeEnum) {
    case QuestionTypeEnum.MC:
      questionType = 'multiple-choice';
      break;
    case QuestionTypeEnum.TF:
      questionType = 'true-false';
      break;
    case QuestionTypeEnum.SA:
      questionType = 'short-answer';
      break;
    case QuestionTypeEnum.MA:
      questionType = 'matching';
      break;
    case QuestionTypeEnum.ES:
      questionType = 'essay';
      break;
    default:
      questionType = 'unknown';
  }

  // Log để debug
  console.log('Extracted question type:', {
    original: extractedQuestion.type,
    mapped: typeEnum,
    final: questionType
  });

  return {
    rawContent: extractedQuestion.rawContent,
    content: extractedQuestion.content,
    type: questionType,
    questionId: extractedQuestion.questionId,
    questionIdDetails: extractedQuestion.questionIdDetails,
    subcount: extractedQuestion.subcount,
    source: extractedQuestion.source,
    solution: extractedQuestion.solution,
    solutions: allSolutions,
    answers: extractedQuestion.answers,
    correctAnswer: extractedQuestion.correctAnswer
  };
}

/**
 * Trích xuất thông tin Subcount từ chuỗi LaTeX
 * @param latexContent Chuỗi LaTeX cần trích xuất
 * @returns SubcountDetails | null - Thông tin Subcount hoặc null nếu không tìm thấy
 */
export function extractSubcount(latexContent: string): SubcountDetails | null {
  const result = LaTeXParser.parseQuestionId(latexContent);
  const subcount = result ? result[1] : null;

  if (subcount) {
    const parts = subcount.split('.');
    if (parts.length === 2) {
      return {
        fullId: subcount,
        prefix: parts[0],
        number: parts[1]
      };
    }
  }

  return null;
}

/**
 * Trích xuất lời giải từ chuỗi LaTeX với xử lý chính xác các dấu ngoặc lồng nhau
 * @param latexContent Chuỗi LaTeX cần trích xuất
 * @returns string[] - Mảng các lời giải
 */
export function extractSolutions(latexContent: string): string[] {
  return LaTeXParser.extractAllSolutions(latexContent);
}

/**
 * Phân tích ID câu hỏi
 */
export function parseQuestionId(idString: string): QuestionIdDetails | null {
  if (!idString || !idString.includes('-')) {
    return null;
  }

  // Tách ID thành các thành phần
  const [left, right] = idString.split('-');

  if (left.length < 5) {
    return null;
  }

  return {
    fullId: idString,
    grade: left[0] || '',
    subject: left[1] || '',
    chapter: left[2] || '',
    level: left[3] || '',
    lesson: left[4] || '',
    type: right || ''
  };
}

/**
 * Chuyển đổi từ ID chi tiết sang mô tả
 */
export function getQuestionIdDescription(details: QuestionIdDetails | null): {
  grade: { value: string } | null;
  subject: { value: string } | null;
  chapter: { value: string } | null;
  level: { value: string } | null;
  lesson: { value: string } | null;
  type: { value: string } | null;
} {
  if (!details) return {
    grade: null,
    subject: null,
    chapter: null,
    level: null,
    lesson: null,
    type: null
  };

  return {
    grade: { value: details.grade },
    subject: { value: details.subject },
    chapter: { value: details.chapter },
    level: { value: details.level },
    lesson: { value: details.lesson },
    type: { value: details.type }
  };
}

// Hàm này không được sử dụng trong file này
// Có thể được export nếu cần sử dụng ở nơi khác
// /**
//  * Hàm helper để lấy mô tả cho khối lớp từ MapID
//  */
// export function getGradeDescription(grade: string): string {
//   const gradeMap: {[key: string]: string} = {
//     '1': 'Lớp 10',
//     '2': 'Lớp 11',
//     '3': 'Lớp 12',
//     '0': 'Đại học'
//   };
//   return gradeMap[grade] || `Lớp ${grade}`;
// }

// Hàm này không được sử dụng trong file này
// Có thể được export nếu cần sử dụng ở nơi khác
// /**
//  * Hàm helper để lấy mô tả cho môn học từ MapID
//  */
// export function getSubjectDescription(subject: string): string {
//   const subjectMap: {[key: string]: string} = {
//     'T': 'Toán học',
//     'P': 'Vật lý',
//     'H': 'Hóa học',
//     'S': 'Sinh học',
//     'L': 'Lịch sử',
//     'D': 'Địa lý',
//     'A': 'Tiếng Anh',
//     'V': 'Ngữ văn',
//     'C': 'Công nghệ',
//     'I': 'Tin học'
//   };
//   return subjectMap[subject] || `Môn ${subject}`;
// }

/**
 * Chuyển đổi loại câu hỏi từ dạng trích xuất sang dạng form
 * @param type Loại câu hỏi trích xuất
 * @returns Loại câu hỏi dạng form
 */
export function mapQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'multiple-choice': 'multiple-choice',
    'true-false': 'true-false',
    'short-answer': 'short-answer',
    'matching': 'matching',
    'essay': 'essay',
    'MC': 'multiple-choice',
    'TF': 'true-false',
    'SA': 'short-answer',
    'MA': 'matching',
    'ES': 'essay'
  };

  return typeMap[type] || 'essay';
}

/**
 * Chuyển đổi loại câu hỏi từ dạng trích xuất sang enum QuestionType
 * @param type Loại câu hỏi trích xuất
 * @returns Enum QuestionType
 */
export function mapToQuestionTypeEnum(type: string): QuestionTypeEnum {
  // Nếu đã là enum QuestionType, trả về luôn
  if (Object.values(QuestionTypeEnum).includes(type as QuestionTypeEnum)) {
    return type as QuestionTypeEnum;
  }

  // Chuyển đổi từ dạng string sang enum
  const typeMap: Record<string, QuestionTypeEnum> = {
    // Các loại cũ
    'multiple-choice': QuestionTypeEnum.MC,
    'true-false': QuestionTypeEnum.TF,
    'short-answer': QuestionTypeEnum.SA,
    'matching': QuestionTypeEnum.MA,
    'essay': QuestionTypeEnum.ES,
    'unknown': QuestionTypeEnum.ES,

    // Các loại mới từ LaTeX parser
    'choice': QuestionTypeEnum.MC,
    'choiceTF': QuestionTypeEnum.TF,
    'shortans': QuestionTypeEnum.SA,
    'match': QuestionTypeEnum.MA
  };

  return typeMap[type] || QuestionTypeEnum.ES;
}