import { Difficulty, ExamCategory, ExamForm, ExamType } from './exam-enums';

/**
 * Cấu trúc mô tả trong description
 */
export interface ExamDescription {
  schoolYear?: string; // Năm học (VD: "2023-2024")
  schoolName?: string; // Tên trường
  province?: string; // Tỉnh/thành phố
  examName?: string; // Tên kỳ thi
  examDate?: string; // Ngày thi
  examTime?: string; // Thời gian thi
  examClass?: string; // Lớp thi
  instructions?: string; // Hướng dẫn làm bài
  additionalInfo?: Record<string, unknown>; // Thông tin bổ sung
}

/**
 * Entity cho model Exam
 */
export class Exam {
  id: string;
  title: string;
  description: ExamDescription | null;
  questions: number[];
  duration: number;
  difficulty: Difficulty;
  subject: string;
  grade: number;
  form: ExamForm;
  createdBy: string;
  averageScore: number | null;
  updatedAt: Date;
  createdAt: Date;
  tags: string[];
  examCategory: ExamCategory;
  type: ExamType;

  constructor(partial: Partial<Exam>) {
    Object.assign(this, partial);
  }
} 