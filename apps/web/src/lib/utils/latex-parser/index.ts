'use client';

import { LaTeXParser } from './parser';
import type { ExtractedQuestion } from './models';

export { LaTeXParser } from './parser';
export { QUESTION_TYPE_DESCRIPTION, QUESTION_TYPE_MAP } from './constants';
export type {
  Question,
  QuestionID,
  Answer,
  ExtractedQuestion,
  QuestionIdDetails,
  SubcountDetails
} from './models';

/**
 * Trích xuất thông tin từ nội dung LaTeX
 * @param content Nội dung LaTeX
 * @returns Thông tin đã trích xuất hoặc null nếu không thể trích xuất
 */
export function extractFromLatex(content: string): ExtractedQuestion | null {
  try {
    return LaTeXParser.extract(content);
  } catch (error) {
    console.error('Lỗi khi trích xuất thông tin từ LaTeX:', error);
    return null;
  }
}