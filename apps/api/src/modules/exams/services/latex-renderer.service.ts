import { Injectable, Logger } from '@nestjs/common';
import { getErrorMessage } from '../../../utils/error-handler';
import { IQuestionRendererService } from '@project/interfaces';
import { LaTeXParserService } from './latex-parser.service';
import * as puppeteer from 'puppeteer';

/**
 * Service chuyển đổi và hiển thị câu hỏi LaTeX
 */
@Injectable()
export class LaTeXRendererService implements IQuestionRendererService {
  private readonly logger = new Logger(LaTeXRendererService.name);

  constructor(private readonly latexParserService: LaTeXParserService) {}

  /**
   * Chuyển đổi LaTeX sang HTML để hiển thị
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  async renderToHTML(rawContent: string): Promise<string> {
    try {
      // Sử dụng LaTeXParserService để trích xuất thông tin
      const content = await this.latexParserService.extractContent(rawContent);
      const type = await this.latexParserService.identifyQuestionType(rawContent);
      const answers = await this.latexParserService.extractAnswers(rawContent);
      const correctAnswers = await this.latexParserService.extractCorrectAnswers(rawContent);
      const solution = await this.latexParserService.extractSolution(rawContent);
      const questionId = await this.latexParserService.extractQuestionId(rawContent);
      const subcount = await this.latexParserService.extractSubcount(rawContent);

      // Xây dựng HTML với CSS cơ bản để hiển thị đẹp
      let html = `
      <div class="latex-question">
        <div class="question-header">
          ${questionId ? `<div class="question-id">ID: ${questionId}</div>` : ''}
          ${subcount ? `<div class="question-subcount">Subcount: ${subcount.fullId}</div>` : ''}
        </div>
        <div class="question-content">${this.formatMathContent(content)}</div>
      `;

      // Hiển thị đáp án tùy theo loại câu hỏi
      if (answers && answers.length > 0) {
        html += '<div class="question-answers">';

        answers.forEach((answer, index) => {
          const isCorrect =
            Array.isArray(correctAnswers)
              ? correctAnswers.includes(answer)
              : correctAnswers === answer;

          html += `
            <div class="answer-item ${isCorrect ? 'correct-answer' : ''}">
              <span class="answer-label">${String.fromCharCode(65 + index)}.</span>
              <span class="answer-content">${this.formatMathContent(answer)}</span>
              ${isCorrect ? '<span class="correct-marker">✓</span>' : ''}
            </div>
          `;
        });

        html += '</div>';
      } else if (type === 'SA') {
        html += `
          <div class="short-answer">
            <div class="answer-label">Đáp án:</div>
            <div class="answer-content">${this.formatMathContent(correctAnswers as string)}</div>
          </div>
        `;
      }

      // Thêm lời giải nếu có
      if (solution) {
        html += `
          <div class="solution-section">
            <div class="solution-header">Lời giải:</div>
            <div class="solution-content">${this.formatMathContent(solution)}</div>
          </div>
        `;
      }

      html += '</div>';

      // Thêm CSS để định dạng
      const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LaTeX Question Renderer</title>
        <style>
          .latex-question {
            font-family: 'Arial', sans-serif;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
          }
          .question-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 0.9em;
            color: #666;
          }
          .question-content {
            margin-bottom: 15px;
            font-size: 1.1em;
            line-height: 1.5;
          }
          .question-answers {
            margin-bottom: 15px;
          }
          .answer-item {
            padding: 8px;
            margin-bottom: 5px;
            border-radius: 4px;
            display: flex;
            align-items: flex-start;
          }
          .correct-answer {
            background-color: #e6f7e6;
          }
          .answer-label {
            font-weight: bold;
            margin-right: 10px;
            min-width: 20px;
          }
          .answer-content {
            flex: 1;
          }
          .correct-marker {
            color: #2e7d32;
            margin-left: 10px;
          }
          .short-answer {
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
            margin-bottom: 15px;
          }
          .solution-section {
            margin-top: 15px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
          }
          .solution-header {
            font-weight: bold;
            margin-bottom: 5px;
          }
          body {
            padding: 20px;
            background-color: #f9f9f9;
            font-family: 'Arial', sans-serif;
          }
        </style>
        <!-- Thêm KaTeX để hiển thị công thức toán học -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" integrity="sha384-3UiQGuEI4TTMaFmGIZumfRPtfKQ3trwQE2JgosJxCnGmQpL/lJdjpcHkaaFwHlcI" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js" integrity="sha384-oRl6SyP9mF6+AjBzXZo5n5aohKiuSZJNfzCzh0mBPqEiGQyHPXU9fut4t9DZ9vJQ" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous"
            onload="renderMathInElement(document.body);"></script>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.body, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true}
              ],
              throwOnError: false
            });
          });
        </script>
      </head>
      <body>
        ${html}
      </body>
      </html>
      `;

      return fullHtml;
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Lỗi không xác định';
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang HTML: ${errorMessage}`);
      return `<div class="error">Không thể chuyển đổi LaTeX sang HTML: ${errorMessage}</div>`;
    }
  }

  /**
   * Xử lý nội dung LaTeX để hiển thị công thức toán học
   * @param content Nội dung cần xử lý
   * @private
   */
  private formatMathContent(content: string): string {
    if (!content) return '';

    // Đảm bảo an toàn với XSS
    let safeContent = this.escapeHTML(content);

    // Chuyển đổi các công thức LaTeX phổ biến sang định dạng KaTeX
    // 1. Chuyển \\begin{...} và \\end{...} thành $$\begin{...} và \end{...}$$
    safeContent = safeContent.replace(/\\begin\{(equation|align|gather|cases)\}/g, '$$\\begin{$1}');
    safeContent = safeContent.replace(/\\end\{(equation|align|gather|cases)\}/g, '\\end{$1}$$');

    // 2. Giữ nguyên $ để KaTeX nhận diện công thức inline
    // KaTeX sẽ tự động xử lý các ký hiệu $ thông qua auto-render

    // 3. Chuyển các môi trường ex (đã loại bỏ) thành đoạn văn bản thông thường
    safeContent = safeContent.replace(/\\begin\{ex\}|\\end\{ex\}/g, '');

    // 4. Xử lý các lệnh LaTeX đặc biệt
    safeContent = safeContent.replace(/\\overrightarrow\{([^{}]*)\}/g, '\\vec{$1}');
    safeContent = safeContent.replace(/\\dfrac/g, '\\frac'); // KaTeX tự động xử lý kích thước phân số

    // 5. Xử lý các lệnh đặc biệt như \heva và \hoac
    safeContent = safeContent.replace(/\\heva\{([^{}]*)\}/g, '\\{$1\\}');
    safeContent = safeContent.replace(/\\hoac\{([^{}]*)\}/g, '\\[$1\\]');

    // 6. Xử lý các lệnh đặc biệt như \True và \choice
    safeContent = safeContent.replace(/\\True/g, '<span class="correct-answer-mark">✓</span>');
    safeContent = safeContent.replace(/\\choice/g, '<div class="choice-container">');
    safeContent = safeContent.replace(/\\choiceTF/g, '<div class="choice-tf-container">');

    // 7. Xử lý các dấu xuống dòng
    safeContent = safeContent.replace(/\\\\/g, '<br/>');

    return safeContent;
  }

