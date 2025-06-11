/**
 * Interface định nghĩa dữ liệu ảnh câu hỏi
 */
export interface QuestionImageData {
  id?: string;
  questionId: string;
  versionId?: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  description?: string;
  position?: number;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Interface cho repository QuestionImage
 */
export interface IQuestionImageRepository {
  /**
   * Tìm ảnh câu hỏi theo ID
   * @param id ID của ảnh
   * @returns Promise với ảnh câu hỏi hoặc null
   */
  findById(id: string): Promise<QuestionImageData | null>;

  /**
   * Tìm tất cả ảnh của một câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Promise với danh sách ảnh
   */
  findAllByQuestionId(questionId: string): Promise<QuestionImageData[]>;

  /**
   * Tìm tất cả hình ảnh của một phiên bản câu hỏi
   * @param versionId ID của phiên bản câu hỏi
   * @returns Promise với danh sách hình ảnh
   */
  findAllByVersionId(versionId: string): Promise<QuestionImageData[]>;

  /**
   * Tạo ảnh mới cho câu hỏi
   * @param data Dữ liệu ảnh mới
   * @returns Promise với ảnh đã tạo
   */
  create(data: QuestionImageData): Promise<QuestionImageData>;

  /**
   * Cập nhật ảnh câu hỏi
   * @param id ID của ảnh
   * @param data Dữ liệu cần cập nhật
   * @returns Promise với ảnh đã cập nhật
   */
  update(id: string, data: Partial<QuestionImageData>): Promise<QuestionImageData>;

  /**
   * Xóa ảnh câu hỏi
   * @param id ID của ảnh
   * @returns Promise với boolean xác nhận đã xóa
   */
  delete(id: string): Promise<boolean>;

  /**
   * Kiểm tra sự tồn tại của hình ảnh
   * @param id ID của hình ảnh
   * @returns Promise boolean chỉ ra hình ảnh có tồn tại hay không
   */
  exists(id: string): Promise<boolean>;
}