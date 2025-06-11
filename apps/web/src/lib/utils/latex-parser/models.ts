'use client';

/**
 * Định nghĩa các interface cho các đối tượng dùng trong LaTeXParser
 */

export interface QuestionID {
  format: 'ID5' | 'ID6';
  fullId: string;
  lop: string;
  mon: string;
  chuong: string;
  muc_do: string;
  bai: string;
  dang?: string;
}

export interface Answer {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface Question {
  rawContent: string; // Thay raw_content bằng rawContent
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'essay' | 'unknown';
  content: string;
  correctAnswer: string | string[]; // Thay correct_answer bằng correctAnswer
  solution?: string;
  questionId?: QuestionID; // Thay question_id bằng questionId
  subcount?: string;
  source?: string;
  answers?: Answer[];
}

// Chuyển đổi từ QuestionID sang SubcountDetails
export interface SubcountDetails {
  fullId: string;
  prefix: string;
  number: string;
}

// Chuyển đổi từ QuestionID sang QuestionIdDetails
export interface QuestionIdDetails {
  fullId: string;
  grade: string;
  subject: string;
  chapter: string;
  level: string;
  lesson: string;
  type: string;
}

// Chuyển đổi từ Question sang ExtractedQuestion
export interface ExtractedQuestion {
  rawContent: string;
  content: string;
  type: string;
  questionId: string | null;
  questionIdDetails: QuestionIdDetails | null;
  subcount: SubcountDetails | null;
  source: string | null;
  solution: string | null;
  solutions: string[];
  answers: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string | string[];
}