import { Exam } from './exam.entity';

/**
 * Represents an attempt by a user to take an exam
 */
export class ExamAttempt {
  /**
   * Unique identifier for the attempt
   */
  id: string;

  /**
   * ID of the exam being attempted
   */
  examId: string;

  /**
   * Reference to the exam
   */
  exam?: Exam;

  /**
   * ID of the user taking the exam
   */
  userId: string;

  /**
   * When the attempt was started
   */
  startedAt: Date;

  /**
   * When the attempt was completed
   */
  completedAt?: Date;

  /**
   * Whether the attempt has been completed
   */
  isCompleted: boolean;

  /**
   * User's answers to questions, stored as questionId -> answer
   */
  answers: Record<string, string>;

  /**
   * Score achieved (as a percentage 0-100)
   */
  score?: number;

  /**
   * Maximum possible score
   */
  maxScore?: number;

  /**
   * Whether the user passed the exam based on threshold
   */
  passed?: boolean;

  /**
   * Time spent on the exam in seconds
   */
  timeSpent?: number;

  /**
   * When the attempt record was created
   */
  createdAt: Date;

  /**
   * When the attempt record was last updated
   */
  updatedAt: Date;
} 