import { ExamFilterDto, QuestionFilterDto } from '@project/dto';

/**
 * Interface định nghĩa các phương thức cho service quản lý câu hỏi bài thi
 */
export interface IExamQuestionService {
  /**
   * Lấy tất cả câu hỏi của một bài thi
   * @param examId ID của bài thi
   * @returns Danh sách câu hỏi của bài thi
   */
  getQuestionsByExamId(examId: string): Promise<unknown[]>;

  /**
   * Lấy thông tin chi tiết câu hỏi theo ID
   * @param id ID của câu hỏi
   * @returns Câu hỏi nếu tìm thấy
   */
  getQuestionById(id: number): Promise<unknown>;

  /**
   * Tạo câu hỏi mới cho bài thi
   * @param examId ID của bài thi
   * @param questionData Dữ liệu câu hỏi
   * @returns Câu hỏi đã tạo
   */
  createQuestion(examId: string, questionData: unknown): Promise<unknown>;

  /**
   * Tạo nhiều câu hỏi cùng lúc cho bài thi
   * @param examId ID của bài thi
   * @param questionsData Dữ liệu nhiều câu hỏi
   * @returns Danh sách câu hỏi đã tạo
   */
  createManyQuestions(examId: string, questionsData: unknown[]): Promise<unknown[]>;

  /**
   * Cập nhật câu hỏi
   * @param id ID của câu hỏi
   * @param questionData Dữ liệu cập nhật
   * @returns Câu hỏi đã cập nhật
   */
  updateQuestion(id: number, questionData: unknown): Promise<unknown>;

  /**
   * Xóa câu hỏi
   * @param id ID của câu hỏi
   * @returns Kết quả xóa (true/false)
   */
  deleteQuestion(id: number): Promise<boolean>;

  /**
   * Tìm câu hỏi theo độ khó
   * @param difficulty Độ khó
   * @param filters Bộ lọc bổ sung
   * @returns Danh sách câu hỏi
   */
  getQuestionsByDifficulty(difficulty: string, filters?: ExamFilterDto): Promise<unknown[]>;

  /**
   * Tìm câu hỏi theo môn học
   * @param subject Môn học
   * @param filters Bộ lọc bổ sung
   * @returns Danh sách câu hỏi
   */
  getQuestionsBySubject(subject: string, filters?: ExamFilterDto): Promise<unknown[]>;

  /**
   * Tìm câu hỏi theo tags
   * @param tags Danh sách tags
   * @param filters Bộ lọc bổ sung
   * @returns Danh sách câu hỏi
   */
  getQuestionsByTags(tags: string[], filters?: ExamFilterDto): Promise<unknown[]>;

  /**
   * Xáo trộn thứ tự các câu hỏi trong bài thi
   * @param examId ID của bài thi
   * @returns Danh sách câu hỏi đã xáo trộn
   */
  shuffleQuestions(examId: string): Promise<unknown[]>;

  /**
   * Liên kết câu hỏi từ ngân hàng câu hỏi vào bài thi
   * @param examId ID của bài thi
   * @param questionId ID của câu hỏi từ ngân hàng
   * @param score Điểm số cho câu hỏi này
   * @returns Câu hỏi bài thi đã tạo
   */
  linkQuestionToExam(examId: string, questionId: string, score: number): Promise<unknown>;

  /**
   * Nhập nhiều câu hỏi từ ngân hàng câu hỏi vào bài thi
   * @param examId ID của bài thi
   * @param filter Bộ lọc để chọn câu hỏi
   * @param score Điểm số cho mỗi câu hỏi
   * @returns Danh sách câu hỏi bài thi đã tạo
   */
  importQuestionsFromBank(examId: string, filter: QuestionFilterDto, score: number): Promise<unknown[]>;

  /**
   * Lấy danh sách bài thi chứa một câu hỏi cụ thể
   * @param questionId ID của câu hỏi từ ngân hàng
   * @returns Danh sách bài thi chứa câu hỏi
   */
  getExamsContainingQuestion(questionId: string): Promise<unknown[]>;

  /**
   * Lấy danh sách câu hỏi đã được sử dụng trong các bài thi
   * @param filter Bộ lọc tùy chọn
   * @returns Danh sách câu hỏi và số lần sử dụng
   */
  getQuestionsUsedInExams(filter?: QuestionFilterDto): Promise<{
    id: string;
    usageCount: number;
    exams: string[];
  }[]>;
}