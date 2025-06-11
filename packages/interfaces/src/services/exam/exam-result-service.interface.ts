import { ExamFilterDto } from '@project/dto';

/**
 * Interface định nghĩa các phương thức cho service quản lý kết quả bài thi
 */
export interface IExamResultService {
  /**
   * Lấy tất cả kết quả bài thi với phân trang và lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách kết quả bài thi đã phân trang
   */
  getAllResults(filters: ExamFilterDto): Promise<{ examResults: unknown[]; total: number }>;

  /**
   * Lấy thông tin chi tiết kết quả bài thi theo ID
   * @param id ID của kết quả bài thi
   * @returns Kết quả bài thi nếu tìm thấy
   */
  getResultById(id: string): Promise<unknown>;

  /**
   * Lấy kết quả bài thi theo người dùng
   * @param userId ID của người dùng
   * @returns Danh sách kết quả bài thi
   */
  getResultsByUser(userId: string): Promise<unknown[]>;

  /**
   * Lấy kết quả bài thi theo bài thi
   * @param examId ID của bài thi
   * @returns Danh sách kết quả bài thi
   */
  getResultsByExam(examId: string): Promise<unknown[]>;

  /**
   * Tạo kết quả bài thi mới
   * @param resultData Dữ liệu kết quả bài thi
   * @returns Kết quả bài thi đã tạo
   */
  createResult(resultData: unknown): Promise<unknown>;

  /**
   * Cập nhật kết quả bài thi
   * @param id ID của kết quả bài thi
   * @param resultData Dữ liệu cập nhật
   * @returns Kết quả bài thi đã cập nhật
   */
  updateResult(id: string, resultData: unknown): Promise<unknown>;

  /**
   * Xóa kết quả bài thi
   * @param id ID của kết quả bài thi
   * @returns Kết quả xóa (true/false)
   */
  deleteResult(id: string): Promise<boolean>;

  /**
   * Tính điểm trung bình cho một bài thi
   * @param examId ID của bài thi
   * @returns Điểm trung bình
   */
  calculateAverageScore(examId: string): Promise<number>;

  /**
   * Đếm số lượng người đã làm bài thi
   * @param examId ID của bài thi
   * @returns Số lượng người làm
   */
  countAttempts(examId: string): Promise<number>;

  /**
   * Bắt đầu làm bài thi mới
   * @param userId ID của người dùng
   * @param examId ID của bài thi
   * @returns Phiên làm bài mới
   */
  startExamAttempt(userId: string, examId: string): Promise<unknown>;

  /**
   * Nộp bài thi và tính điểm
   * @param attemptId ID của lần làm bài
   * @param answers Câu trả lời của người dùng
   * @returns Kết quả bài thi
   */
  submitExamAttempt(attemptId: string, answers: unknown): Promise<unknown>;

  /**
   * Lấy hiệu suất làm bài của người dùng
   * @param userId ID của người dùng
   * @param examId ID của bài thi
   * @returns Thống kê hiệu suất
   */
  getUserPerformance(userId: string, examId: string): Promise<unknown>;
} 