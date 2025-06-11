/**
 * Đại diện cho một lần làm bài thi
 */
export interface ExamAttempt {
  /**
   * ID của lần làm bài
   */
  id: string;
  
  /**
   * ID của bài thi
   */
  examId: string;
  
  /**
   * ID của người dùng
   */
  userId: string;
  
  /**
   * Thời gian bắt đầu làm bài
   */
  startedAt: Date;
  
  /**
   * Thời gian hoàn thành bài thi
   */
  completedAt?: Date;
  
  /**
   * Trạng thái hoàn thành
   */
  isCompleted: boolean;
  
  /**
   * Câu trả lời của người dùng
   * Có thể lưu cấu trúc dữ liệu phức tạp dạng JSON
   */
  answers?: Record<string, unknown>;
  
  /**
   * Điểm số đạt được
   */
  score?: number;
  
  /**
   * Điểm tối đa có thể đạt được
   */
  maxScore?: number;
  
  /**
   * Trạng thái đạt yêu cầu
   */
  passed?: boolean;
  
  /**
   * Thời gian làm bài (giây)
   */
  timeSpent?: number;
  
  /**
   * Thời gian tạo bản ghi
   */
  createdAt: Date;
  
  /**
   * Thời gian cập nhật cuối cùng
   */
  updatedAt: Date;
  
  /**
   * Thông tin bài thi
   */
  exam?: Record<string, unknown>;
}

/**
 * Filters for querying exam attempts
 */
export interface ExamAttemptFilters {
  /**
   * Filter by user ID
   */
  userId?: string;
  
  /**
   * Filter by exam ID
   */
  examId?: string;
  
  /**
   * Filter by completion status
   */
  isCompleted?: boolean;
  
  /**
   * Maximum number of items to return
   */
  limit?: number;
  
  /**
   * Number of items to skip
   */
  offset?: number;
}

/**
 * Data required to create a new exam attempt
 */
export interface ExamAttemptCreateData {
  examId: string;
  userId: string;
  startedAt: Date;
  isCompleted: boolean;
  answers?: Record<string, unknown>;
}

/**
 * Data for updating an exam attempt
 */
export interface ExamAttemptUpdateData {
  completedAt?: Date;
  isCompleted?: boolean;
  answers?: Record<string, unknown>;
  score?: number;
  timeSpent?: number;
  passed?: boolean;
}

/**
 * Interface for the Exam Attempt Repository
 */
export interface IExamAttemptRepository {
  /**
   * Find all attempts with optional filters
   * @param filters Optional filters for the query
   * @returns Promise with array of ExamAttempt
   */
  findAll(filters?: ExamAttemptFilters): Promise<ExamAttempt[]>;

  /**
   * Find an attempt by its ID
   * @param id The ID of the attempt
   * @returns Promise with the ExamAttempt or null if not found
   */
  findById(id: string): Promise<ExamAttempt | null>;

  /**
   * Find all attempts for a specific user
   * @param userId The ID of the user
   * @returns Promise with array of ExamAttempt
   */
  findByUserId(userId: string): Promise<ExamAttempt[]>;

  /**
   * Find all attempts for a specific exam
   * @param examId The ID of the exam
   * @returns Promise with array of ExamAttempt
   */
  findByExamId(examId: string): Promise<ExamAttempt[]>;

  /**
   * Find the latest incomplete attempt for a user and exam
   * @param userId The ID of the user
   * @param examId The ID of the exam
   * @returns Promise with the ExamAttempt or null if not found
   */
  findIncompleteAttempt(userId: string, examId: string): Promise<ExamAttempt | null>;

  /**
   * Create a new attempt
   * @param data The attempt data to create
   * @returns Promise with the created ExamAttempt
   */
  create(data: ExamAttemptCreateData): Promise<ExamAttempt>;

  /**
   * Update an existing attempt
   * @param id The ID of the attempt to update
   * @param data The data to update
   * @returns Promise with the updated ExamAttempt
   */
  update(id: string, data: ExamAttemptUpdateData): Promise<ExamAttempt>;

  /**
   * Update the answers for an attempt
   * @param id The ID of the attempt
   * @param answers The updated answers, có thể chứa dữ liệu phức tạp
   * @returns Promise with the updated ExamAttempt
   */
  updateAnswers(id: string, answers: Record<string, unknown>): Promise<ExamAttempt>;

  /**
   * Complete an attempt and calculate the score
   * @param id The ID of the attempt
   * @param endTime The time the attempt was completed
   * @returns Promise with the completed ExamAttempt
   */
  completeAttempt(id: string, endTime: Date): Promise<ExamAttempt>;

  /**
   * Calculate the score for an attempt
   * @param id The ID of the attempt
   * @returns Promise with the calculated score
   */
  calculateScore(id: string): Promise<number>;

  /**
   * Delete an attempt
   * @param id The ID of the attempt to delete
   * @returns Promise with boolean indicating success
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count attempts for a specific user or exam
   * @param filters Filters to count by
   * @returns Promise with the count
   */
  count(filters?: ExamAttemptFilters): Promise<number>;
} 