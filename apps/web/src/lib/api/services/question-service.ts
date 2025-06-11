import apiClient from '../api-client';

/**
 * Interface cho tham số tìm kiếm câu hỏi
 */
export interface IQuestionFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string[];
  status?: string[];
  difficulty?: string[];
  tags?: string[];
  creatorId?: string;
  [key: string]: unknown;
}

/**
 * Interface cho response danh sách câu hỏi
 */
export interface IQuestionListResponse {
  items: IQuestion[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface cho câu hỏi
 */
export interface IQuestion {
  id: string;
  title: string;
  content: string;
  rawContent?: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  creator: {
    id: string;
    name: string;
    email: string;
  };
  tags?: {
    id: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
  questionId?: string;
  subcount?: string;
}

/**
 * Interface cho request tạo câu hỏi
 */
export interface ICreateQuestionRequest {
  title: string;
  content: string;
  rawContent?: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Interface cho request cập nhật câu hỏi
 */
export interface IUpdateQuestionRequest {
  title?: string;
  content?: string;
  rawContent?: string;
  type?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Service cho câu hỏi
 */
export const questionService = {
  /**
   * Lấy danh sách câu hỏi
   * @param params Tham số tìm kiếm
   * @returns Danh sách câu hỏi
   */
  getQuestions: async (params?: IQuestionFilterParams): Promise<IQuestionListResponse> => {
    return apiClient.get<IQuestionListResponse>('/questions', { params });
  },

  /**
   * Lấy câu hỏi theo ID
   * @param id ID câu hỏi
   * @returns Câu hỏi
   */
  getQuestion: async (id: string): Promise<IQuestion> => {
    return apiClient.get<IQuestion>(`/questions/${id}`);
  },

  /**
   * Tạo câu hỏi mới
   * @param data Dữ liệu câu hỏi
   * @returns Câu hỏi đã tạo
   */
  createQuestion: async (data: ICreateQuestionRequest): Promise<IQuestion> => {
    return apiClient.post<IQuestion>('/questions', data);
  },

  /**
   * Cập nhật câu hỏi
   * @param id ID câu hỏi
   * @param data Dữ liệu cập nhật
   * @returns Câu hỏi đã cập nhật
   */
  updateQuestion: async (id: string, data: IUpdateQuestionRequest): Promise<IQuestion> => {
    return apiClient.put<IQuestion>(`/questions/${id}`, data);
  },

  /**
   * Xóa câu hỏi
   * @param id ID câu hỏi
   * @returns Response rỗng
   */
  deleteQuestion: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/questions/${id}`);
  },

  /**
   * Tìm kiếm câu hỏi
   * @param params Tham số tìm kiếm
   * @returns Danh sách câu hỏi
   */
  searchQuestions: async (params: IQuestionFilterParams): Promise<IQuestionListResponse> => {
    return apiClient.get<IQuestionListResponse>('/questions-search', { params });
  },

  /**
   * Tìm kiếm câu hỏi theo QuestionID
   * @param questionId QuestionID
   * @returns Câu hỏi
   */
  searchByQuestionId: async (questionId: string): Promise<IQuestion> => {
    return apiClient.get<IQuestion>(`/questions-search/by-id/${questionId}`);
  },

  /**
   * Tìm kiếm câu hỏi theo tag
   * @param tagId ID tag
   * @param params Tham số tìm kiếm
   * @returns Danh sách câu hỏi
   */
  searchByTag: async (tagId: string, params?: IQuestionFilterParams): Promise<IQuestionListResponse> => {
    return apiClient.get<IQuestionListResponse>(`/questions-search/by-tag/${tagId}`, { params });
  },

  /**
   * Tìm kiếm câu hỏi theo metadata
   * @param params Tham số tìm kiếm
   * @returns Danh sách câu hỏi
   */
  searchByMetadata: async (params: IQuestionFilterParams): Promise<IQuestionListResponse> => {
    return apiClient.get<IQuestionListResponse>('/questions-search/by-metadata', { params });
  },

  /**
   * Cập nhật trạng thái câu hỏi
   * @param id ID câu hỏi
   * @param status Trạng thái mới
   * @returns Câu hỏi đã cập nhật
   */
  updateQuestionStatus: async (id: string, status: string): Promise<IQuestion> => {
    return apiClient.put<IQuestion>(`/questions/${id}/status`, { status });
  },

  /**
   * Lấy câu hỏi theo Subcount
   * @param subcount Subcount của câu hỏi
   * @returns Câu hỏi
   */
  getQuestionBySubcount: async (subcount: string): Promise<{ item: any }> => {
    try {
      console.log('Gọi API lấy câu hỏi theo Subcount:', subcount);
      const response = await apiClient.get<{ item: any }>(`/questions/by-subcount/${subcount}`);
      console.log('Phản hồi từ API:', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy câu hỏi theo Subcount:', error);
      throw error;
    }
  },
};

export default questionService;
