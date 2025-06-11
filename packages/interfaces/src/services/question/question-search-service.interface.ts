/**
 * Interface cho Question Search Service - xử lý tìm kiếm nâng cao cho câu hỏi
 */
import { QuestionResponseDto, QuestionSearchDto } from '@project/dto';

export interface IQuestionSearchService {
  /**
   * Tìm kiếm câu hỏi nâng cao
   * @param searchParams Các tham số tìm kiếm
   */
  search(searchParams: QuestionSearchDto): Promise<{
    items: QuestionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Tìm kiếm câu hỏi theo QuestionID
   * @param questionId QuestionID cần tìm
   */
  searchByQuestionId(questionId: string): Promise<QuestionResponseDto[]>;

  /**
   * Tìm kiếm câu hỏi theo Subcount
   * @param subcount Subcount cần tìm
   */
  searchBySubcount(subcount: string): Promise<QuestionResponseDto[]>;

  /**
   * Tìm kiếm câu hỏi theo tags
   * @param tagIds Danh sách ID của các tag
   * @param page Trang hiện tại
   * @param limit Số lượng kết quả mỗi trang
   */
  searchByTags(tagIds: string[], page?: number, limit?: number): Promise<{
    items: QuestionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Tìm kiếm câu hỏi theo loại
   * @param type Loại câu hỏi (MC, TF, SA, ES)
   * @param page Trang hiện tại
   * @param limit Số lượng kết quả mỗi trang
   */
  searchByType(type: string, page?: number, limit?: number): Promise<{
    items: QuestionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Tìm kiếm câu hỏi theo nội dung
   * @param contentQuery Nội dung cần tìm
   * @param page Trang hiện tại
   * @param limit Số lượng kết quả mỗi trang
   */
  searchByContent(contentQuery: string, page?: number, limit?: number): Promise<{
    items: QuestionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Tìm kiếm câu hỏi theo thông số trong QuestionID
   * @param grade Lớp (tham số 1)
   * @param subject Môn (tham số 2)
   * @param chapter Chương (tham số 3)
   * @param level Mức độ (tham số 4)
   * @param lesson Bài (tham số 5)
   * @param form Dạng (tham số 6)
   * @param page Trang hiện tại
   * @param limit Số lượng kết quả mỗi trang
   */
  searchByMapIdParams(
    grade?: string,
    subject?: string,
    chapter?: string,
    level?: string,
    lesson?: string,
    form?: string,
    page?: number,
    limit?: number
  ): Promise<{
    items: QuestionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Đề xuất câu hỏi tương tự
   * @param questionId ID của câu hỏi gốc
   * @param limit Số lượng câu hỏi đề xuất
   */
  findSimilarQuestions(questionId: string, limit?: number): Promise<QuestionResponseDto[]>;

  /**
   * Lấy danh sách các câu hỏi được sử dụng nhiều nhất
   * @param limit Số lượng câu hỏi cần lấy
   */
  getMostUsedQuestions(limit?: number): Promise<QuestionResponseDto[]>;

  /**
   * Lấy danh sách câu hỏi mới nhất
   * @param limit Số lượng câu hỏi cần lấy
   */
  getRecentQuestions(limit?: number): Promise<QuestionResponseDto[]>;
}