/**
 * Interface cho Question Import Service - xử lý nhập câu hỏi từ các định dạng khác nhau
 */
import { ExamQuestionResponseDto } from '@project/dto';

export interface IQuestionImportService {
  /**
   * Nhập câu hỏi từ định dạng LaTeX
   * @param latexContent Nội dung LaTeX
   * @param creatorId ID của người tạo
   */
  importFromLatex(latexContent: string, creatorId: string): Promise<{
    success: ExamQuestionResponseDto[];
    errors: { content: string; error: string }[];
  }>;

  /**
   * Nhập nhiều câu hỏi từ file LaTeX
   * @param fileBuffer Buffer của file LaTeX
   * @param creatorId ID của người tạo
   */
  importFromLatexFile(fileBuffer: Buffer, creatorId: string): Promise<{
    success: ExamQuestionResponseDto[];
    errors: { content: string; error: string }[];
  }>;

  /**
   * Nhập câu hỏi từ file Excel
   * @param fileBuffer Buffer của file Excel
   * @param creatorId ID của người tạo
   */
  importFromExcel(fileBuffer: Buffer, creatorId: string): Promise<{
    success: ExamQuestionResponseDto[];
    errors: { row: number; error: string }[];
  }>;

  /**
   * Nhập câu hỏi từ file CSV
   * @param fileBuffer Buffer của file CSV
   * @param creatorId ID của người tạo
   */
  importFromCSV(fileBuffer: Buffer, creatorId: string): Promise<{
    success: ExamQuestionResponseDto[];
    errors: { row: number; error: string }[];
  }>;

  /**
   * Nhập câu hỏi hàng loạt từ thư mục
   * @param directoryPath Đường dẫn đến thư mục
   * @param creatorId ID của người tạo
   */
  batchImportFromDirectory(directoryPath: string, creatorId: string): Promise<{
    total: number;
    success: number;
    errors: { file: string; error: string }[];
  }>;

  /**
   * Xác thực file trước khi nhập
   * @param fileBuffer Buffer của file cần xác thực
   * @param fileType Loại file (latex, excel, csv)
   */
  validateImportFile(fileBuffer: Buffer, fileType: 'latex' | 'excel' | 'csv'): Promise<{
    isValid: boolean;
    errors: string[];
    preview?: {
      totalQuestions: number;
      sampleQuestions: {
        content: string;
        type: string;
        questionId?: string;
        subcount?: string;
      }[];
    };
  }>;

  /**
   * Tạo mẫu file Excel để nhập câu hỏi
   */
  generateExcelTemplate(): Promise<Buffer>;

  /**
   * Tạo mẫu file CSV để nhập câu hỏi
   */
  generateCSVTemplate(): Promise<string>;

  /**
   * Tạo mẫu file LaTeX để nhập câu hỏi
   */
  generateLatexTemplate(): Promise<string>;
}