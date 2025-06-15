import { Controller, Post, Body, Get, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LaTeXRendererService } from '../services/latex-renderer.service';
import { Response } from 'express';

@ApiTags('latex-renderer')
@Controller('latex-renderer')
export class LaTeXRendererController {
  private readonly logger = new Logger(LaTeXRendererController.name);

  constructor(private readonly latexRendererService: LaTeXRendererService) {}

  @Post('render-html')
  @ApiOperation({ summary: 'Chuyển đổi LaTeX sang HTML' })
  @ApiBody({
    description: 'Nội dung LaTeX cần chuyển đổi',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: '\\begin{ex}Nội dung câu hỏi\\end{ex}'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'HTML đã chuyển đổi' })
  async renderToHTML(@Body() body: { content: string }): Promise<{ html: string }> {
    try {
      const html = await this.latexRendererService.renderToHTML(body.content);
      return { html };
    } catch (error) {
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang HTML: ${(error as Error).message}`);
      throw error;
    }
  }

  @Post('render-text')
  @ApiOperation({ summary: 'Chuyển đổi LaTeX sang văn bản thuần túy' })
  @ApiBody({
    description: 'Nội dung LaTeX cần chuyển đổi',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: '\\begin{ex}Nội dung câu hỏi\\end{ex}'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Văn bản thuần túy đã chuyển đổi' })
  async renderToPlainText(@Body() body: { content: string }): Promise<{ text: string }> {
    try {
      const text = await this.latexRendererService.renderToPlainText(body.content);
      return { text };
    } catch (error) {
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang văn bản thuần túy: ${(error as Error).message}`);
      throw error;
    }
  }

  @Post('render-pdf')
  @ApiOperation({ summary: 'Chuyển đổi LaTeX sang PDF' })
  @ApiBody({
    description: 'Nội dung LaTeX cần chuyển đổi',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          example: '\\begin{ex}Nội dung câu hỏi\\end{ex}'
        },
        filename: {
          type: 'string',
          example: 'question.pdf'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'PDF đã chuyển đổi' })
  async renderToPDF(
    @Body() body: { content: string; filename?: string },
    @Res() res: Response
  ): Promise<void> {
    try {
      const pdfBuffer = await this.latexRendererService.renderToPDF(body.content);
      const filename = body.filename || 'question.pdf';
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      this.logger.error(`Lỗi khi chuyển đổi LaTeX sang PDF: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Không thể chuyển đổi LaTeX sang PDF',
        error: (error as Error).message
      });
    }
  }

  @Get('preview')
  @ApiOperation({ summary: 'Xem trước nội dung LaTeX dưới dạng HTML' })
  @ApiQuery({
    name: 'content',
    description: 'Nội dung LaTeX cần xem trước',
    required: true,
    type: String
  })
  @ApiResponse({ status: 200, description: 'HTML preview' })
  async previewHTML(@Query('content') content: string, @Res() res: Response): Promise<void> {
    try {
      const html = await this.latexRendererService.renderToHTML(content);
      
      // Trả về HTML để hiển thị trực tiếp trong trình duyệt
      res.setHeader('Content-Type', 'text/html');
      res.status(HttpStatus.OK).send(html);
    } catch (error) {
      this.logger.error(`Lỗi khi xem trước LaTeX: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Không thể xem trước LaTeX',
        error: (error as Error).message
      });
    }
  }
} 
