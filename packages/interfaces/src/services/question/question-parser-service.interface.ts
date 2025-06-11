/**
 * Interface cho Question Parser Service - xử lý và phân tích cú pháp LaTeX
 */
export interface IQuestionParserService {
  /**
   * Phân tích nội dung LaTeX thành đối tượng Question
   * @param rawContent Nội dung LaTeX gốc
   */
  parseQuestion(rawContent: string): Promise<{
    type: string;
    content: string;
    correctAnswer: string | string[];
    questionId?: string;
    subcount?: { prefix: string; number: string; fullId: string };
    sources?: string[];
    solutions?: string[];
    answers?: string[];
  }>;

  /**
   * Trích xuất QuestionID từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  extractQuestionId(rawContent: string): Promise<string | null>;

  /**
   * Trích xuất Subcount từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  extractSubcount(rawContent: string): Promise<{ prefix: string; number: string; fullId: string } | null>;

  /**
   * Trích xuất nội dung câu hỏi từ LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  extractContent(rawContent: string): Promise<string>;

  /**
   * Trích xuất lời giải từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  extractSolution(rawContent: string): Promise<string | null>;

  /**
   * Xác định loại câu hỏi (MC, TF, SA, ES) từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  identifyQuestionType(rawContent: string): Promise<string>;

  /**
   * Trích xuất danh sách đáp án từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  extractAnswers(rawContent: string): Promise<string[]>;

  /**
   * Trích xuất đáp án đúng từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  extractCorrectAnswers(rawContent: string): Promise<string | string[]>;

  /**
   * Xác thực cú pháp LaTeX
   * @param rawContent Nội dung LaTeX cần xác thực
   */
  validateSyntax(rawContent: string): Promise<{ isValid: boolean; errors: string[] }>;

  /**
   * Xác thực cấu trúc câu hỏi
   * @param rawContent Nội dung LaTeX cần xác thực
   */
  validateQuestionStructure(rawContent: string): Promise<{ isValid: boolean; errors: string[] }>;

  /**
   * Đề xuất sửa lỗi cú pháp
   * @param rawContent Nội dung LaTeX có lỗi
   */
  suggestCorrections(rawContent: string): Promise<{ original: string; suggested: string; explanation: string }[]>;

  /**
   * Chuyển đổi LaTeX sang HTML để hiển thị
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  renderToHTML(rawContent: string): Promise<string>;

  /**
   * Chuyển đổi LaTeX sang văn bản thuần túy
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  renderToPlainText(rawContent: string): Promise<string>;
} 