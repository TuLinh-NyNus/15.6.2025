export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum ExamForm {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  ESSAY = 'ESSAY',
  MIXED = 'MIXED'
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  MATCHING = 'MATCHING',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  ESSAY = 'ESSAY'
}

export interface Exam {
  id: string;
  title: string;
  description: Record<string, unknown>;
  duration: number;
  subject: string;
  grade: string;
  difficulty: Difficulty;
  category: string;
  form: ExamForm;
  passingScore: number;
  isPublished: boolean;
  allowReview: boolean;
  shuffleQuestions: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExamQuestion {
  id: number;
  examId: string;
  content: string;
  correctAnswer: string;
  options: Record<string, string>;
  difficultyLevel: Difficulty;
  questionType: QuestionType;
  score: number;
  order: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  isPassed?: boolean;
  answers?: Record<string, string>;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  createdAt: string;
  updatedAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: number;
  isPassed: boolean;
  attemptId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamStats {
  examId: string;
  title: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageDuration: number;
  passRate: number;
  scoreDistribution: Record<string, number>;
  updatedAt: string;
  subject: string;
  grade: string;
  difficulty: Difficulty;
  examCategory: string;
  form: ExamForm;
}

export interface QuestionStats {
  questionId: number;
  orderInExam: number;
  correctRate: number;
  correctCount: number;
  totalAnswered: number;
  averageTimeSpent: number;
  optionDistribution: Record<string, number>;
}

export interface DetailedExamStats extends ExamStats {
  questionStats: QuestionStats[];
} 