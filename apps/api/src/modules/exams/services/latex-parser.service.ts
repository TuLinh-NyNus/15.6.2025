import { Injectable, Logger } from '@nestjs/common';
import { IQuestionParserService } from '@project/interfaces';
import { QuestionType } from '@project/entities';
import { BracketExtractor } from './packages/utils/bracket-extractor';
import {
  CHOICE_PATTERN,
  CHOICE_TF_PATTERN,
  ID_PATTERN,
  IMAGE_ENVIRONMENTS,
  SHORT_ANS_PATTERN,
  SOLUTION_PATTERN,
  SOURCE_PATTERN,
  SUBCOUNT_PATTERNS,
  TRUE_ANSWER_PATTERN
} from './packages/utils/latex-constants';

/**
 * Service xử lý và phân tích cú pháp LaTeX cho câu hỏi
 */
@Injectable()
export class LaTeXParserService implements IQuestionParserService {
  private readonly logger = new Logger(LaTeXParserService.name);

  /**
   * Phân tích nội dung LaTeX thành đối tượng Question
   * @param rawContent Nội dung LaTeX gốc
   */
  async parseQuestion(rawContent: string): Promise<{
    type: string;
    content: string;
    correctAnswer: string | string[];
    questionId?: string;
    subcount?: { prefix: string; number: string; fullId: string };
    sources?: string[];
    solutions?: string[];
    answers?: string[];
  }> {
    try {
      // Trích xuất QuestionID
      const questionId = await this.extractQuestionId(rawContent);

      // Trích xuất Subcount
      const subcount = await this.extractSubcount(rawContent);

      // Trích xuất nguồn
      const sources = await this.extractSources(rawContent);

      // Trích xuất nội dung
      const content = await this.extractContent(rawContent);

      // Trích xuất lời giải
      const solution = await this.extractSolution(rawContent);
      const solutions = solution ? [solution] : [];

      // Xác định loại câu hỏi
      const type = await this.identifyQuestionType(rawContent);

      // Trích xuất danh sách đáp án
      const answers = await this.extractAnswers(rawContent);

      // Trích xuất đáp án đúng
      const correctAnswer = await this.extractCorrectAnswers(rawContent);

      // Tạo đối tượng kết quả
      const result: {
        type: string;
        content: string;
        correctAnswer: string | string[];
        questionId?: string;
        subcount?: { prefix: string; number: string; fullId: string };
        sources?: string[];
        solutions?: string[];
        answers?: string[];
      } = {
        type,
        content,
        correctAnswer,
      };

      // Thêm các trường tùy chọn nếu có
      if (questionId) result.questionId = questionId;
      if (subcount) result.subcount = subcount;
      if (sources && sources.length > 0) result.sources = sources;
      if (solutions && solutions.length > 0) result.solutions = solutions;
      if (answers && answers.length > 0) result.answers = answers;

      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi phân tích nội dung LaTeX: ${error.message}`);
      throw new Error(`Không thể phân tích nội dung LaTeX: ${error.message}`);
    }
  }

  /**
   * Trích xuất QuestionID từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  async extractQuestionId(rawContent: string): Promise<string | null> {
    try {
      const idMatch = rawContent.match(ID_PATTERN);
      if (idMatch && idMatch[1]) {
        return idMatch[1].trim();
      }
      return null;
    } catch (error) {
      this.logger.error(`Lỗi khi trích xuất QuestionID: ${error.message}`);
      return null;
    }
  }

  /**
   * Trích xuất Subcount từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  async extractSubcount(rawContent: string): Promise<{ prefix: string; number: string; fullId: string } | null> {
    try {
      for (const pattern of SUBCOUNT_PATTERNS) {
        const subcountMatch = rawContent.match(pattern);
        if (subcountMatch && subcountMatch[1] && subcountMatch[2] && subcountMatch[3]) {
          return {
            prefix: subcountMatch[2],
            number: subcountMatch[3],
            fullId: subcountMatch[1]
          };
        }
      }
      return null;
    } catch (error) {
      this.logger.error(`Lỗi khi trích xuất Subcount: ${error.message}`);
      return null;
    }
  }

  /**
   * Trích xuất nội dung câu hỏi từ LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  async extractContent(rawContent: string): Promise<string> {
    try {
      // Trích xuất nội dung trong môi trường 'ex'
      const exContent = BracketExtractor.extractEnvironmentContent(rawContent, 'ex');
      if (!exContent) {
        throw new Error('Không tìm thấy môi trường \\begin{ex}...\\end{ex}');
      }

      // Loại bỏ QuestionID, Source và Subcount
      let cleanContent = exContent
        .replace(ID_PATTERN, '')
        .replace(SOURCE_PATTERN, '');

      // Loại bỏ các định dạng của Subcount
      for (const pattern of SUBCOUNT_PATTERNS) {
        cleanContent = cleanContent.replace(pattern, '');
      }

      // Loại bỏ các môi trường hình ảnh
      for (const pattern of IMAGE_ENVIRONMENTS) {
        cleanContent = cleanContent.replace(pattern, '');
      }

      // Loại bỏ đáp án và lời giải
      cleanContent = this.removeAnswersAndSolution(cleanContent);

      // Loại bỏ các khoảng trắng thừa
      cleanContent = cleanContent.replace(/\s+/g, ' ').trim();

      return cleanContent;
    } catch (error) {
      this.logger.error(`Lỗi khi trích xuất nội dung: ${error.message}`);
      return '';
    }
  }

  /**
   * Trích xuất lời giải từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  async extractSolution(rawContent: string): Promise<string | null> {
    try {
      // Tìm \loigiai{...} trong nội dung
      const solutionMatches = Array.from(rawContent.matchAll(SOLUTION_PATTERN));
      if (solutionMatches.length > 0) {
        // Lấy nội dung đầu tiên trong \loigiai{...}
        return solutionMatches[0][1].trim();
      }

      // Sử dụng BracketExtractor để trích xuất lời giải
      const loigiaiPos = rawContent.indexOf('\\loigiai');
      if (loigiaiPos !== -1) {
        const extraction = BracketExtractor.extractFirstCurlyBrackets(rawContent, loigiaiPos);
        if (extraction) {
          return extraction.content.trim();
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Lỗi khi trích xuất lời giải: ${error.message}`);
      return null;
    }
  }

  /**
   * Xác định loại câu hỏi (MC, TF, SA, ES) từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  async identifyQuestionType(rawContent: string): Promise<string> {
    try {
      // Kiểm tra các patterns tương ứng với từng loại câu hỏi
      if (CHOICE_TF_PATTERN.test(rawContent)) {
        return QuestionType.TF; // Trắc nghiệm nhiều phương án đúng
      } else if (CHOICE_PATTERN.test(rawContent)) {
        return QuestionType.MC; // Trắc nghiệm một phương án đúng
      } else if (SHORT_ANS_PATTERN.test(rawContent)) {
        return QuestionType.SA; // Trắc nghiệm trả lời ngắn
      } else {
        return QuestionType.ES; // Mặc định là câu hỏi tự luận
      }
    } catch (error) {
      this.logger.error(`Lỗi khi xác định loại câu hỏi: ${error.message}`);
      return QuestionType.ES; // Mặc định là câu hỏi tự luận
    }
  }

  /**
   * Trích xuất danh sách đáp án từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  async extractAnswers(rawContent: string): Promise<string[]> {
    try {
      // Xác định loại câu hỏi
      const questionType = await this.identifyQuestionType(rawContent);

      // Với câu hỏi MC hoặc TF, trích xuất các đáp án trong môi trường choice
      if (questionType === QuestionType.MC || questionType === QuestionType.TF) {
        // Tìm vị trí của \choice hoặc \choiceTF
        const choicePos = rawContent.search(questionType === QuestionType.MC ? CHOICE_PATTERN : CHOICE_TF_PATTERN);

        if (choicePos !== -1) {
          // Lấy phần nội dung từ \choice hoặc \choiceTF đến hết
          const choiceContent = rawContent.substring(choicePos);

          // Trích xuất tất cả nội dung trong {...}
          return BracketExtractor.extractAllCurlyBrackets(choiceContent)
            .map(answer => answer.replace(/\\True\s*/, '').trim()) // Loại bỏ \True nếu có
            .filter(answer => answer.length > 0); // Loại bỏ đáp án rỗng
        }
      }

      // Với câu hỏi SA, trích xuất đáp án trong \shortans{...}
      else if (questionType === QuestionType.SA) {
        const shortAnsPos = rawContent.indexOf('\\shortans');

        if (shortAnsPos !== -1) {
          // Tìm nội dung trong {} sau \shortans, bỏ qua tham số tùy chọn [...]
          const optionalParamPos = rawContent.indexOf('[', shortAnsPos);
          let startLookPos = shortAnsPos;

          if (optionalParamPos !== -1 && optionalParamPos < rawContent.indexOf('{', shortAnsPos)) {
            const optionalParamEnd = rawContent.indexOf(']', optionalParamPos);
            if (optionalParamEnd !== -1) {
              startLookPos = optionalParamEnd + 1;
            }
          }

          const extraction = BracketExtractor.extractFirstCurlyBrackets(rawContent, startLookPos);
          if (extraction) {
            // Lấy nội dung bên trong dấu nháy đơn: '...'
            const match = extraction.content.match(/'([^']*)'/);
            if (match && match[1]) {
              return [match[1].trim()];
            }
            return [extraction.content.trim()];
          }
        }
      }

      // Với câu hỏi ES không có đáp án
      return [];
    } catch (error) {
      this.logger.error(`Lỗi khi trích xuất danh sách đáp án: ${error.message}`);
      return [];
    }
  }

  /**
   * Trích xuất đáp án đúng từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   */
  async extractCorrectAnswers(rawContent: string): Promise<string | string[]> {
    try {
      const questionType = await this.identifyQuestionType(rawContent);

      // Với câu hỏi MC, tìm đáp án có \True
      if (questionType === QuestionType.MC) {
        const trueMatches = Array.from(rawContent.matchAll(TRUE_ANSWER_PATTERN));

        if (trueMatches.length > 0) {
          return trueMatches[0][1].trim();
        }

        // Tìm vị trí của \True trong nội dung
        const truePos = rawContent.indexOf('\\True');
        if (truePos !== -1) {
          const extraction = BracketExtractor.extractFirstCurlyBrackets(rawContent, truePos);
          if (extraction) {
            return extraction.content.replace(/\\True\s*/, '').trim();
          }
        }
      }

      // Với câu hỏi TF, tìm tất cả đáp án có \True
      else if (questionType === QuestionType.TF) {
        const trueMatches = Array.from(rawContent.matchAll(TRUE_ANSWER_PATTERN));
        if (trueMatches.length > 0) {
          return trueMatches.map(match => match[1].trim());
        }

        // Phương pháp khác để trích xuất nhiều đáp án đúng
        const trueAnswers: string[] = [];

        let currentPos = 0;
        while (currentPos < rawContent.length) {
          const truePos = rawContent.indexOf('\\True', currentPos);
          if (truePos === -1) break;

          const extraction = BracketExtractor.extractFirstCurlyBrackets(rawContent, truePos);
          if (extraction) {
            trueAnswers.push(extraction.content.replace(/\\True\s*/, '').trim());
            currentPos = extraction.endIndex;
          } else {
            currentPos = truePos + 5; // Tiếp tục tìm từ sau \True
          }
        }

        return trueAnswers;
      }

      // Với câu hỏi SA, lấy đáp án trong \shortans{...}
      else if (questionType === QuestionType.SA) {
        const answers = await this.extractAnswers(rawContent);
        if (answers.length > 0) {
          return answers[0];
        }
      }

      // Với câu hỏi ES, không có đáp án cố định
      return '';
    } catch (error) {
      this.logger.error(`Lỗi khi trích xuất đáp án đúng: ${error.message}`);
      return '';
    }
  }

  /**
   * Xác thực cú pháp LaTeX
   * @param rawContent Nội dung LaTeX cần xác thực
   * @returns Kết quả xác thực với danh sách lỗi nếu có
   */
  async validateSyntax(rawContent: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Kiểm tra môi trường ex
      if (!rawContent.includes('\\begin{ex}') || !rawContent.includes('\\end{ex}')) {
        errors.push('Thiếu môi trường \\begin{ex}...\\end{ex}');
      }

      // Kiểm tra cặp ngoặc
      if (!this.checkBalancedBrackets(rawContent)) {
        errors.push('Các cặp ngoặc không cân đối');
      }

      // Kiểm tra môi trường LaTeX
      if (!this.checkBalancedEnvironments(rawContent)) {
        errors.push('Các môi trường LaTeX không cân đối');
      }

      // Kiểm tra QuestionID
      const idMatch = rawContent.match(ID_PATTERN);
      if (idMatch) {
        const questionId = idMatch[1];
        // Format: [XXXXX-X] (trong đó X là kí tự số [0-9] hoặc chữ cái in hoa [A-Z])
        if (!/^[A-Z0-9]{5}-[A-Z0-9]$/.test(questionId)) {
          errors.push(`QuestionID không đúng định dạng: ${questionId}`);
        }
      }

      // Kiểm tra Subcount
      let hasValidSubcount = false;
      for (const pattern of SUBCOUNT_PATTERNS) {
        const subcountMatch = rawContent.match(pattern);
        if (subcountMatch) {
          hasValidSubcount = true;
          break;
        }
      }
      if (!hasValidSubcount && rawContent.includes('[') && rawContent.includes(']')) {
        errors.push('Subcount không đúng định dạng');
      }

      // Kiểm tra loại câu hỏi và cú pháp tương ứng
      const questionType = await this.identifyQuestionType(rawContent);

      if (questionType === QuestionType.MC) {
        // Kiểm tra cú pháp cho Multiple Choice
        if (!CHOICE_PATTERN.test(rawContent)) {
          errors.push('Thiếu lệnh \\choice cho câu hỏi trắc nghiệm');
        }

        // Kiểm tra \True
        if (!TRUE_ANSWER_PATTERN.test(rawContent)) {
          errors.push('Thiếu đánh dấu đáp án đúng với \\True');
        }
      } else if (questionType === QuestionType.TF) {
        // Kiểm tra cú pháp cho True/False
        if (!CHOICE_TF_PATTERN.test(rawContent)) {
          errors.push('Thiếu lệnh \\choiceTF cho câu hỏi trắc nghiệm nhiều đáp án');
        }
      } else if (questionType === QuestionType.SA) {
        // Kiểm tra cú pháp cho Short Answer
        if (!SHORT_ANS_PATTERN.test(rawContent)) {
          errors.push('Thiếu lệnh \\shortans cho câu hỏi trả lời ngắn');
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xác thực cú pháp LaTeX: ${error.message}`);
      return {
        isValid: false,
        errors: [`Lỗi khi xác thực: ${error.message}`]
      };
    }
  }

  /**
   * Xác thực cấu trúc câu hỏi LaTeX theo từng loại
   * @param rawContent Nội dung LaTeX cần xác thực
   * @returns Kết quả xác thực cấu trúc với danh sách lỗi nếu có
   */
  async validateQuestionStructure(rawContent: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Xác định loại câu hỏi
      const questionType = await this.identifyQuestionType(rawContent);

      // Trích xuất nội dung trong môi trường ex
      const exContent = BracketExtractor.extractEnvironmentContent(rawContent, 'ex');
      if (!exContent) {
        errors.push('Không tìm thấy nội dung trong môi trường \\begin{ex}...\\end{ex}');
        return { isValid: false, errors };
      }

      // Kiểm tra nội dung câu hỏi
      if (exContent.trim().length < 5) {
        errors.push('Nội dung câu hỏi quá ngắn');
      }

      // Kiểm tra cấu trúc dựa trên loại câu hỏi
      switch (questionType) {
        case QuestionType.MC:
          await this.validateMCQuestionStructure(rawContent, errors);
          break;
        case QuestionType.TF:
          await this.validateTFQuestionStructure(rawContent, errors);
          break;
        case QuestionType.SA:
          await this.validateSAQuestionStructure(rawContent, errors);
          break;
        case QuestionType.ES:
          await this.validateESQuestionStructure(rawContent, errors);
          break;
        default:
          errors.push(`Không thể xác định loại câu hỏi`);
      }

      // Kiểm tra lời giải (nếu có)
      if (rawContent.includes('\\loigiai')) {
        const solution = await this.extractSolution(rawContent);
        if (!solution || solution.trim().length < 2) {
          errors.push('Lời giải quá ngắn hoặc không hợp lệ');
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xác thực cấu trúc câu hỏi: ${error.message}`);
      return {
        isValid: false,
        errors: [`Lỗi khi xác thực cấu trúc: ${error.message}`]
      };
    }
  }

  /**
   * Đề xuất sửa lỗi cho nội dung LaTeX
   * @param rawContent Nội dung LaTeX cần sửa
   * @returns Danh sách các đề xuất sửa lỗi
   */
  async suggestCorrections(rawContent: string): Promise<{ original: string; suggested: string; explanation: string }[]> {
    try {
      const suggestions: { original: string; suggested: string; explanation: string }[] = [];

      // Xác thực cú pháp và cấu trúc
      const syntaxResult = await this.validateSyntax(rawContent);
      const structureResult = await this.validateQuestionStructure(rawContent);

      // Tổng hợp danh sách lỗi
      const allErrors = [...syntaxResult.errors, ...structureResult.errors];

      // Nếu không có lỗi, không cần đề xuất
      if (allErrors.length === 0) {
        return [];
      }

      // Xử lý lỗi môi trường ex
      if (!rawContent.includes('\\begin{ex}') || !rawContent.includes('\\end{ex}')) {
        let suggested = rawContent;

        if (!rawContent.includes('\\begin{ex}')) {
          suggested = '\\begin{ex}\n' + suggested;
        }

        if (!rawContent.includes('\\end{ex}')) {
          suggested = suggested + '\n\\end{ex}';
        }

        suggestions.push({
          original: rawContent,
          suggested,
          explanation: 'Thêm môi trường \\begin{ex}...\\end{ex} để bao quanh câu hỏi'
        });
      }

      // Xử lý lỗi ngoặc không cân đối
      if (!this.checkBalancedBrackets(rawContent)) {
        const fixedContent = this.fixUnbalancedBrackets(rawContent);

        if (fixedContent !== rawContent) {
          suggestions.push({
            original: rawContent,
            suggested: fixedContent,
            explanation: 'Sửa các cặp ngoặc không cân đối'
          });
        }
      }

      // Xử lý lỗi lệnh choice cho câu hỏi MC
      const questionType = await this.identifyQuestionType(rawContent);

      if (questionType === QuestionType.MC) {
        if (!CHOICE_PATTERN.test(rawContent)) {
          // Tìm vị trí thích hợp để thêm \choice
          const contentParts = rawContent.split('\\begin{ex}');
          if (contentParts.length > 1) {
            const afterBeginEx = contentParts[1];

            // Tìm vị trí để chèn \choice
            const insertPos = Math.min(
              afterBeginEx.indexOf('\\loigiai') !== -1 ? afterBeginEx.indexOf('\\loigiai') : Number.MAX_SAFE_INTEGER,
              afterBeginEx.indexOf('\\end{ex}') !== -1 ? afterBeginEx.indexOf('\\end{ex}') : Number.MAX_SAFE_INTEGER
            );

            if (insertPos !== Number.MAX_SAFE_INTEGER) {
              const suggested = rawContent.slice(0, contentParts[0].length + '\\begin{ex}'.length + insertPos) +
                '\n\\choice\n{đáp án 1}\n{đáp án 2}\n{\\True đáp án đúng}\n{đáp án 4}\n' +
                rawContent.slice(contentParts[0].length + '\\begin{ex}'.length + insertPos);

              suggestions.push({
                original: rawContent,
                suggested,
                explanation: 'Thêm lệnh \\choice với các đáp án cho câu hỏi trắc nghiệm'
              });
            }
          }
        } else if (!TRUE_ANSWER_PATTERN.test(rawContent)) {
          // Tìm đáp án đầu tiên và thêm \True
          const choicePos = rawContent.search(CHOICE_PATTERN);
          if (choicePos !== -1) {
            // Lấy phần sau \choice
            const afterChoice = rawContent.substring(choicePos);
            // Tìm đáp án đầu tiên
            const firstAnswerMatch = afterChoice.match(/\{([^}]*)\}/);
            if (firstAnswerMatch) {
              const firstAnswer = firstAnswerMatch[0];
              const trueAnswer = firstAnswer.replace('{', '{\\True ');
              const suggested = rawContent.replace(firstAnswer, trueAnswer);

              suggestions.push({
                original: rawContent,
                suggested,
                explanation: 'Thêm \\True vào một đáp án để đánh dấu đáp án đúng'
              });
            }
          }
        }
      }

      // Xử lý lỗi lệnh choiceTF cho câu hỏi TF
      if (questionType === QuestionType.TF && !CHOICE_TF_PATTERN.test(rawContent)) {
        // Tìm vị trí thích hợp để thêm \choiceTF
        const contentParts = rawContent.split('\\begin{ex}');
        if (contentParts.length > 1) {
          const afterBeginEx = contentParts[1];

          const insertPos = Math.min(
            afterBeginEx.indexOf('\\loigiai') !== -1 ? afterBeginEx.indexOf('\\loigiai') : Number.MAX_SAFE_INTEGER,
            afterBeginEx.indexOf('\\end{ex}') !== -1 ? afterBeginEx.indexOf('\\end{ex}') : Number.MAX_SAFE_INTEGER
          );

          if (insertPos !== Number.MAX_SAFE_INTEGER) {
            const suggested = rawContent.slice(0, contentParts[0].length + '\\begin{ex}'.length + insertPos) +
              '\n\\choiceTF\n{\\True đáp án đúng 1}\n{đáp án sai}\n{\\True đáp án đúng 2}\n{đáp án sai}\n' +
              rawContent.slice(contentParts[0].length + '\\begin{ex}'.length + insertPos);

            suggestions.push({
              original: rawContent,
              suggested,
              explanation: 'Thêm lệnh \\choiceTF với các đáp án cho câu hỏi trắc nghiệm nhiều đáp án'
            });
          }
        }
      }

      // Xử lý lỗi lệnh shortans cho câu hỏi SA
      if (questionType === QuestionType.SA && !SHORT_ANS_PATTERN.test(rawContent)) {
        // Tìm vị trí thích hợp để thêm \shortans
        const contentParts = rawContent.split('\\begin{ex}');
        if (contentParts.length > 1) {
          const afterBeginEx = contentParts[1];

          const insertPos = Math.min(
            afterBeginEx.indexOf('\\loigiai') !== -1 ? afterBeginEx.indexOf('\\loigiai') : Number.MAX_SAFE_INTEGER,
            afterBeginEx.indexOf('\\end{ex}') !== -1 ? afterBeginEx.indexOf('\\end{ex}') : Number.MAX_SAFE_INTEGER
          );

          if (insertPos !== Number.MAX_SAFE_INTEGER) {
            const suggested = rawContent.slice(0, contentParts[0].length + '\\begin{ex}'.length + insertPos) +
              '\n\\shortans{\'đáp án đúng\'}\n' +
              rawContent.slice(contentParts[0].length + '\\begin{ex}'.length + insertPos);

            suggestions.push({
              original: rawContent,
              suggested,
              explanation: 'Thêm lệnh \\shortans với đáp án cho câu hỏi trả lời ngắn'
            });
          }
        }
      }

      // Đề xuất thêm lời giải nếu chưa có
      if (!rawContent.includes('\\loigiai')) {
        // Tìm vị trí để thêm \loigiai
        const endExPos = rawContent.lastIndexOf('\\end{ex}');
        if (endExPos !== -1) {
          const suggested = rawContent.substring(0, endExPos) +
            '\n\\loigiai{Lời giải của câu hỏi}\n' +
            rawContent.substring(endExPos);

          suggestions.push({
            original: rawContent,
            suggested,
            explanation: 'Thêm lời giải cho câu hỏi với lệnh \\loigiai'
          });
        }
      }

      return suggestions;
    } catch (error) {
      this.logger.error(`Lỗi khi đề xuất sửa lỗi: ${error.message}`);
      return [];
    }
  }

  /**
   * Kiểm tra cấu trúc cho câu hỏi trắc nghiệm 1 đáp án
   * @private
   */
  private async validateMCQuestionStructure(rawContent: string, errors: string[]): Promise<void> {
    // Kiểm tra xem có \choice không
    if (!CHOICE_PATTERN.test(rawContent)) {
      errors.push('Câu hỏi trắc nghiệm phải có lệnh \\choice');
      return;
    }

    // Lấy tất cả đáp án
    const answers = await this.extractAnswers(rawContent);
    if (!answers || answers.length < 2) {
      errors.push('Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án');
    }

    // Kiểm tra số lượng đáp án (thông thường là 4)
    if (answers && answers.length < 4) {
      errors.push('Khuyến nghị: Câu hỏi trắc nghiệm nên có 4 đáp án');
    }

    // Kiểm tra đáp án đúng
    const correctAnswer = await this.extractCorrectAnswers(rawContent);
    if (!correctAnswer) {
      errors.push('Không tìm thấy đáp án đúng (được đánh dấu với \\True)');
    }

    // Đảm bảo chỉ có 1 đáp án đúng
    if (Array.isArray(correctAnswer) && correctAnswer.length > 1) {
      errors.push('Câu hỏi trắc nghiệm 1 đáp án chỉ được có 1 đáp án đúng');
    }
  }

  /**
   * Kiểm tra cấu trúc cho câu hỏi trắc nghiệm nhiều đáp án
   * @private
   */
  private async validateTFQuestionStructure(rawContent: string, errors: string[]): Promise<void> {
    // Kiểm tra xem có \choiceTF không
    if (!CHOICE_TF_PATTERN.test(rawContent)) {
      errors.push('Câu hỏi trắc nghiệm nhiều đáp án phải có lệnh \\choiceTF');
      return;
    }

    // Lấy tất cả đáp án
    const answers = await this.extractAnswers(rawContent);
    if (!answers || answers.length < 2) {
      errors.push('Câu hỏi trắc nghiệm nhiều đáp án phải có ít nhất 2 đáp án');
    }

    // Kiểm tra số lượng đáp án (thông thường là 4)
    if (answers && answers.length < 4) {
      errors.push('Khuyến nghị: Câu hỏi trắc nghiệm nhiều đáp án nên có 4 đáp án');
    }

    // Kiểm tra đáp án đúng
    const correctAnswers = await this.extractCorrectAnswers(rawContent);
    if (!correctAnswers || (Array.isArray(correctAnswers) && correctAnswers.length === 0)) {
      errors.push('Không tìm thấy đáp án đúng (được đánh dấu với \\True)');
    }
  }

  /**
   * Kiểm tra cấu trúc cho câu hỏi trả lời ngắn
   * @private
   */
  private async validateSAQuestionStructure(rawContent: string, errors: string[]): Promise<void> {
    // Kiểm tra xem có \shortans không
    if (!SHORT_ANS_PATTERN.test(rawContent)) {
      errors.push('Câu hỏi trả lời ngắn phải có lệnh \\shortans');
      return;
    }

    // Kiểm tra đáp án
    const correctAnswer = await this.extractCorrectAnswers(rawContent);
    if (!correctAnswer || (typeof correctAnswer === 'string' && correctAnswer.trim().length === 0)) {
      errors.push('Câu hỏi trả lời ngắn phải có đáp án đúng');
    }
  }

  /**
   * Kiểm tra cấu trúc cho câu hỏi tự luận
   * @private
   */
  private async validateESQuestionStructure(rawContent: string, errors: string[]): Promise<void> {
    // Trích xuất nội dung câu hỏi
    const content = await this.extractContent(rawContent);

    // Kiểm tra độ dài nội dung
    if (content.length < 10) {
      errors.push('Nội dung câu hỏi tự luận quá ngắn');
    }

    // Kiểm tra lời giải (tùy chọn, nhưng khuyến khích)
    if (!rawContent.includes('\\loigiai')) {
      errors.push('Khuyến nghị: Câu hỏi tự luận nên có lời giải');
    }
  }

  /**
   * Kiểm tra xem các cặp ngoặc có cân đối không
   * @private
   */
  private checkBalancedBrackets(content: string): boolean {
    const stack: string[] = [];

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '{' || char === '[' || char === '(') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.pop() !== '{') return false;
      } else if (char === ']') {
        if (stack.pop() !== '[') return false;
      } else if (char === ')') {
        if (stack.pop() !== '(') return false;
      }
    }

    return stack.length === 0;
  }

  /**
   * Kiểm tra xem các môi trường LaTeX có cân đối không
   * @private
   */
  private checkBalancedEnvironments(content: string): boolean {
    const envStack: string[] = [];
    const envRegex = /\\begin\{([^}]+)\}|\\end\{([^}]+)\}/g;

    let match;
    while ((match = envRegex.exec(content)) !== null) {
      const beginEnv = match[1];
      const endEnv = match[2];

      if (beginEnv) {
        envStack.push(beginEnv);
      } else if (endEnv) {
        if (envStack.pop() !== endEnv) return false;
      }
    }

    return envStack.length === 0;
  }

  /**
   * Sửa lỗi ngoặc không cân đối
   * @private
   */
  private fixUnbalancedBrackets(content: string): string {
    const openBrackets = ['{', '[', '('];
    const closeBrackets = ['}', ']', ')'];
    const bracketPairs: Record<string, string> = { '{': '}', '[': ']', '(': ')' };

    const stack: { char: string }[] = [];
    let result = content;
    let offset = 0; // Offset do đã thêm các dấu ngoặc

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (openBrackets.includes(char)) {
        stack.push({ char });
      } else if (closeBrackets.includes(char)) {
        const openBracketIndex = closeBrackets.indexOf(char);
        const openBracket = openBrackets[openBracketIndex];

        if (stack.length === 0 || stack[stack.length - 1].char !== openBracket) {
          // Nếu thiếu ngoặc mở tương ứng, thêm vào
          const insertPos = i;
          result = result.slice(0, insertPos + offset) + openBracket + result.slice(insertPos + offset);
          offset++;
        } else {
          // Nếu có ngoặc mở tương ứng, loại bỏ khỏi stack
          stack.pop();
        }
      }
    }

    // Xử lý các ngoặc mở chưa có ngoặc đóng tương ứng
    for (let i = stack.length - 1; i >= 0; i--) {
      const { char } = stack[i];
      const closeBracket = bracketPairs[char];
      const insertPos = content.length;

      result = result.slice(0, insertPos + offset) + closeBracket + result.slice(insertPos + offset);
      offset++;
    }

    return result;
  }

  /**
   * Chuyển đổi LaTeX sang HTML để hiển thị
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  async renderToHTML(rawContent: string): Promise<string> {
    try {
      // Đây là một cài đặt đơn giản, cần tích hợp với thư viện chuyển đổi LaTeX sang HTML
      // như KaTeX trong thực tế

      // Trích xuất phần nội dung
      const content = await this.extractContent(rawContent);

      // Xác định loại câu hỏi và phần đáp án
      const type = await this.identifyQuestionType(rawContent);
      const answers = await this.extractAnswers(rawContent);
      const correctAnswers = await this.extractCorrectAnswers(rawContent);

      // Tạo HTML cơ bản
      let html = `<div class="question">
        <div class="question-content">${this.escapeHTML(content)}</div>`;

      // Thêm phần đáp án tùy theo loại câu hỏi
      if (type === QuestionType.MC || type === QuestionType.TF) {
        html += '<div class="question-answers">';
        for (const answer of answers) {
          const isCorrect =
            type === QuestionType.MC
              ? correctAnswers === answer
              : Array.isArray(correctAnswers) && correctAnswers.includes(answer);

          html += `<div class="answer ${isCorrect ? 'correct' : ''}">${this.escapeHTML(answer)}</div>`;
        }
        html += '</div>';
      }
      else if (type === QuestionType.SA) {
        html += `<div class="question-answer">Đáp án: ${this.escapeHTML(correctAnswers as string)}</div>`;
      }

      // Thêm lời giải nếu có
      const solution = await this.extractSolution(rawContent);
      if (solution) {
        html += `<div class="question-solution">Lời giải: ${this.escapeHTML(solution)}</div>`;
      }

      html += '</div>';

      return html;
    } catch (error) {
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang HTML: ${error.message}`);
      return `<div class="error">Không thể chuyển đổi LaTeX sang HTML: ${error.message}</div>`;
    }
  }

  /**
   * Chuyển đổi LaTeX sang văn bản thuần túy
   * @param rawContent Nội dung LaTeX cần chuyển đổi
   */
  async renderToPlainText(rawContent: string): Promise<string> {
    try {
      // Trích xuất phần nội dung
      const content = await this.extractContent(rawContent);

      // Xác định loại câu hỏi và phần đáp án
      const type = await this.identifyQuestionType(rawContent);
      const answers = await this.extractAnswers(rawContent);
      const correctAnswers = await this.extractCorrectAnswers(rawContent);

      // Tạo văn bản cơ bản
      let text = `Câu hỏi: ${content}\n\n`;

      // Thêm phần đáp án tùy theo loại câu hỏi
      if (type === QuestionType.MC || type === QuestionType.TF) {
        text += 'Các đáp án:\n';
        for (let i = 0; i < answers.length; i++) {
          const isCorrect =
            type === QuestionType.MC
              ? correctAnswers === answers[i]
              : Array.isArray(correctAnswers) && correctAnswers.includes(answers[i]);

          text += `${String.fromCharCode(65 + i)}. ${answers[i]} ${isCorrect ? '(Đúng)' : ''}\n`;
        }
      }
      else if (type === QuestionType.SA) {
        text += `Đáp án: ${correctAnswers}\n`;
      }

      // Thêm lời giải nếu có
      const solution = await this.extractSolution(rawContent);
      if (solution) {
        text += `\nLời giải: ${solution}\n`;
      }

      return text;
    } catch (error) {
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang văn bản thuần túy: ${error.message}`);
      return `Lỗi: Không thể chuyển đổi LaTeX sang văn bản thuần túy: ${error.message}`;
    }
  }

  /**
   * Loại bỏ đáp án và lời giải khỏi nội dung
   * @param content Nội dung cần xử lý
   * @private
   */
  private removeAnswersAndSolution(content: string): string {
    let result = content;

    // Loại bỏ phần đáp án trong \choice
    const choicePos = result.search(CHOICE_PATTERN);
    if (choicePos !== -1) {
      result = result.substring(0, choicePos);
    }

    // Loại bỏ phần đáp án trong \choiceTF
    const choiceTFPos = result.search(CHOICE_TF_PATTERN);
    if (choiceTFPos !== -1) {
      result = result.substring(0, choiceTFPos);
    }

    // Loại bỏ phần đáp án trong \shortans
    const shortAnsPos = result.search(SHORT_ANS_PATTERN);
    if (shortAnsPos !== -1) {
      result = result.substring(0, shortAnsPos);
    }

    // Loại bỏ phần lời giải
    result = result.replace(SOLUTION_PATTERN, '');

    return result;
  }

  /**
   * Trích xuất nguồn từ nội dung LaTeX
   * @param rawContent Nội dung LaTeX gốc
   * @private
   */
  private async extractSources(rawContent: string): Promise<string[]> {
    try {
      const sources: string[] = [];
      const sourceMatches = Array.from(rawContent.matchAll(SOURCE_PATTERN));

      if (sourceMatches.length > 0) {
        for (const match of sourceMatches) {
          if (match[1] || match[2]) {
            sources.push(match[1] || match[2]);
          }
        }
      }

      return sources;
    } catch (error) {
      this.logger.error(`Lỗi khi trích xuất nguồn: ${error.message}`);
      return [];
    }
  }

  /**
   * Escape HTML characters
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