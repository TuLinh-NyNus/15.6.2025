import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole, QuestionType } from '@project/entities';
import { QuestionsService } from '../services/questions.service';
import { LaTeXParserService } from '../../exams/services/latex-parser.service';
import {
  QuestionImportDto,
  QuestionExportDto,
  BatchImportDto,
  QuestionImportResultDto,
  CreateQuestionDto
} from '@project/dto';
import * as ExcelJS from 'exceljs';
import { getErrorMessage } from '../../../utils/error-handler';

@ApiTags('questions-import-export')
@ApiBearerAuth()
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionImportExportController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly latexParserService: LaTeXParserService,
  ) {}

  /**
   * Import câu hỏi từ nội dung LaTeX
   */
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Import câu hỏi từ định dạng LaTeX' })
  @ApiBody({ type: QuestionImportDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Câu hỏi đã được import thành công',
    type: QuestionImportResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu LaTeX không hợp lệ hoặc không thể phân tích',
  })
  async importQuestion(
    @Body() importDto: QuestionImportDto,
    @Request() req,
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

      // Gán creatorId từ JWT token nếu không được cung cấp
      const creatorId = importDto.creatorId || req.user.id;

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
        type: parsedQuestion.type as any,
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
      return {
        totalProcessed: 1,
        successCount: 0,
        failureCount: 1,
        errors: [{ message: getErrorMessage(error) }],
      };
    }
  }

  /**
   * Import nhiều câu hỏi từ nội dung LaTeX
   */
  @Post('batch-import')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Import nhiều câu hỏi từ định dạng LaTeX' })
  @ApiBody({ type: BatchImportDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết quả import các câu hỏi',
    type: QuestionImportResultDto,
  })
  async batchImport(
    @Body() batchDto: BatchImportDto,
    @Request() req,
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
        creatorId: questionDto.creatorId || batchDto.creatorId || req.user.id,
        status: questionDto.status || batchDto.status,
        tags: [...(questionDto.tags || []), ...(batchDto.commonTags || [])],
        overwrite: questionDto.overwrite !== undefined ? questionDto.overwrite : batchDto.overwrite,
      };

      try {
        // Gọi API import cho từng câu hỏi
        const importResult = await this.importQuestion(importDto, req);

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
                message: getErrorMessage(error),
                content: error.content,
              });
            });
          }
        }
      } catch (error) {
        result.failureCount++;
        result.errors.push({
          index: i,
          message: getErrorMessage(error),
        });
      }
    }

    return result;
  }

  /**
   * Xuất câu hỏi ra định dạng LaTeX, JSON hoặc Excel
   */
  @Get('export')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Xuất câu hỏi ra định dạng LaTeX, JSON hoặc Excel' })
  @ApiQuery({ name: 'format', enum: ['latex', 'json', 'excel'], required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về file hoặc dữ liệu chứa câu hỏi đã xuất',
  })
  async exportQuestions(
    @Query() exportDto: QuestionExportDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Lấy danh sách câu hỏi theo điều kiện lọc
      let questions = [];

      if (exportDto.questionIds && exportDto.questionIds.length > 0) {
        // Lấy câu hỏi theo ID
        for (const id of exportDto.questionIds) {
          try {
            const question = await this.questionsService.findById(id);
            if (question) {
              questions.push(question);
            }
          } catch (error) {
            // Bỏ qua câu hỏi không tìm thấy
          }
        }
      } else {
        // Lấy câu hỏi theo filter
        const filterDto = {
          tags: exportDto.tags,
          types: exportDto.types,
          limit: 1000, // Giới hạn số câu hỏi xuất ra
        };

        const result = await this.questionsService.findAll(filterDto);
        // Kiểm tra và xử lý kết quả trả về từ service
        if (result && typeof result === 'object' && 'questions' in result) {
          // Nếu kết quả là object có thuộc tính questions
          questions = Array.isArray(result.questions) ? result.questions : [];
        } else if (Array.isArray(result)) {
          // Nếu kết quả trực tiếp là mảng
          questions = result;
        } else {
          // Trường hợp khác, khởi tạo mảng rỗng
          questions = [];
        }
      }

      if (questions.length === 0) {
        throw new NotFoundException('Không tìm thấy câu hỏi nào phù hợp với tiêu chí');
      }

      // Xử lý định dạng xuất
      switch (exportDto.format) {
        case 'latex': {
          // Biến chứa nội dung LaTeX
          let latexContent = '\\documentclass{article}\n';
          latexContent += '\\usepackage{amsmath,amssymb}\n';
          latexContent += '\\usepackage{enumerate}\n';
          latexContent += '\\begin{document}\n\n';

          // Tạo nội dung LaTeX từ các câu hỏi
          questions.forEach(question => {
            // Sử dụng rawContent nếu có, nếu không thì tạo LaTeX từ dữ liệu
            if (question.rawContent) {
              latexContent += question.rawContent + '\n\n';
            } else {
              // Triển khai tạo LaTeX từ dữ liệu
              latexContent += `% Câu hỏi ID: ${question.id}\n`;

              // Thêm metadata
              if (question.questionId) {
                latexContent += `% Question ID: ${question.questionId}\n`;
              }

              // Thêm thông tin về câu hỏi
              latexContent += `\\begin{problem}`;

              if (question.difficultyLevel) {
                latexContent += `[${question.difficultyLevel}]`;
              }

              latexContent += `\n${question.content}\n`;

              // Xử lý các lựa chọn dựa trên loại câu hỏi
              if (question.type === 'MULTIPLE_CHOICE' && Array.isArray(question.options)) {
                latexContent += `\\begin{choices}\n`;
                question.options.forEach(option => {
                  const marker = option.isCorrect ? 'choice*' : 'choice';
                  latexContent += `\\${marker} ${option.content}\n`;
                });
                latexContent += `\\end{choices}\n`;
              } else if (question.type === 'FILL_IN_BLANK' && question.correctAnswers) {
                latexContent += `\\fillin{${question.correctAnswers}}\n`;
              }

              // Thêm giải thích nếu có
              if (question.explanation) {
                latexContent += `\\begin{solution}\n${question.explanation}\n\\end{solution}\n`;
              }

              latexContent += `\\end{problem}\n\n`;
            }
          });

          // Kết thúc tài liệu LaTeX
          latexContent += '\\end{document}';

          // Trả về file LaTeX
          res.set({
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment; filename="questions.tex"',
          });
          res.send(latexContent);
          break;
        }

        case 'json': {
          // Xuất ra file JSON
          const jsonContent = questions.map(question => {
            const result = {
              id: question.id,
              content: question.content,
              type: question.type,
              questionId: question.questionId,
              subcount: question.subcount,
              source: question.source,
              answers: question.answers,
              solution: question.solution,
            };

            if (!exportDto.includeSolution) {
              delete result.solution;
            }

            return result;
          });

          res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="questions.json"',
          });
          res.json(jsonContent);
          break;
        }

        case 'excel': {
          // Triển khai xuất Excel
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Questions');

          // Thiết lập tiêu đề cột
          worksheet.columns = [
            { header: 'ID', key: 'id', width: 36 },
            { header: 'Mã câu hỏi', key: 'questionId', width: 20 },
            { header: 'Nội dung', key: 'content', width: 60 },
            { header: 'Loại câu hỏi', key: 'type', width: 15 },
            { header: 'Độ khó', key: 'difficulty', width: 12 },
            { header: 'Nguồn', key: 'source', width: 20 },
            { header: 'Đáp án đúng', key: 'correctAnswers', width: 30 },
          ];

          // Thêm dòng giải thích nếu được yêu cầu
          if (exportDto.includeSolution) {
            worksheet.columns.push({ header: 'Giải thích', key: 'explanation', width: 60 });
          }

          // Thêm dữ liệu vào worksheet
          questions.forEach(question => {
            interface QuestionRow {
              id: string;
              questionId: string;
              content: string;
              type: string;
              difficulty: string;
              source: string;
              correctAnswers: string;
              explanation?: string;
            }

            const row: QuestionRow = {
              id: question.id,
              questionId: question.questionId || '',
              content: question.content,
              type: question.type,
              difficulty: question.difficulty || '',
              source: question.source || '',
              correctAnswers: ''
            };

            // Xử lý đáp án đúng
            if (question.type === 'MULTIPLE_CHOICE' && question.options) {
              // Đối với câu hỏi trắc nghiệm, hiển thị các lựa chọn đúng
              interface QuestionOption {
                isCorrect: boolean;
                content: string;
              }

              const correctOptions = question.options
                .filter((option: QuestionOption) => option.isCorrect)
                .map((option: QuestionOption) => option.content);
              row.correctAnswers = correctOptions.join('; ');
            } else if (question.correctAnswers) {
              // Đối với các loại câu hỏi khác
              if (Array.isArray(question.correctAnswers)) {
                row.correctAnswers = question.correctAnswers.join('; ');
              } else {
                row.correctAnswers = question.correctAnswers;
              }
            }

            // Thêm giải thích nếu được yêu cầu
            if (exportDto.includeSolution) {
              row.explanation = question.explanation || '';
            }

            worksheet.addRow(row);
          });

          // Định dạng tiêu đề
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

          // Trả về file Excel
          res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="questions.xlsx"',
          });

          await workbook.xlsx.write(res);
          res.end();
          break;
        }

        default:
          throw new BadRequestException('Định dạng xuất không được hỗ trợ');
      }
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: getErrorMessage(error) || 'Lỗi khi xuất câu hỏi',
      });
    }
  }
}