  /**
   * Chuyển đổi LaTeX sang văn bản thuần túy
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  async renderToPlainText(rawContent: string): Promise<string> {
    try {
      // Sử dụng LaTeXParserService để trích xuất thông tin
      const content = await this.latexParserService.extractContent(rawContent);
      const type = await this.latexParserService.identifyQuestionType(rawContent);
      const answers = await this.latexParserService.extractAnswers(rawContent);
      const correctAnswers = await this.latexParserService.extractCorrectAnswers(rawContent);
      const solution = await this.latexParserService.extractSolution(rawContent);
      const questionId = await this.latexParserService.extractQuestionId(rawContent);
      const subcount = await this.latexParserService.extractSubcount(rawContent);

      // Tạo văn bản thuần túy
      let text = '';

      // Thêm thông tin ID và Subcount nếu có
      if (questionId) text += `ID: ${questionId}\n`;
      if (subcount) text += `Subcount: ${subcount.fullId}\n`;
      if (questionId || subcount) text += '\n';

      // Thêm nội dung câu hỏi
      text += `${content}\n\n`;

      // Thêm đáp án tùy theo loại câu hỏi
      if (answers && answers.length > 0) {
        answers.forEach((answer, index) => {
          const isCorrect =
            Array.isArray(correctAnswers)
              ? correctAnswers.includes(answer)
              : correctAnswers === answer;

          text += `${String.fromCharCode(65 + index)}. ${answer} ${isCorrect ? '(Đúng)' : ''}\n`;
        });
        text += '\n';
      } else if (type === 'SA') {
        text += `Đáp án: ${correctAnswers as string}\n\n`;
      }

      // Thêm lời giải nếu có
      if (solution) {
        text += `Lời giải:\n${solution}\n`;
      }

      return text;
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Lỗi không xác định';
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang văn bản thuần túy: ${errorMessage}`);
      return `Lỗi: Không thể chuyển đổi LaTeX sang văn bản thuần túy: ${errorMessage}`;
    }
  }

  /**
   * Chuyển đổi LaTeX sang PDF
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  async renderToPDF(rawContent: string): Promise<Buffer> {
    try {
      // Tạo HTML từ nội dung LaTeX
      const html = await this.renderToHTML(rawContent);

      // Sử dụng Puppeteer để tạo PDF từ HTML
      const browser = await puppeteer.launch({
        headless: true, // Sử dụng headless true thay vì "new"
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Tối ưu hóa định dạng PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      });

      await browser.close();

      return pdfBuffer as Buffer;
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Lỗi không xác định';
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang PDF: ${errorMessage}`);
      throw new Error(`Không thể chuyển đổi LaTeX sang PDF: ${errorMessage}`);
    }
  }

  /**
   * Escape HTML characters để tránh XSS
   * @param text Văn bản cần escape
   * @private
   */
  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
