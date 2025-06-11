import apiClient from '../api-client';

/**
 * Interface cho tham số tìm kiếm bài thi
 */
export interface IExamFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string[];
  status?: string[];
  creatorId?: string;
  [key: string]: unknown;
}

/**
 * Interface cho response danh sách bài thi
 */
export interface IExamListResponse {
  items: IExam[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface cho bài thi
 */
export interface IExam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho câu hỏi trong bài thi
 */
export interface IExamQuestion {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: {
    id: string;
    content: string;
    isCorrect: boolean;
  }[];
  correctAnswer?: string;
  points: number;
}

/**
 * Interface cho request tạo bài thi
 */
export interface ICreateExamRequest {
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  categoryId: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  [key: string]: unknown;
}

/**
 * Interface cho request cập nhật bài thi
 */
export interface IUpdateExamRequest {
  title?: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  [key: string]: unknown;
}

/**
 * Interface cho attempt bài thi
 */
export interface IExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  answers: {
    questionId: string;
    answer: string;
    isCorrect?: boolean;
    points?: number;
  }[];
}

/**
 * Service cho bài thi
 */
export const examService = {
  /**
   * Lấy danh sách bài thi
   * @param params Tham số tìm kiếm
   * @returns Danh sách bài thi
   */
  getExams: async (params?: IExamFilterParams): Promise<IExamListResponse> => {
    return apiClient.get<IExamListResponse>('/exams', { params });
  },

  /**
   * Lấy bài thi theo ID
   * @param id ID bài thi
   * @returns Bài thi
   */
  getExam: async (id: string): Promise<IExam> => {
    return apiClient.get<IExam>(`/exams/${id}`);
  },

  /**
   * Tạo bài thi mới
   * @param data Dữ liệu bài thi
   * @returns Bài thi đã tạo
   */
  createExam: async (data: ICreateExamRequest): Promise<IExam> => {
    return apiClient.post<IExam>('/exams', data);
  },

  /**
   * Cập nhật bài thi
   * @param id ID bài thi
   * @param data Dữ liệu cập nhật
   * @returns Bài thi đã cập nhật
   */
  updateExam: async (id: string, data: IUpdateExamRequest): Promise<IExam> => {
    return apiClient.put<IExam>(`/exams/${id}`, data);
  },

  /**
   * Xóa bài thi
   * @param id ID bài thi
   * @returns Response rỗng
   */
  deleteExam: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/exams/${id}`);
  },

  /**
   * Lấy danh sách câu hỏi của bài thi
   * @param examId ID bài thi
   * @returns Danh sách câu hỏi
   */
  getExamQuestions: async (examId: string): Promise<IExamQuestion[]> => {
    return apiClient.get<IExamQuestion[]>(`/exams/${examId}/questions`);
  },

  /**
   * Thêm câu hỏi vào bài thi
   * @param examId ID bài thi
   * @param questionId ID câu hỏi
   * @returns Câu hỏi đã thêm
   */
  addQuestionToExam: async (examId: string, questionId: string): Promise<IExamQuestion> => {
    return apiClient.post<IExamQuestion>(`/exams/${examId}/questions`, { questionId });
  },

  /**
   * Xóa câu hỏi khỏi bài thi
   * @param examId ID bài thi
   * @param questionId ID câu hỏi
   * @returns Response rỗng
   */
  removeQuestionFromExam: async (examId: string, questionId: string): Promise<void> => {
    return apiClient.delete<void>(`/exams/${examId}/questions/${questionId}`);
  },

  /**
   * Bắt đầu làm bài thi
   * @param examId ID bài thi
   * @returns Attempt bài thi
   */
  startExam: async (examId: string): Promise<IExamAttempt> => {
    return apiClient.post<IExamAttempt>(`/exam-attempts/start/${examId}`, {});
  },

  /**
   * Nộp bài thi
   * @param attemptId ID attempt
   * @param answers Danh sách câu trả lời
   * @returns Kết quả bài thi
   */
  submitExam: async (attemptId: string, answers: { questionId: string; answer: string }[]): Promise<IExamAttempt> => {
    return apiClient.post<IExamAttempt>(`/exam-attempts/${attemptId}/submit`, { answers });
  },

  /**
   * Lấy kết quả bài thi
   * @param attemptId ID attempt
   * @returns Kết quả bài thi
   */
  getExamResult: async (attemptId: string): Promise<IExamAttempt> => {
    return apiClient.get<IExamAttempt>(`/exam-attempts/${attemptId}/result`);
  },

  /**
   * Lấy lịch sử làm bài thi
   * @param userId ID người dùng
   * @returns Danh sách attempt
   */
  getUserExamHistory: async (userId: string): Promise<IExamAttempt[]> => {
    return apiClient.get<IExamAttempt[]>(`/exam-attempts/user/${userId}`);
  },
};

export default examService;
