import { QuestionFilterDto } from '@project/dto';
import { QuestionStatus } from '@project/entities';
import { QuestionData } from './question-data.interface';

/**
 * Interface cho repository Question
 */
export interface IQuestionRepository {
  /**
   * Tìm tất cả câu hỏi với các tùy chọn lọc nâng cao
   * @param filters Tùy chọn tìm kiếm và lọc
   * @returns Promise với danh sách câu hỏi và tổng số
   */
  findAll(filters: QuestionFilterDto): Promise<{ questions: QuestionData[]; total: number }>;

  /**
   * Tìm câu hỏi theo ID
   * @param id ID của câu hỏi
   * @returns Promise với câu hỏi tìm thấy hoặc null
   */
  findById(id: string): Promise<QuestionData | null>;

  /**
   * Tìm câu hỏi bằng QuestionID (định dạng XXXXX-X)
   * @param questionId QuestionID cần tìm
   * @returns Promise với câu hỏi tìm thấy hoặc null
   */
  findByQuestionId(questionId: string): Promise<QuestionData | null>;

  /**
   * Tìm câu hỏi bằng Subcount (định dạng XX.N)
   * @param subcount Subcount cần tìm
   * @returns Promise với câu hỏi tìm thấy hoặc null
   */
  findBySubcount(subcount: string): Promise<QuestionData | null>;

  /**
   * Tìm câu hỏi có chứa các tags
   * @param tagIds Mảng IDs của các tag
   * @returns Promise với danh sách câu hỏi
   */
  findByTags(tagIds: string[]): Promise<QuestionData[]>;

  /**
   * Tạo câu hỏi mới
   * @param data Dữ liệu câu hỏi cần tạo
   * @returns Promise với câu hỏi đã tạo
   */
  create(data: QuestionData): Promise<QuestionData>;

  /**
   * Cập nhật câu hỏi
   * @param id ID của câu hỏi
   * @param data Dữ liệu cập nhật
   * @returns Promise với câu hỏi đã cập nhật
   */
  update(id: string, data: Partial<QuestionData>): Promise<QuestionData>;

  /**
   * Xóa câu hỏi
   * @param id ID của câu hỏi
   * @returns Promise với kết quả xóa (true/false)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Thêm tags cho câu hỏi
   * @param questionId ID của câu hỏi
   * @param tagIds Mảng IDs của các tag
   * @returns Promise với câu hỏi đã cập nhật
   */
  addTags(questionId: string, tagIds: string[]): Promise<QuestionData>;

  /**
   * Xóa tags khỏi câu hỏi
   * @param questionId ID của câu hỏi
   * @param tagIds Mảng IDs của các tag
   * @returns Promise với câu hỏi đã cập nhật
   */
  removeTags(questionId: string, tagIds: string[]): Promise<QuestionData>;

  /**
   * Cập nhật trạng thái câu hỏi
   * @param questionId ID của câu hỏi
   * @param status Trạng thái mới
   * @returns Promise với câu hỏi đã cập nhật
   */
  updateStatus(questionId: string, status: QuestionStatus): Promise<QuestionData>;

  /**
   * Tăng số lần sử dụng của câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Promise với câu hỏi đã cập nhật
   */
  incrementUsageCount(questionId: string): Promise<QuestionData>;

  /**
   * Tăng số lượng feedback cho câu hỏi
   * @param questionId ID của câu hỏi
   * @returns Promise với câu hỏi đã cập nhật
   */
  incrementFeedbackCount(questionId: string): Promise<QuestionData>;

  /**
   * Tìm kiếm câu hỏi theo văn bản
   * @param searchText Văn bản tìm kiếm
   * @returns Promise với danh sách câu hỏi
   */
  searchByText(searchText: string): Promise<QuestionData[]>;

  /**
   * Tìm câu hỏi theo người tạo
   * @param creatorId ID của người tạo
   * @returns Promise với danh sách câu hỏi
   */
  findByCreator(creatorId: string): Promise<QuestionData[]>;

  /**
   * Phân tích LaTeX và trích xuất thông tin câu hỏi
   * @param rawContent Nội dung LaTeX
   * @returns Promise với thông tin đã trích xuất
   */
  parseLatexContent(rawContent: string): Promise<Partial<QuestionData>>;
}
