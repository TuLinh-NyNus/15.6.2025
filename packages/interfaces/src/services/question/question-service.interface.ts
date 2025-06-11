/**
 * Interface cho Question Service - quản lý nghiệp vụ chính liên quan đến câu hỏi
 */
import {
  QuestionResponseDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFilterDto
} from '@project/dto';

export interface IQuestionService {
  /**
   * Tìm tất cả câu hỏi theo bộ lọc
   * @param filter Tham số lọc câu hỏi (phân trang, sắp xếp, ...)
   */
  findAll(filter: QuestionFilterDto): Promise<{
    items: QuestionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Tìm câu hỏi theo ID
   * @param id ID của câu hỏi
   */
  findById(id: string): Promise<QuestionResponseDto>;

  /**
   * Tạo câu hỏi mới
   * @param data Dữ liệu câu hỏi
   */
  create(data: CreateQuestionDto): Promise<QuestionResponseDto>;

  /**
   * Cập nhật câu hỏi
   * @param id ID của câu hỏi
   * @param data Dữ liệu cập nhật
   */
  update(id: string, data: UpdateQuestionDto): Promise<QuestionResponseDto>;

  /**
   * Xóa câu hỏi
   * @param id ID của câu hỏi
   */
  delete(id: string): Promise<boolean>;

  /**
   * Tìm câu hỏi theo QuestionID
   * @param questionId QuestionID của câu hỏi (định dạng [XXXXX-X])
   */
  findByQuestionId(questionId: string): Promise<QuestionResponseDto>;

  /**
   * Tìm câu hỏi theo Subcount
   * @param subcount Subcount của câu hỏi (định dạng [XX.N])
   */
  findBySubcount(subcount: string): Promise<QuestionResponseDto>;

  /**
   * Lấy nội dung LaTex gốc của câu hỏi
   * @param id ID của câu hỏi
   */
  getRawContent(id: string): Promise<string>;

  /**
   * Cập nhật nội dung LaTex gốc và xử lý lại câu hỏi
   * @param id ID của câu hỏi
   * @param rawContent Nội dung LaTex gốc mới
   */
  updateRawContent(id: string, rawContent: string): Promise<QuestionResponseDto>;

  /**
   * Đánh dấu câu hỏi đã được sử dụng (tăng usage count)
   * @param id ID của câu hỏi
   */
  markAsUsed(id: string): Promise<void>;

  /**
   * Thêm tag cho câu hỏi
   * @param id ID của câu hỏi
   * @param tagIds Danh sách ID của các tag
   */
  addTags(id: string, tagIds: string[]): Promise<QuestionResponseDto>;

  /**
   * Xóa tag khỏi câu hỏi
   * @param id ID của câu hỏi
   * @param tagIds Danh sách ID của các tag cần xóa
   */
  removeTags(id: string, tagIds: string[]): Promise<QuestionResponseDto>;
}