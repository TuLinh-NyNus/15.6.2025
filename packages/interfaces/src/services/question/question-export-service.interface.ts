/**
 * Interface cho Question Export Service - xử lý xuất câu hỏi ra các định dạng khác nhau
 */
import { QuestionFilterDto } from '@project/dto';

export interface IQuestionExportService {
  /**
   * Xuất câu hỏi sang định dạng LaTeX
   * @param questionId ID của câu hỏi
   */
  exportToLatex(questionId: string): Promise<{
    content: string;
    filename: string;
  }>;

  /**
   * Xuất nhiều câu hỏi sang định dạng LaTeX
   * @param questionIds Danh sách ID của các câu hỏi
   */
  exportMultipleToLatex(questionIds: string[]): Promise<{
    content: string;
    filename: string;
  }>;

  /**
   * Xuất câu hỏi sang định dạng PDF
   * @param questionId ID của câu hỏi
   */
  exportToPDF(questionId: string): Promise<{
    buffer: Buffer;
    filename: string;
  }>;

  /**
   * Xuất nhiều câu hỏi sang định dạng PDF
   * @param questionIds Danh sách ID của các câu hỏi
   */
  exportMultipleToPDF(questionIds: string[]): Promise<{
    buffer: Buffer;
    filename: string;
  }>;

  /**
   * Xuất câu hỏi sang định dạng Excel
   * @param filter Bộ lọc để chọn câu hỏi xuất
   */
  exportToExcel(filter: QuestionFilterDto): Promise<{
    buffer: Buffer;
    filename: string;
  }>;

  /**
   * Xuất câu hỏi sang định dạng CSV
   * @param filter Bộ lọc để chọn câu hỏi xuất
   */
  exportToCSV(filter: QuestionFilterDto): Promise<{
    content: string;
    filename: string;
  }>;

  /**
   * Xuất câu hỏi sang định dạng HTML
   * @param questionId ID của câu hỏi
   */
  exportToHTML(questionId: string): Promise<{
    content: string;
    filename: string;
  }>;

  /**
   * Xuất câu hỏi thành hình ảnh
   * @param questionId ID của câu hỏi
   */
  exportToImage(questionId: string): Promise<{
    buffer: Buffer;
    filename: string;
  }>;

  /**
   * Xuất toàn bộ ngân hàng câu hỏi
   * @param format Định dạng xuất (latex, pdf, excel, csv)
   * @param filter Bộ lọc để chọn câu hỏi xuất
   */
  exportQuestionBank(
    format: 'latex' | 'pdf' | 'excel' | 'csv',
    filter?: QuestionFilterDto
  ): Promise<{
    buffer?: Buffer;
    content?: string;
    filename: string;
  }>;
}