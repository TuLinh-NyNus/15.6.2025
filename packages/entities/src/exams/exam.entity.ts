import { ExamCategory, ExamForm, ExamType } from '../enums/exam-enums';
import { ExamQuestion } from './exam-question.entity';

export class Exam {
  id: number;
  userId: number;
  title: string;
  description: Record<string, unknown>;
  timeLimit: number; // in minutes
  passingScore: number;
  examCategories: ExamCategory[];
  examForm: ExamForm;
  examType: ExamType;
  isRandomized: boolean;
  visibleToStudents: boolean;
  startDate?: Date;
  endDate?: Date;
  questions?: ExamQuestion[];
  createdAt: Date;
  updatedAt: Date;
} 