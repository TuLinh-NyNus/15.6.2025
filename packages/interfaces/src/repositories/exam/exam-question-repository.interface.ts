import { ExamFilterDto } from '@project/dto';

/**
 * Interface định nghĩa các phương thức cho repository quản lý câu hỏi bài thi
 */
export interface IExamQuestionRepository {
  /**
   * Tìm kiếm tất cả câu hỏi bài thi với bộ lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách câu hỏi bài thi đã phân trang
   */
  findAll(filters: ExamFilterDto): Promise<{ examQuestions: unknown[]; total: number }>;

  /**
   * Tìm câu hỏi bài thi theo ID
   * @param id ID của câu hỏi bài thi
   * @returns Câu hỏi bài thi nếu tìm thấy, null nếu không
   */
  findById(id: number): Promise<unknown | null>;

  /**
   * Tìm câu hỏi bài thi theo nhiều ID
   * @param ids Danh sách ID của câu hỏi bài thi
   * @returns Danh sách câu hỏi bài thi
   */
  findByIds(ids: number[]): Promise<unknown[]>;

  /**
   * Tìm câu hỏi bài thi theo môn học
   * @param subject Môn học
   * @returns Danh sách câu hỏi bài thi
   */
  findBySubject(subject: string): Promise<unknown[]>;

  /**
   * Tìm câu hỏi bài thi theo độ khó
   * @param difficultyLevel Độ khó
   * @returns Danh sách câu hỏi bài thi
   */
  findByDifficulty(difficultyLevel: string): Promise<unknown[]>;

  /**
   * Tìm câu hỏi bài thi theo khối lớp
   * @param grade Khối lớp
   * @returns Danh sách câu hỏi bài thi
   */
  findByGrade(grade: number): Promise<unknown[]>;

  /**
   * Tạo câu hỏi bài thi mới
   * @param data Dữ liệu câu hỏi bài thi
   * @returns Câu hỏi bài thi đã tạo
   */
  create(data: unknown): Promise<unknown>;

  /**
   * Tạo nhiều câu hỏi bài thi mới
   * @param data Danh sách dữ liệu câu hỏi bài thi
   * @returns Danh sách câu hỏi bài thi đã tạo
   */
  createMany(data: unknown[]): Promise<unknown[]>;

  /**
   * Cập nhật câu hỏi bài thi
   * @param id ID của câu hỏi bài thi
   * @param data Dữ liệu cập nhật
   * @returns Câu hỏi bài thi đã cập nhật
   */
  update(id: number, data: unknown): Promise<unknown>;

  /**
   * Xóa câu hỏi bài thi
   * @param id ID của câu hỏi bài thi
   * @returns Kết quả xóa (true/false)
   */
  delete(id: number): Promise<boolean>;

  /**
   * Tìm câu hỏi bài thi theo tags
   * @param tags Danh sách tags
   * @returns Danh sách câu hỏi bài thi
   */
  findByTags(tags: string[]): Promise<unknown[]>;

  /**
   * Tìm câu hỏi bài thi theo ID của câu hỏi gốc từ ngân hàng câu hỏi
   * @param sourceQuestionId ID của câu hỏi gốc từ ngân hàng
   * @returns Danh sách câu hỏi bài thi liên kết với câu hỏi này
   */
  findBySourceQuestionId(sourceQuestionId: string): Promise<unknown[]>;

  /**
   * Lấy tất cả câu hỏi bài thi có tham chiếu đến câu hỏi từ ngân hàng
   * @returns Danh sách câu hỏi bài thi có nguồn gốc từ ngân hàng câu hỏi
   */
  findAllWithSourceQuestionId(): Promise<unknown[]>;
} 