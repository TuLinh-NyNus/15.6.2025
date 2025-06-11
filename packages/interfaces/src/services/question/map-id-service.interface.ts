/**
 * Interface cho MapID Service - quản lý phân cấp ID của câu hỏi
 */
export interface IMapIDService {
  /**
   * Phân giải QuestionID thành các thành phần
   * @param questionId QuestionID cần phân giải (định dạng [XXXXX-X] hoặc [XXXXX])
   * @returns Object chứa các thành phần của QuestionID
   */
  parseQuestionId(questionId: string): Promise<{
    grade?: string;           // Lớp (tham số 1)
    subject?: string;         // Môn (tham số 2)
    chapter?: string;         // Chương (tham số 3)
    level?: string;           // Mức độ (tham số 4)
    lesson?: string;          // Bài (tham số 5)
    form?: string;            // Dạng (tham số 6, chỉ có trong ID6)
    isID6: boolean;           // Có phải là ID6 không
    original: string;         // QuestionID gốc
  }>;

  /**
   * Tạo QuestionID từ các thành phần
   * @param components Các thành phần của QuestionID
   * @returns QuestionID được tạo
   */
  generateQuestionId(components: {
    grade?: string;           // Lớp (tham số 1)
    subject?: string;         // Môn (tham số 2)
    chapter?: string;         // Chương (tham số 3)
    level?: string;           // Mức độ (tham số 4)
    lesson?: string;          // Bài (tham số 5)
    form?: string;            // Dạng (tham số 6, chỉ có trong ID6)
  }): Promise<string>;

  /**
   * Validate QuestionID
   * @param questionId QuestionID cần kiểm tra
   * @returns Kết quả validation và danh sách lỗi
   */
  validateQuestionId(questionId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }>;

  /**
   * Lấy mô tả đầy đủ của QuestionID
   * @param questionId QuestionID cần lấy mô tả
   * @returns Object chứa mô tả đầy đủ của QuestionID
   */
  getQuestionIdDescription(questionId: string): Promise<{
    grade?: { value: string; description: string };
    subject?: { value: string; description: string };
    chapter?: { value: string; description: string };
    level?: { value: string; description: string };
    lesson?: { value: string; description: string };
    form?: { value: string; description: string };
    fullDescription: string;
  }>;

  /**
   * Lấy cấu trúc MapID
   * @returns Cấu trúc phân cấp MapID
   */
  getMapIdStructure(): Promise<{
    grade: Record<string, string>;
    subject: Record<string, string>;
    chapter: Record<string, string>;
    lesson: Record<string, string>;
    form: Record<string, string>;
    level: Record<string, string>;
  }>;
} 