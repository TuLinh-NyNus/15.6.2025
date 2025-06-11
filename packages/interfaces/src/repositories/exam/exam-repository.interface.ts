import { ExamFilterDto } from '@project/dto';
import { Exam } from '@project/entities';

/**
 * Interface định nghĩa các phương thức cho repository quản lý bài thi
 */
export interface IExamRepository {
  /**
   * Tìm kiếm tất cả bài thi với bộ lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách bài thi đã phân trang
   */
  findAll(filters: ExamFilterDto): Promise<{ exams: Exam[]; total: number }>;

  /**
   * Tìm bài thi theo ID
   * @param id ID của bài thi
   * @returns Bài thi nếu tìm thấy, null nếu không
   */
  findById(id: string): Promise<Exam | null>;

  /**
   * Tìm bài thi theo người tạo
   * @param creatorId ID của người tạo
   * @returns Danh sách bài thi
   */
  findByCreator(creatorId: string): Promise<Exam[]>;

  /**
   * Tìm bài thi theo môn học
   * @param subject Tên môn học
   * @returns Danh sách bài thi
   */
  findBySubject(subject: string): Promise<Exam[]>;

  /**
   * Tìm bài thi theo khối lớp
   * @param grade Khối lớp
   * @returns Danh sách bài thi
   */
  findByGrade(grade: number): Promise<Exam[]>;

  /**
   * Tạo bài thi mới
   * @param data Dữ liệu bài thi
   * @returns Bài thi đã tạo
   */
  create(data: Partial<Exam>): Promise<Exam>;

  /**
   * Cập nhật bài thi
   * @param id ID của bài thi
   * @param data Dữ liệu cập nhật
   * @returns Bài thi đã cập nhật
   */
  update(id: string, data: Partial<Exam>): Promise<Exam>;

  /**
   * Xóa bài thi
   * @param id ID của bài thi
   * @returns Kết quả xóa (true/false)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cập nhật điểm trung bình cho bài thi
   * @param id ID của bài thi
   * @param score Điểm trung bình mới
   * @returns Bài thi đã cập nhật
   */
  updateAverageScore(id: string, score: number): Promise<Exam>;
}
