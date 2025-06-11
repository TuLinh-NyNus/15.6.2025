/**
 * Định nghĩa các kiểu dữ liệu liên quan đến câu hỏi
 */

/**
 * Enum cho loại câu hỏi
 */
export enum QuestionType {
  MC = 'MC',
  TF = 'TF',
  SA = 'SA',
  ES = 'ES',
  MA = 'MA'
}

/**
 * Interface cho đáp án câu hỏi
 */
export interface QuestionAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

/**
 * Interface cho QuestionID
 */
export interface QuestionIDField {
  value: string;
  description?: string;
  id?: string;
  name?: string;
  level?: number;
}

export interface QuestionID {
  format: string;
  fullId: string;
  grade: QuestionIDField;
  subject: QuestionIDField;
  chapter?: QuestionIDField | null;
  level?: QuestionIDField;
  difficulty?: QuestionIDField;
  lesson?: QuestionIDField | null;
  form?: QuestionIDField;
  [key: string]: unknown; // Cho phép các trường động
}

/**
 * Interface cho Subcount
 */
export interface Subcount {
  prefix: string;
  number: string;
  fullId: string;
}

/**
 * Interface cho dữ liệu câu hỏi
 */
export interface QuestionFormData {
  id?: string;
  content: string;
  rawContent?: string;
  type: string;
  form: string;
  solution?: string;
  source?: string;
  tags?: string[];
  subcount: Subcount;
  questionID: QuestionID;
  answers: QuestionAnswer[];
  correctAnswer?: string | string[];
}
