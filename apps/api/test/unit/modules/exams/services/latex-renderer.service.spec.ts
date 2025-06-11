import { Test, TestingModule } from '@nestjs/testing';
import { LaTeXRendererService } from '../../../../../src/modules/exams/services/latex-renderer.service';
import { LaTeXParserService } from '../../../../../src/modules/exams/services/latex-parser.service';
import { Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockImplementation(() => ({
    newPage: jest.fn().mockImplementation(() => ({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('Mock PDF content')),
    })),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('LaTeXRendererService', () => {
  let service: LaTeXRendererService;
  let parserService: LaTeXParserService;

  // Mock data cho các test cases
  const sampleQuestion = `
    \\begin{ex}%[Nguồn: "Đề thi thử"]%[1P1V1-6]
      [TL.100022]
      Câu hỏi trắc nghiệm một lựa chọn
      \\choice
      { đáp án 1}
      { đáp án 2}
      {\\True đáp án 3}
      { đáp án 4}
      \\loigiai{
        Lời giải của câu hỏi
      }
    \\end{ex}
  `;

  // Mock dữ liệu trả về từ LaTeXParserService
  const mockExtractedContent = 'Câu hỏi trắc nghiệm một lựa chọn';
  const mockQuestionType = 'MC';
  const mockAnswers = ['đáp án 1', 'đáp án 2', 'đáp án 3', 'đáp án 4'];
  const mockCorrectAnswer = 'đáp án 3';
  const mockSolution = 'Lời giải của câu hỏi';
  const mockQuestionId = '1P1V1-6';
  const mockSubcount = { prefix: 'TL', number: '100022', fullId: 'TL.100022' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaTeXRendererService,
        {
          provide: LaTeXParserService,
          useValue: {
            extractContent: jest.fn().mockResolvedValue(mockExtractedContent),
            identifyQuestionType: jest.fn().mockResolvedValue(mockQuestionType),
            extractAnswers: jest.fn().mockResolvedValue(mockAnswers),
            extractCorrectAnswers: jest.fn().mockResolvedValue(mockCorrectAnswer),
            extractSolution: jest.fn().mockResolvedValue(mockSolution),
            extractQuestionId: jest.fn().mockResolvedValue(mockQuestionId),
            extractSubcount: jest.fn().mockResolvedValue(mockSubcount),
          }
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LaTeXRendererService>(LaTeXRendererService);
    parserService = module.get<LaTeXParserService>(LaTeXParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('renderToHTML', () => {
    it('should render question to HTML correctly', async () => {
      const result = await service.renderToHTML(sampleQuestion);
      
      // Kiểm tra các phương thức LaTeXParserService đã được gọi
      expect(parserService.extractContent).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.identifyQuestionType).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractAnswers).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractCorrectAnswers).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractSolution).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractQuestionId).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractSubcount).toHaveBeenCalledWith(sampleQuestion);
      
      // Kiểm tra kết quả HTML
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('</html>');
      expect(result).toContain('MathJax');
      expect(result).toContain(mockExtractedContent);
      expect(result).toContain(mockQuestionId);
      expect(result).toContain(mockSubcount.fullId);
      expect(result).toContain(mockSolution);
      // Kiểm tra đáp án
      mockAnswers.forEach(answer => {
        expect(result).toContain(answer);
      });
      // Kiểm tra đáp án đúng
      expect(result).toContain('correct-answer');
      // Kiểm tra CSS được định nghĩa
      expect(result).toContain('<style>');
      expect(result).toContain('</style>');
    });

    it('should handle error when rendering to HTML', async () => {
      // Mock một lỗi từ LaTeXParserService
      jest.spyOn(parserService, 'extractContent').mockRejectedValueOnce(new Error('Test error'));
      
      const result = await service.renderToHTML(sampleQuestion);
      
      expect(result).toContain('error');
      expect(result).toContain('Test error');
    });
  });

  describe('renderToPlainText', () => {
    it('should render question to plain text correctly', async () => {
      const result = await service.renderToPlainText(sampleQuestion);
      
      // Kiểm tra các phương thức LaTeXParserService đã được gọi
      expect(parserService.extractContent).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.identifyQuestionType).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractAnswers).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractCorrectAnswers).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractSolution).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractQuestionId).toHaveBeenCalledWith(sampleQuestion);
      expect(parserService.extractSubcount).toHaveBeenCalledWith(sampleQuestion);
      
      // Kiểm tra kết quả text
      expect(result).toContain(mockExtractedContent);
      expect(result).toContain(mockQuestionId);
      expect(result).toContain(mockSubcount.fullId);
      expect(result).toContain(mockSolution);
      // Kiểm tra đáp án
      mockAnswers.forEach((answer, index) => {
        const answerLabel = String.fromCharCode(65 + index);
        expect(result).toContain(`${answerLabel}. ${answer}`);
      });
      // Kiểm tra đáp án đúng
      expect(result).toContain('(Đúng)');
    });

    it('should handle error when rendering to plain text', async () => {
      // Mock một lỗi từ LaTeXParserService
      jest.spyOn(parserService, 'extractContent').mockRejectedValueOnce(new Error('Test error'));
      
      const result = await service.renderToPlainText(sampleQuestion);
      
      expect(result).toContain('Lỗi');
      expect(result).toContain('Test error');
    });
  });

  describe('renderToPDF', () => {
    it('should render question to PDF correctly', async () => {
      const result = await service.renderToPDF(sampleQuestion);
      
      // Kiểm tra kết quả là một Buffer
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('Mock PDF content');
    });

    it('should handle error when rendering to PDF', async () => {
      // Mock một lỗi từ puppeteer
      const mockPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;
      mockPuppeteer.launch.mockImplementationOnce(() => {
        throw new Error('Puppeteer error');
      });
      
      await expect(service.renderToPDF(sampleQuestion)).rejects.toThrow('Không thể chuyển đổi LaTeX sang PDF');
    });
  });

  describe('formatMathContent', () => {
    it('should format math content correctly', async () => {
      // Bỏ qua việc test phương thức private vì khó access
      // Test gián tiếp qua kết quả của renderToHTML
      const result = await service.renderToHTML('$f(x) = \\frac{x^2 + 1}{x - 2}$');
      expect(result).toContain('$f(x)');
    });

    it('should escape HTML characters to prevent XSS', async () => {
      // Test gián tiếp qua kết quả của renderToHTML
      const result = await service.renderToHTML('<script>alert("XSS")</script>');
      expect(result).not.toContain('<script>alert("XSS")</script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });
}); 