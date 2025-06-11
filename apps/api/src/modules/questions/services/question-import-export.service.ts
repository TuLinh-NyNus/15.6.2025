import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { LaTeXParserService } from '../../exams/services/latex-parser.service';
import { 
  QuestionImportDto, 
  QuestionExportDto, 
  BatchImportDto, 
  QuestionImportResultDto,
  CreateQuestionDto,
  QuestionFilterDto
} from '@project/dto';
import { QuestionStatus, QuestionType } from '@project/entities';
import { Workbook } from 'exceljs';
import * as papa from 'papaparse';

/**
 * Interface định nghĩa cấu trúc dữ liệu câu hỏi để thay thế kiểu any
 */
interface QuestionData {
  id: string;
  content: string;
  type: QuestionType;
  questionId?: string;
  subcount?: string;
  source?: string;
  answers?: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  solution?: string;
  status: QuestionStatus;
  tags?: string[];
  creatorId?: string;
  creator?: { fullName?: string };
  createdAt?: Date | string;
  updatedAt?: Date | string;
  rawContent?: string;
}

/**
 * Định nghĩa các định dạng xuất hỗ trợ
 */
type ExportFormat = 'latex' | 'json' | 'excel' | 'csv';

/**
 * Service cho việc nhập và xuất câu hỏi
 */
@Injectable()
export class QuestionImportExportService {
  private readonly logger = new Logger(QuestionImportExportService.name);

  constructor(
    private readonly questionsService: QuestionsService,
    private readonly latexParserService: LaTeXParserService,
  ) {}

