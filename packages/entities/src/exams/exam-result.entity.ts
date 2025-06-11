import { User } from '../users/user.entity';
import { Exam } from './exam.entity';

export class ExamResult {
  id: number;
  
  examId: string;
  
  exam?: Exam;
  
  userId: string;
  
  user?: User;
  
  score: number;
  
  maxScore: number;
  
  timeTaken: number;
  
  completedAt: Date;
  
  isPassed: boolean;
  
  correctAnswers: number;
  
  totalQuestions: number;
  
  feedback?: string;
  
  createdAt: Date;
  
  updatedAt: Date;
} 