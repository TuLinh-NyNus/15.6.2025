import { Controller, Post, Body, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { QuestionService } from '../services/question.service';
import { getErrorMessage } from '../../../common/utils/error.utils';

/**
 * Controller xử lý các API liên quan đến phân tích LaTeX
 */
@ApiTags('LaTeX Parser')
@Controller('latex-parser')
export class LaTeXParserController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * Phân tích nội dung LaTeX
   */
  @ApiOperation({ summary: 'Phân tích nội dung LaTeX thành đối tượng Question' })
  @ApiBody({
    description: 'Nội dung LaTeX cần phân tích',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Nội dung LaTeX',
          example: '\\begin{ex}Câu hỏi LaTeX\\end{ex}'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết quả phân tích nội dung LaTeX',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Lỗi khi phân tích nội dung LaTeX',
  })
  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parseLatex(@Body() body: { content: string }) {
    if (!body.content) {
      throw new BadRequestException('Nội dung LaTeX không được để trống');
    }

    try {
      return await this.questionService.parseLatexContent(body.content);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi phân tích nội dung LaTeX: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Xác thực cú pháp LaTeX
   */
  @ApiOperation({ summary: 'Xác thực cú pháp LaTeX' })
  @ApiBody({
    description: 'Nội dung LaTeX cần xác thực',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Nội dung LaTeX',
          example: '\\begin{ex}Câu hỏi LaTeX\\end{ex}'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết quả xác thực cú pháp LaTeX',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Lỗi khi xác thực cú pháp LaTeX',
  })
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateLatex(@Body() body: { content: string }) {
    if (!body.content) {
      throw new BadRequestException('Nội dung LaTeX không được để trống');
    }

    try {
      return await this.questionService.validateLatexSyntax(body.content);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi xác thực cú pháp LaTeX: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Tạo câu hỏi từ nội dung LaTeX
   */
  @ApiOperation({ summary: 'Tạo câu hỏi từ nội dung LaTeX' })
  @ApiBody({
    description: 'Nội dung LaTeX và ID bài thi',
    schema: {
      type: 'object',
      properties: {
        examId: {
          type: 'string',
          description: 'ID của bài thi',
          example: '1234567890'
        },
        content: {
          type: 'string',
          description: 'Nội dung LaTeX',
          example: '\\begin{ex}Câu hỏi LaTeX\\end{ex}'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Câu hỏi đã được tạo',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Lỗi khi tạo câu hỏi từ LaTeX',
  })
  @Post('create-question')
  @HttpCode(HttpStatus.CREATED)
  async createQuestionFromLatex(@Body() body: { examId: string; content: string }) {
    if (!body.content) {
      throw new BadRequestException('Nội dung LaTeX không được để trống');
    }

    if (!body.examId) {
      throw new BadRequestException('ID bài thi không được để trống');
    }

    try {
      return await this.questionService.createQuestionFromLatex(body.examId, body.content);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo câu hỏi từ LaTeX: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Tạo nhiều câu hỏi từ nhiều nội dung LaTeX
   */
  @ApiOperation({ summary: 'Tạo nhiều câu hỏi từ nhiều nội dung LaTeX' })
  @ApiBody({
    description: 'Danh sách nội dung LaTeX và ID bài thi',
    schema: {
      type: 'object',
      properties: {
        examId: {
          type: 'string',
          description: 'ID của bài thi',
          example: '1234567890'
        },
        contents: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Danh sách nội dung LaTeX',
          example: ['\\begin{ex}Câu hỏi 1\\end{ex}', '\\begin{ex}Câu hỏi 2\\end{ex}']
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Các câu hỏi đã được tạo',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Lỗi khi tạo nhiều câu hỏi từ LaTeX',
  })
  @Post('create-questions')
  @HttpCode(HttpStatus.CREATED)
  async createManyQuestionsFromLatex(@Body() body: { examId: string; contents: string[] }) {
    if (!body.contents || !Array.isArray(body.contents) || body.contents.length === 0) {
      throw new BadRequestException('Danh sách nội dung LaTeX không hợp lệ');
    }

    if (!body.examId) {
      throw new BadRequestException('ID bài thi không được để trống');
    }

    try {
      return await this.questionService.createManyQuestionsFromLatex(body.examId, body.contents);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo nhiều câu hỏi từ LaTeX: ${getErrorMessage(error)}`);
    }
  }
} 