  /**
   * Import câu hỏi từ nội dung LaTeX
   * @param importDto 
   * @param userId ID của người dùng hiện tại
   * @returns Kết quả import
   */
  async importFromLatex(
    importDto: QuestionImportDto,
    userId?: string,
  ): Promise<QuestionImportResultDto> {
    try {
      // Validate cú pháp LaTeX
      const validationResult = await this.latexParserService.validateSyntax(importDto.latexContent);
      if (!validationResult.isValid) {
        return {
          totalProcessed: 1,
          successCount: 0,
          failureCount: 1,
          errors: validationResult.errors.map(error => ({ message: error })),
        };
      }

      // Parse nội dung LaTeX thành đối tượng câu hỏi
      const parsedQuestion = await this.latexParserService.parseQuestion(importDto.latexContent);
      
      // Gán creatorId từ token nếu không được cung cấp
      const creatorId = importDto.creatorId || userId;
      
      // Kiểm tra nếu đã tồn tại câu hỏi với questionId này và xử lý ghi đè
      let existingQuestion = null;
      if (parsedQuestion.questionId) {
        try {
          existingQuestion = await this.questionsService.findByQuestionId(parsedQuestion.questionId);
        } catch (error) {
          // Không có câu hỏi tồn tại với questionId này
        }
      }

      if (existingQuestion && !importDto.overwrite) {
        return {
          totalProcessed: 1,
          successCount: 0,
          failureCount: 1,
          errors: [{ 
            message: `Câu hỏi với QuestionID ${parsedQuestion.questionId} đã tồn tại. Sử dụng overwrite=true để ghi đè.`,
            content: parsedQuestion.questionId 
          }],
        };
      }

      // Tạo hoặc cập nhật câu hỏi
      const createDto: CreateQuestionDto = {
        content: parsedQuestion.content,
        rawContent: importDto.latexContent,
        type: parsedQuestion.type as QuestionType,
        questionId: parsedQuestion.questionId,
        subcount: parsedQuestion.subcount?.fullId,
        source: parsedQuestion.sources?.[0],
        answers: parsedQuestion.answers?.map((answer, index) => ({
          id: index.toString(),
          content: answer,
          isCorrect: Array.isArray(parsedQuestion.correctAnswer) 
            ? parsedQuestion.correctAnswer.includes(answer) 
            : parsedQuestion.correctAnswer === answer
        })) || [],
        solution: parsedQuestion.solutions?.[0] || '',
        status: importDto.status,
        tags: importDto.tags || [],
        creatorId: creatorId,
      };

      let result;
      if (existingQuestion && importDto.overwrite) {
        // Cập nhật câu hỏi nếu đã tồn tại và cho phép ghi đè
        result = await this.questionsService.update(existingQuestion.id, createDto);
      } else {
        // Tạo câu hỏi mới
        result = await this.questionsService.create(createDto, creatorId);
      }

      return {
        totalProcessed: 1,
        successCount: 1,
        failureCount: 0,
        successIds: [result.id],
      };
    } catch (error) {
      this.logger.error(`Lỗi khi import câu hỏi từ LaTeX: ${error.message}`, error.stack);
      return {
        totalProcessed: 1,
        successCount: 0,
        failureCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  /**
   * Xuất câu hỏi sang định dạng LaTeX
   * @param questions Danh sách câu hỏi cần xuất
   * @param includeSolution Có bao gồm lời giải không
   * @returns Nội dung LaTeX đã xuất
   */
  async exportToLatex(questions: QuestionData[], includeSolution = true): Promise<string> {
    try {
      let result = '';
      
      for (const question of questions) {
        // Nếu câu hỏi có rawContent, sử dụng nó
        if (question.rawContent) {
          // Xử lý lời giải nếu cần
          if (!includeSolution && question.rawContent.includes('\\loigiai')) {
            const withoutSolution = this.removeSolutionFromLatex(question.rawContent);
            result += withoutSolution + '\n\n';
          } else {
            result += question.rawContent + '\n\n';
          }
        } else {
          // Nếu không có rawContent, tạo mới từ dữ liệu câu hỏi
          result += this.generateLatexFromQuestion(question, includeSolution) + '\n\n';
        }
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi xuất câu hỏi sang LaTeX: ${error.message}`, error.stack);
      throw new Error(`Không thể xuất câu hỏi sang LaTeX: ${error.message}`);
    }
  }

  /**
   * Xuất danh sách câu hỏi ra định dạng JSON
   * @param questions Danh sách câu hỏi cần xuất
   * @returns Nội dung JSON đã xuất
   */
  async exportToJson(questions: QuestionData[]): Promise<string> {
    try {
      // Chuyển đổi và làm sạch dữ liệu
      const cleanedQuestions = questions.map(question => ({
        id: question.id,
        content: question.content,
        type: question.type,
        questionId: question.questionId,
        subcount: question.subcount,
        source: question.source,
        answers: question.answers,
        solution: question.solution,
        tags: question.tags,
        status: question.status,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }));
      
      return JSON.stringify(cleanedQuestions, null, 2);
    } catch (error) {
      this.logger.error(`Lỗi khi xuất câu hỏi sang JSON: ${error.message}`, error.stack);
      throw new Error(`Không thể xuất câu hỏi sang JSON: ${error.message}`);
    }
  }

  /**
   * Import câu hỏi từ Excel/CSV
   * @param buffer Buffer dữ liệu Excel/CSV
   * @param isCSV Cờ xác định định dạng là CSV
   * @param userId ID của người dùng hiện tại
   * @returns Kết quả import
   */
  async importFromExcelCsv(
    buffer: Buffer,
    isCSV: boolean,
    userId?: string,
  ): Promise<QuestionImportResultDto> {
    try {
      // Kết quả trả về
      const result: QuestionImportResultDto = {
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
        errors: [],
        successIds: [],
      };

      let rows: Record<string, string | number | boolean>[] = [];

      // Đọc dữ liệu từ Excel hoặc CSV
      if (isCSV) {
        // Xử lý CSV
        const content = buffer.toString('utf-8');
        const parsedData = papa.parse(content, {
          header: true,
          skipEmptyLines: true,
        });
        
        rows = parsedData.data as Record<string, string | number | boolean>[];
        result.totalProcessed = rows.length;
      } else {
        // Xử lý Excel
        const workbook = new Workbook();
        await workbook.xlsx.load(buffer as unknown as ArrayBuffer); // Cast buffer để phù hợp với kiểu dữ liệu exceljs yêu cầu
        
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          throw new BadRequestException('Sheet không tồn tại trong file Excel');
        }

        // Chuyển đổi worksheet sang mảng dữ liệu
        const headers: string[] = [];
        rows = [];

        // Đọc headers từ dòng đầu tiên
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value ? cell.value.toString().trim() : '';
        });

        // Đọc các dòng dữ liệu
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Bỏ qua dòng header

          const rowData: Record<string, string | number | boolean> = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              // Xử lý các kiểu dữ liệu từ ExcelJS
              const cellValue = cell.value;
              if (cellValue instanceof Date) {
                rowData[header] = cellValue.toISOString();
              } else if (typeof cellValue === 'object' && cellValue !== null) {
                rowData[header] = JSON.stringify(cellValue);
              } else {
                rowData[header] = cellValue as string | number | boolean;
              }
            }
          });

          rows.push(rowData);
        });

        result.totalProcessed = rows.length;
      }

      // Xử lý từng dòng dữ liệu
      for (const [index, row] of rows.entries()) {
        try {
          // Kiểm tra các trường bắt buộc
          if (!row.content) {
            result.failureCount++;
            result.errors.push({
              index,
              message: 'Thiếu nội dung câu hỏi',
              content: JSON.stringify(row),
            });
            continue;
          }

          if (!row.type || !Object.values(QuestionType).includes(row.type as string as QuestionType)) {
            result.failureCount++;
            result.errors.push({
              index,
              message: `Loại câu hỏi không hợp lệ: ${row.type}`,
              content: JSON.stringify(row),
            });
            continue;
          }

          // Xây dựng đối tượng CreateQuestionDto
          const createDto: CreateQuestionDto = {
            content: row.content as string,
            type: this.parseQuestionType(row.type),
            questionId: row.questionId ? String(row.questionId) : undefined,
            subcount: row.subcount ? String(row.subcount) : undefined,
            source: row.source ? String(row.source) : undefined,
            answers: this.parseAnswers(row),
            solution: row.solution ? String(row.solution) : '',
            status: this.parseQuestionStatus(row.status) || QuestionStatus.DRAFT,
            tags: this.parseTags(row.tags),
            creatorId: userId,
            rawContent: row.rawContent ? String(row.rawContent) : JSON.stringify(row),
          };

          // Kiểm tra xem câu hỏi đã tồn tại chưa
          let existingQuestion = null;
          if (createDto.questionId) {
            try {
              existingQuestion = await this.questionsService.findByQuestionId(createDto.questionId);
            } catch (error) {
              // Không có câu hỏi tồn tại với questionId này
            }
          } else if (createDto.subcount) {
            try {
              existingQuestion = await this.questionsService.findBySubcount(createDto.subcount);
            } catch (error) {
              // Không có câu hỏi tồn tại với subcount này
            }
          }

          let savedQuestion;
          if (existingQuestion && row.overwrite === true) {
            // Cập nhật câu hỏi hiện có
            savedQuestion = await this.questionsService.update(existingQuestion.id, createDto);
          } else if (existingQuestion) {
            result.failureCount++;
            result.errors.push({
              index,
              message: `Câu hỏi đã tồn tại (${existingQuestion.id}). Sử dụng overwrite=true để ghi đè.`,
              content: existingQuestion.id,
            });
            continue;
          } else {
            // Tạo câu hỏi mới
            savedQuestion = await this.questionsService.create(createDto, userId);
          }

          result.successCount++;
          result.successIds.push(savedQuestion.id);
        } catch (error) {
          result.failureCount++;
          result.errors.push({
            index,
            message: `Lỗi khi import dòng ${index + 1}: ${error.message}`,
            content: JSON.stringify(row),
          });
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi import từ Excel/CSV: ${error.message}`, error.stack);
      throw new BadRequestException(`Không thể import từ Excel/CSV: ${error.message}`);
    }
  }

  /**
   * Xuất câu hỏi sang định dạng Excel
   * @param questions Danh sách câu hỏi
   * @returns Buffer chứa dữ liệu Excel
   */
  async exportToExcel(questions: QuestionData[]): Promise<Buffer> {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Questions');

      // Định nghĩa cột
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Nội dung', key: 'content', width: 50 },
        { header: 'Loại', key: 'type', width: 10 },
        { header: 'QuestionID', key: 'questionId', width: 15 },
        { header: 'Subcount', key: 'subcount', width: 12 },
        { header: 'Nguồn', key: 'source', width: 20 },
        { header: 'Đáp án', key: 'answers', width: 40 },
        { header: 'Đáp án đúng', key: 'correctAnswers', width: 20 },
        { header: 'Lời giải', key: 'solution', width: 40 },
        { header: 'Tags', key: 'tags', width: 20 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Người tạo', key: 'creator', width: 20 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      ];

      // Thêm dữ liệu
      for (const question of questions) {
        const correctAnswers = Array.isArray(question.answers) 
          ? question.answers
              .filter(a => a.isCorrect)
              .map(a => a.content)
              .join('; ')
          : '';
        
        const answersText = Array.isArray(question.answers)
          ? question.answers.map(a => a.content).join('; ')
          : '';

        worksheet.addRow({
          id: question.id,
          content: question.content,
          type: question.type,
          questionId: question.questionId || '',
          subcount: question.subcount || '',
          source: question.source || '',
          answers: answersText,
          correctAnswers: correctAnswers,
          solution: question.solution || '',
          tags: Array.isArray(question.tags) ? question.tags.join(', ') : '',
          status: question.status,
          creator: question.creator?.fullName || question.creatorId || '',
          createdAt: question.createdAt ? new Date(question.createdAt) : null,
        });
      }

      // Tạo buffer cho file Excel
      return await workbook.xlsx.writeBuffer() as unknown as Buffer;
    } catch (error) {
      this.logger.error(`Lỗi khi xuất câu hỏi sang Excel: ${error.message}`, error.stack);
      throw new Error(`Không thể xuất câu hỏi sang Excel: ${error.message}`);
    }
  }

  /**
   * Xuất câu hỏi sang định dạng CSV
   * @param questions Danh sách câu hỏi
   * @returns Chuỗi CSV
   */
  async exportToCsv(questions: QuestionData[]): Promise<string> {
    try {
      // Chuyển đổi dữ liệu câu hỏi thành định dạng phù hợp cho CSV
      const data = questions.map(question => {
        const correctAnswers = Array.isArray(question.answers) 
          ? question.answers
              .filter(a => a.isCorrect)
              .map(a => a.content)
              .join('; ')
          : '';
        
        const answersText = Array.isArray(question.answers)
          ? question.answers.map(a => a.content).join('; ')
          : '';

        return {
          id: question.id,
          content: question.content,
          type: question.type,
          questionId: question.questionId || '',
          subcount: question.subcount || '',
          source: question.source || '',
          answers: answersText,
          correctAnswers: correctAnswers,
          solution: question.solution || '',
          tags: Array.isArray(question.tags) ? question.tags.join(', ') : '',
          status: question.status,
          creator: question.creator?.fullName || question.creatorId || '',
          createdAt: question.createdAt ? new Date(question.createdAt).toISOString() : '',
        };
      });

      // Sử dụng papaparse để tạo CSV
      const csv = papa.unparse(data);
      return csv;
    } catch (error) {
      this.logger.error(`Lỗi khi xuất câu hỏi sang CSV: ${error.message}`, error.stack);
      throw new Error(`Không thể xuất câu hỏi sang CSV: ${error.message}`);
    }
  }

  /**
   * Import nhiều câu hỏi từ nội dung LaTeX
   * @param batchDto DTO chứa các câu hỏi cần import
   * @param userId ID của người dùng hiện tại
   * @returns Kết quả import
   */
  async batchImport(
    batchDto: BatchImportDto,
    userId?: string,
  ): Promise<QuestionImportResultDto> {
    // Kết quả tổng hợp
    const result: QuestionImportResultDto = {
      totalProcessed: batchDto.questions.length,
      successCount: 0,
      failureCount: 0,
      errors: [],
      successIds: [],
    };

    // Xử lý từng câu hỏi
    for (let i = 0; i < batchDto.questions.length; i++) {
      const questionDto = batchDto.questions[i];
      
      // Áp dụng các thuộc tính chung nếu không được cung cấp trong câu hỏi cụ thể
      const importDto: QuestionImportDto = {
        latexContent: questionDto.latexContent,
        creatorId: questionDto.creatorId || batchDto.creatorId || userId,
        status: questionDto.status || batchDto.status,
        tags: [...(questionDto.tags || []), ...(batchDto.commonTags || [])],
        overwrite: questionDto.overwrite !== undefined ? questionDto.overwrite : batchDto.overwrite,
      };

      try {
        // Gọi phương thức import cho từng câu hỏi
        const importResult = await this.importFromLatex(importDto, userId);
        
        // Cập nhật kết quả tổng hợp
        if (importResult.successCount > 0) {
          result.successCount++;
          if (importResult.successIds && importResult.successIds.length > 0) {
            result.successIds.push(...importResult.successIds);
          }
        } else {
          result.failureCount++;
          if (importResult.errors && importResult.errors.length > 0) {
            importResult.errors.forEach(error => {
              result.errors.push({
                index: i,
                message: error.message,
                content: error.content,
              });
            });
          }
        }
      } catch (error) {
        result.failureCount++;
        result.errors.push({
          index: i,
          message: error.message,
        });
      }
    }

    return result;
  }

  /**
   * Xuất câu hỏi theo định dạng và điều kiện lọc
   * @param exportDto DTO chứa các điều kiện lọc và định dạng xuất
   * @returns Dữ liệu đã xuất theo định dạng yêu cầu
   */
  async exportQuestions(exportDto: QuestionExportDto): Promise<{
    data: string | Buffer;
    format: string;
    fileExtension: string;
    contentType: string;
  }> {
    try {
      // Xác định định dạng xuất
      const format = (exportDto.format || 'latex') as ExportFormat;
      
      // Lấy danh sách câu hỏi theo điều kiện lọc
      let questions: QuestionData[] = [];
      
      if (exportDto.questionIds && exportDto.questionIds.length > 0) {
        // Lấy câu hỏi theo ID
        for (const id of exportDto.questionIds) {
          try {
            const question = await this.questionsService.findById(id);
            if (question) {
              questions.push(question as QuestionData);
            }
          } catch (error) {
            // Bỏ qua câu hỏi không tìm thấy
          }
        }
      } else {
        // Lấy câu hỏi theo filter
        const filterDto: QuestionFilterDto = {
          tags: exportDto.tags,
          types: exportDto.types,
          limit: 1000, // Giới hạn số câu hỏi xuất ra
        };
        
        const { questions: filteredQuestions } = await this.questionsService.findAll(filterDto);
        questions = filteredQuestions as QuestionData[];
      }
      
      if (questions.length === 0) {
        throw new NotFoundException('Không tìm thấy câu hỏi nào phù hợp với tiêu chí');
      }
      
      // Xử lý xuất theo định dạng
      let data: string | Buffer;
      let fileExtension: string;
      let contentType: string;
      
      switch (format) {
        case 'latex':
          data = await this.exportToLatex(questions, exportDto.includeSolution);
          fileExtension = 'tex';
          contentType = 'application/x-tex';
          break;
          
        case 'json':
          data = await this.exportToJson(questions);
          fileExtension = 'json';
          contentType = 'application/json';
          break;
          
        case 'excel':
          data = await this.exportToExcel(questions);
          fileExtension = 'xlsx';
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
          
        case 'csv':
          data = await this.exportToCsv(questions);
          fileExtension = 'csv';
          contentType = 'text/csv';
          break;
          
        default:
          throw new BadRequestException('Định dạng xuất không được hỗ trợ');
      }
      
      return {
        data,
        format,
        fileExtension,
        contentType,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xuất câu hỏi: ${error.message}`, error.stack);
      throw error;
    }
  }

  //#region Helper methods

  /**
   * Loại bỏ phần lời giải từ nội dung LaTeX
   * @param latexContent Nội dung LaTeX
   * @returns Nội dung LaTeX không có lời giải
   * @private
   */
  private removeSolutionFromLatex(latexContent: string): string {
    // Tìm và loại bỏ phần \loigiai{...}
    return latexContent.replace(/\\loigiai\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '');
  }

  /**
   * Tạo nội dung LaTeX từ dữ liệu câu hỏi
   * @param question Dữ liệu câu hỏi
   * @param includeSolution Có bao gồm lời giải không
   * @returns Nội dung LaTeX được tạo
   * @private
   */
  private generateLatexFromQuestion(question: QuestionData, includeSolution: boolean): string {
    let latex = '\\begin{ex}';
    
    // Thêm QuestionID và Subcount nếu có
    if (question.questionId) {
      latex += `%[${question.questionId}]`;
    }
    if (question.subcount) {
      latex += `[${question.subcount}]`;
    }
    
    // Thêm nội dung
    latex += `\n${question.content}\n`;
    
    // Thêm đáp án tùy theo loại câu hỏi
    if (question.type === QuestionType.MC) {
      latex += '\\choice\n';
      if (question.answers && Array.isArray(question.answers)) {
        for (const answer of question.answers) {
          if (answer.isCorrect) {
            latex += `{\\True ${answer.content}}\n`;
          } else {
            latex += `{${answer.content}}\n`;
          }
        }
      }
    } else if (question.type === QuestionType.TF) {
      latex += '\\choiceTF\n';
      if (question.answers && Array.isArray(question.answers)) {
        for (const answer of question.answers) {
          if (answer.isCorrect) {
            latex += `{\\True ${answer.content}}\n`;
          } else {
            latex += `{${answer.content}}\n`;
          }
        }
      }
    } else if (question.type === QuestionType.SA) {
      // Tìm đáp án đúng
      const correctAnswer = question.answers && Array.isArray(question.answers)
        ? question.answers.find(a => a.isCorrect)
        : null;
      
      if (correctAnswer) {
        latex += `\\shortans{'${correctAnswer.content}'}\n`;
      }
    }
    
    // Thêm lời giải nếu yêu cầu
    if (includeSolution && question.solution) {
      latex += `\\loigiai{\n${question.solution}\n}\n`;
    }
    
    latex += '\\end{ex}';
    
    return latex;
  }

  /**
   * Phân tích các đáp án từ dữ liệu Excel/CSV
   * @param row Dữ liệu dòng từ Excel/CSV
   * @returns Mảng các đáp án đã phân tích
   * @private
   */
  private parseAnswers(row: Record<string, unknown>): Array<{ id: string; content: string; isCorrect: boolean }> {
    const answers: Array<{ id: string; content: string; isCorrect: boolean }> = [];
    
    // Trường hợp 1: Dữ liệu có sẵn dạng mảng JSON
    if (row.answers && typeof row.answers === 'string' && row.answers.startsWith('[')) {
      try {
        return JSON.parse(row.answers);
      } catch (error) {
        // Không phải JSON, tiếp tục xử lý
      }
    }
    
    // Trường hợp 2: Có các trường answers1, answers2, answers3, ...
    let index = 1;
    while (row[`answer${index}`] || row[`answers${index}`]) {
      const answerKey = row[`answer${index}`] ? `answer${index}` : `answers${index}`;
      const isCorrectKey = `isCorrect${index}`;
      
      const content = String(row[answerKey] || '');
      const isCorrect = row[isCorrectKey] === true || 
                       row[isCorrectKey] === 'true' || 
                       row[isCorrectKey] === '1' || 
                       row[isCorrectKey] === 1;
      
      answers.push({
        id: index.toString(),
        content,
        isCorrect,
      });
      
      index++;
    }
    
    // Trường hợp 3: Có trường answers dạng chuỗi ngăn cách bởi dấu chấm phẩy và trường correctAnswers
    if (answers.length === 0 && row.answers && typeof row.answers === 'string') {
      const answersList = row.answers.split(';').map(a => a.trim()).filter(a => a);
      const correctAnswersList = typeof row.correctAnswers === 'string' 
        ? row.correctAnswers.split(';').map(a => a.trim()).filter(a => a) 
        : [];
      
      answers.push(...answersList.map((content, idx) => ({
        id: idx.toString(),
        content,
        isCorrect: correctAnswersList.includes(content),
      })));
    }
    
    return answers;
  }

  /**
   * Phân tích tags từ dữ liệu Excel/CSV
   * @param tagsInput Tags từ Excel/CSV
   * @returns Mảng các tag đã phân tích
   * @private
   */
  private parseTags(tagsInput: string | string[] | unknown): string[] {
    if (!tagsInput) return [];
    
    // Nếu là mảng
    if (Array.isArray(tagsInput)) {
      return tagsInput.map(t => String(t));
    }
    
    // Nếu là chuỗi JSON
    if (typeof tagsInput === 'string' && tagsInput.startsWith('[')) {
      try {
        return JSON.parse(tagsInput);
      } catch (error) {
        // Không phải JSON, coi như chuỗi ngăn cách
      }
    }
    
    // Nếu là chuỗi ngăn cách bởi dấu phẩy hoặc chấm phẩy
    if (typeof tagsInput === 'string') {
      return tagsInput
        .split(/[,;]/)
        .map(t => t.trim())
        .filter(t => t);
    }
    
    // Trường hợp khác, chuyển đổi sang string nếu có thể
    if (tagsInput !== null && tagsInput !== undefined) {
      const tagStr = String(tagsInput);
      if (tagStr) {
        return [tagStr];
      }
    }
    
    return [];
  }

  /**
   * Chuyển đổi giá trị đến QuestionType
   * @param value Giá trị cần chuyển đổi
   * @returns QuestionType
   * @private
   */
  private parseQuestionType(value: unknown): QuestionType {
    if (typeof value === 'string') {
      if (Object.values(QuestionType).includes(value as QuestionType)) {
        return value as QuestionType;
      }
    }
    
    // Giá trị mặc định nếu không hợp lệ
    return QuestionType.MC;
  }

  /**
   * Chuyển đổi giá trị đến QuestionStatus
   * @param value Giá trị cần chuyển đổi
   * @returns QuestionStatus hoặc undefined
   * @private
   */
  private parseQuestionStatus(value: unknown): QuestionStatus | undefined {
    if (typeof value === 'string') {
      if (Object.values(QuestionStatus).includes(value as QuestionStatus)) {
        return value as QuestionStatus;
      }
    }
    
    return undefined;
  }

  //#endregion
} 