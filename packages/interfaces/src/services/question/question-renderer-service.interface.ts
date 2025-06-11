/**
 * Interface cho Question Renderer Service - hiển thị câu hỏi LaTeX
 */
export interface IQuestionRendererService {
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

  /**
   * Chuyển đổi LaTeX sang PDF
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  renderToPDF(rawContent: string): Promise<Buffer>;
} 