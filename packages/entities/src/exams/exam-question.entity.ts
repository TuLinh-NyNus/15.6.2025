import { Difficulty, QuestionType } from '../enums/exam-enums';
import { Exam } from './exam.entity';

export class ExamQuestion {
  id: number;
  examId: number;
  content: string;
  questionType: QuestionType;
  correctAnswer: string | string[];
  options: { id: string; text: string }[];
  explanation?: string;
  difficultyLevel: Difficulty;
  score: number;
  order: number;
  sourceQuestionId?: string;
  exam?: Exam;
  createdAt: Date;
  updatedAt: Date;
} 