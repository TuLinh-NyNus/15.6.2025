/**
 * Interface định nghĩa dữ liệu tag câu hỏi
 */
export interface QuestionTagData {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Interface cho repository QuestionTag
 */
export interface IQuestionTagRepository {
  /**
   * Tìm tag câu hỏi theo ID
   * @param id ID của tag
   * @returns Promise với tag câu hỏi hoặc null
   */
  findById(id: string): Promise<QuestionTagData | null>;

  /**
   * Tìm tất cả tag của một câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Promise với danh sách tag
   */
  findAllByQuestionId(questionId: string): Promise<QuestionTagData[]>;

  /**
   * Tìm tag theo tên
   * @param name Tên tag cần tìm
   * @returns Promise với tag tìm thấy hoặc null
   */
  findByName(name: string): Promise<QuestionTagData | null>;

  /**
   * Tạo mới tag
   * @param data Dữ liệu tag mới
   * @returns Promise với tag đã tạo
   */
  create(data: QuestionTagData): Promise<QuestionTagData>;

  /**
   * Cập nhật tag
   * @param id ID của tag
   * @param data Dữ liệu cần cập nhật
   * @returns Promise với tag đã cập nhật
   */
  update(id: string, data: Partial<QuestionTagData>): Promise<QuestionTagData>;

  /**
   * Xóa tag
   * @param id ID của tag
   * @returns Promise với boolean xác nhận đã xóa
   */
  delete(id: string): Promise<boolean>;

  /**
   * Tìm hoặc tạo tag nếu chưa tồn tại
   * @param name Tên tag
   * @returns Promise với tag tìm thấy hoặc đã tạo mới
   */
  findOrCreate(name: string): Promise<QuestionTagData>;
} 