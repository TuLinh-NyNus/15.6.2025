import { ExamFilterDto } from '@project/dto';

/**
 * Interface định nghĩa các phương thức cho repository quản lý kết quả bài thi
 */
export interface IExamResultRepository {
  /**
   * Tìm kiếm tất cả kết quả bài thi với bộ lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách kết quả bài thi đã phân trang
   */
  findAll(filters: ExamFilterDto): Promise<{ examResults: unknown[]; total: number }>;

  /**
   * Tìm kết quả bài thi theo ID
   * @param id ID của kết quả bài thi
   * @returns Kết quả bài thi nếu tìm thấy, null nếu không
   */
  findById(id: string): Promise<unknown | null>;

  /**
   * Tìm kết quả bài thi theo người dùng
   * @param userId ID của người dùng
   * @returns Danh sách kết quả bài thi
   */
  findByUser(userId: string): Promise<unknown[]>;

  /**
   * Tìm kết quả bài thi theo bài thi
   * @param examId ID của bài thi
   * @returns Danh sách kết quả bài thi
   */
  findByExam(examId: string): Promise<unknown[]>;

  /**
   * Tạo kết quả bài thi mới
   * @param data Dữ liệu kết quả bài thi
   * @returns Kết quả bài thi đã tạo
   */
  create(data: unknown): Promise<unknown>;

  /**
   * Cập nhật kết quả bài thi
   * @param id ID của kết quả bài thi
   * @param data Dữ liệu cập nhật
   * @returns Kết quả bài thi đã cập nhật
   */
  update(id: string, data: unknown): Promise<unknown>;

  /**
   * Xóa kết quả bài thi
   * @param id ID của kết quả bài thi
   * @returns Kết quả xóa (true/false)
   */
  delete(id: string): Promise<boolean>;

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
} 