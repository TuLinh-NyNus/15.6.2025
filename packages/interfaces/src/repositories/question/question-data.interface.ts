import { QuestionDifficulty, QuestionStatus } from '@project/entities';
import { QuestionType } from '@project/entities/dist/enums/question-enums';

/**
 * Interface định nghĩa dữ liệu câu hỏi
 */
export interface QuestionData {
  id?: string;
  questionId?: string;
  title: string;
  content: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  explanation?: string;
  createdBy?: string;
  updatedBy?: string;
  options?: QuestionOptionData[];
  tags?: string[];
  images?: string[];
}

/**
 * Interface định nghĩa dữ liệu lựa chọn trong câu hỏi
 */
export interface QuestionOptionData {
  id?: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

/**
 * Interface định nghĩa dữ liệu phiên bản câu hỏi
 */
export interface QuestionVersionData {
  id?: string;
  questionId: string;
  version: number;
  title: string;
  content: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  explanation?: string;
  createdBy?: string;
  options?: QuestionOptionData[];
  images?: string[];
  isCurrent?: boolean;
} 