import { Test, TestingModule } from '@nestjs/testing';
import { LaTeXParserService } from '../../../../../src/modules/exams/services/latex-parser.service';
import { Logger } from '@nestjs/common';

describe('LaTeXParserService', () => {
  let service: LaTeXParserService;

  // Mock data cho các test cases
  const basicMCQuestion = `
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

  const basicTFQuestion = `
    \\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
      [TL.100023]
      Câu hỏi trắc nghiệm nhiều lựa chọn
      \\choiceTF
      {\\True đáp án 1}
      { đáp án 2}
      {\\True đáp án 3}
      { đáp án 4}
      \\loigiai{
        Lời giải của câu hỏi
      }
    \\end{ex}
  `;

  const basicSAQuestion = `
    \\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
      [TL.100024]
      Câu hỏi trả lời ngắn
      \\shortans{'10'}
      \\loigiai{
        Lời giải của câu hỏi
      }
    \\end{ex}
  `;

  const basicESQuestion = `
    \\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]
      [TL.100025]
      Câu hỏi tự luận
      \\loigiai{
        Lời giải của câu hỏi
      }
    \\end{ex}
  `;

  const complexMathQuestion = `
    \\begin{ex}%[Nguồn: "Sách giáo khoa"]%[2M3C2-1]
      [TL.200123]
      Tính đạo hàm của hàm số $f(x) = \\frac{x^2 + 1}{x - 2}$
      \\choice
      { $f'(x) = \\frac{2x(x-2) - (x^2+1)}{(x-2)^2}$}
      { $f'(x) = \\frac{2x(x-2) + (x^2+1)}{(x-2)^2}$}
      {\\True $f'(x) = \\frac{2x(x-2) - (x^2+1)}{(x-2)^2}$}
      { $f'(x) = \\frac{2x}{(x-2)^2}$}
      \\loigiai{
        Ta có $f(x) = \\frac{u(x)}{v(x)}$ với $u(x) = x^2 + 1$ và $v(x) = x - 2$. 
        Áp dụng công thức đạo hàm của thương: $f'(x) = \\frac{u'(x)v(x) - u(x)v'(x)}{v^2(x)}$
        
        Ta có $u'(x) = 2x$ và $v'(x) = 1$
        
        Thay vào công thức: $f'(x) = \\frac{2x(x-2) - (x^2+1)(1)}{(x-2)^2} = \\frac{2x(x-2) - (x^2+1)}{(x-2)^2}$
      }
    \\end{ex}
  `;

  const missingBracketQuestion = `
    \\begin{ex}%[Nguồn: "Đề thi thử"]%[1P1V1-6]
      [TL.100026]
      Câu hỏi thiếu dấu ngoặc
      \\choice
      { đáp án 1
      { đáp án 2}
      {\\True đáp án 3}
      { đáp án 4}
      \\loigiai{
        Lời giải của câu hỏi
      }
    \\end{ex}
  `;

  const missingEnvironmentQuestion = `
    \\begin{ex}%[Nguồn: "Đề thi thử"]%[1P1V1-6]
      [TL.100027]
      Câu hỏi thiếu môi trường kết thúc
      \\choice
      { đáp án 1}
      { đáp án 2}
      {\\True đáp án 3}
      { đáp án 4}
      \\loigiai{
        Lời giải của câu hỏi
      }
  `;

  const emptyQuestion = '';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaTeXParserService,
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

    service = module.get<LaTeXParserService>(LaTeXParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 1. Test các trường hợp cơ bản
  describe('Basic test cases', () => {
    describe('parseQuestion', () => {
      it('should parse MC question correctly', async () => {
        const result = await service.parseQuestion(basicMCQuestion);
        
        expect(result).toBeDefined();
        expect(result.type).toBe('MC');
        expect(result.questionId).toBe('1P1V1-6');
        expect(result.subcount).toEqual({
          prefix: 'TL',
          number: '100022',
          fullId: 'TL.100022'
        });
        expect(result.answers).toHaveLength(4);
        expect(result.correctAnswer).toBe('đáp án 3');
        expect(result.solutions).toHaveLength(1);
      });

      it('should parse TF question correctly', async () => {
        const result = await service.parseQuestion(basicTFQuestion);
        
        expect(result).toBeDefined();
        expect(result.type).toBe('TF');
        expect(result.questionId).toBe('1P1V1-6');
        expect(result.subcount).toEqual({
          prefix: 'TL',
          number: '100023',
          fullId: 'TL.100023'
        });
        expect(result.answers).toHaveLength(4);
        expect(Array.isArray(result.correctAnswer)).toBe(true);
        expect(result.correctAnswer).toContain('đáp án 1');
        expect(result.correctAnswer).toContain('đáp án 3');
        expect(result.solutions).toHaveLength(1);
      });

      it('should parse SA question correctly', async () => {
        const result = await service.parseQuestion(basicSAQuestion);
        
        expect(result).toBeDefined();
        expect(result.type).toBe('SA');
        expect(result.questionId).toBe('1P1V1-6');
        expect(result.subcount).toEqual({
          prefix: 'TL',
          number: '100024',
          fullId: 'TL.100024'
        });
        expect(result.correctAnswer).toBe('10');
        expect(result.solutions).toHaveLength(1);
      });

      it('should parse ES question correctly', async () => {
        const result = await service.parseQuestion(basicESQuestion);
        
        expect(result).toBeDefined();
        expect(result.type).toBe('ES');
        expect(result.questionId).toBe('1P1V1-6');
        expect(result.subcount).toEqual({
          prefix: 'TL',
          number: '100025',
          fullId: 'TL.100025'
        });
        expect(result.solutions).toHaveLength(1);
      });
    });

    describe('extractQuestionId', () => {
      it('should extract question ID correctly', async () => {
        const result = await service.extractQuestionId(basicMCQuestion);
        expect(result).toBe('1P1V1-6');
      });

      it('should return null if no question ID found', async () => {
        const questionWithoutID = `
          \\begin{ex}
            Câu hỏi không có ID
            \\choice
            { đáp án 1}
            { đáp án 2}
            {\\True đáp án 3}
            { đáp án 4}
          \\end{ex}
        `;
        const result = await service.extractQuestionId(questionWithoutID);
        expect(result).toBeNull();
      });
    });

    describe('extractSubcount', () => {
      it('should extract subcount correctly', async () => {
        const result = await service.extractSubcount(basicMCQuestion);
        expect(result).toEqual({
          prefix: 'TL',
          number: '100022',
          fullId: 'TL.100022'
        });
      });

      it('should return null if no subcount found', async () => {
        const questionWithoutSubcount = `
          \\begin{ex}%[1P1V1-6]
            Câu hỏi không có subcount
            \\choice
            { đáp án 1}
            { đáp án 2}
            {\\True đáp án 3}
            { đáp án 4}
          \\end{ex}
        `;
        const result = await service.extractSubcount(questionWithoutSubcount);
        expect(result).toBeNull();
      });
    });

    describe('identifyQuestionType', () => {
      it('should identify MC question type correctly', async () => {
        const result = await service.identifyQuestionType(basicMCQuestion);
        expect(result).toBe('MC');
      });

      it('should identify TF question type correctly', async () => {
        const result = await service.identifyQuestionType(basicTFQuestion);
        expect(result).toBe('TF');
      });

      it('should identify SA question type correctly', async () => {
        const result = await service.identifyQuestionType(basicSAQuestion);
        expect(result).toBe('SA');
      });

      it('should identify ES question type correctly', async () => {
        const result = await service.identifyQuestionType(basicESQuestion);
        expect(result).toBe('ES');
      });
    });
  });

  // 2. Test các trường hợp đặc biệt và edge cases
  describe('Edge cases and special scenarios', () => {
    describe('validateSyntax', () => {
      it('should validate correct syntax', async () => {
        const result = await service.validateSyntax(basicMCQuestion);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect missing brackets', async () => {
        const result = await service.validateSyntax(missingBracketQuestion);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(error => error.includes('ngoặc'))).toBe(true);
      });

      it('should detect missing environment', async () => {
        const result = await service.validateSyntax(missingEnvironmentQuestion);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(error => error.includes('môi trường') || error.includes('environment'))).toBe(true);
      });

      it('should handle empty input', async () => {
        const result = await service.validateSyntax(emptyQuestion);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateQuestionStructure', () => {
      it('should validate correct MC question structure', async () => {
        const result = await service.validateQuestionStructure(basicMCQuestion);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate correct TF question structure', async () => {
        const result = await service.validateQuestionStructure(basicTFQuestion);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate correct SA question structure', async () => {
        const result = await service.validateQuestionStructure(basicSAQuestion);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate correct ES question structure', async () => {
        const result = await service.validateQuestionStructure(basicESQuestion);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle malformed question structure', async () => {
        const malformedQuestion = `
          \\begin{ex}%[1P1V1-6]
            [TL.100028]
            Câu hỏi cấu trúc không đúng
            \\choice
            {\\True đáp án 1}
            Thiếu các đáp án khác
            \\loigiai{
              Lời giải của câu hỏi
            }
          \\end{ex}
        `;
        const result = await service.validateQuestionStructure(malformedQuestion);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('suggestCorrections', () => {
      it('should suggest corrections for missing brackets', async () => {
        const result = await service.suggestCorrections(missingBracketQuestion);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].original).toBeDefined();
        expect(result[0].suggested).toBeDefined();
        expect(result[0].explanation).toBeDefined();
      });

      it('should suggest corrections for missing environment', async () => {
        const result = await service.suggestCorrections(missingEnvironmentQuestion);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].original).toBeDefined();
        expect(result[0].suggested).toBeDefined();
        expect(result[0].explanation).toBeDefined();
      });
    });

    describe('extractContent', () => {
      it('should handle questions with math formulas', async () => {
        const result = await service.extractContent(complexMathQuestion);
        expect(result).toBeDefined();
        expect(result.includes('Tính đạo hàm')).toBe(true);
      });
    });

    describe('extractCorrectAnswers', () => {
      it('should extract single correct answer from MC question', async () => {
        const result = await service.extractCorrectAnswers(basicMCQuestion);
        expect(result).toBe('đáp án 3');
      });

      it('should extract multiple correct answers from TF question', async () => {
        const result = await service.extractCorrectAnswers(basicTFQuestion);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toContain('đáp án 1');
        expect(result).toContain('đáp án 3');
      });

      it('should handle question with no correct answers', async () => {
        const noCorrectAnswerQuestion = `
          \\begin{ex}%[1P1V1-6]
            [TL.100029]
            Câu hỏi không có đáp án đúng
            \\choice
            { đáp án 1}
            { đáp án 2}
            { đáp án 3}
            { đáp án 4}
          \\end{ex}
        `;
        const result = await service.extractCorrectAnswers(noCorrectAnswerQuestion);
        expect(result).toEqual([]);
      });
    });
  });

  // 3. Test hiệu năng với câu hỏi phức tạp
  describe('Performance with complex questions', () => {
    it('should parse complex math question in reasonable time', async () => {
      const startTime = Date.now();
      
      const result = await service.parseQuestion(complexMathQuestion);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.type).toBe('MC');
      expect(executionTime).toBeLessThan(1000); // Dưới 1 giây
    });

    it('should validate complex math question syntax in reasonable time', async () => {
      const startTime = Date.now();
      
      const result = await service.validateSyntax(complexMathQuestion);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(result.isValid).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Dưới 1 giây
    });

    it('should handle a large number of answers efficiently', async () => {
      const manyAnswersQuestion = `
        \\begin{ex}%[Nguồn: "Đề thi thử"]%[1P1V1-6]
          [TL.100030]
          Câu hỏi với nhiều đáp án
          \\choice
          { đáp án 1}
          { đáp án 2}
          { đáp án 3}
          { đáp án 4}
          { đáp án 5}
          { đáp án 6}
          { đáp án 7}
          { đáp án 8}
          {\\True đáp án 9}
          { đáp án 10}
          \\loigiai{
            Lời giải của câu hỏi
          }
        \\end{ex}
      `;
      
      const startTime = Date.now();
      
      const result = await service.extractAnswers(manyAnswersQuestion);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(result).toHaveLength(10);
      expect(executionTime).toBeLessThan(1000); // Dưới 1 giây
    });

    it('should handle a very long question content efficiently', async () => {
      // Tạo một câu hỏi dài
      let longContent = '\\begin{ex}%[Nguồn: "Đề thi thử"]%[1P1V1-6]\n[TL.100031]\n';
      longContent += 'Đây là một câu hỏi rất dài với nhiều nội dung và đoạn văn. ';
      
      // Thêm nhiều nội dung
      for (let i = 0; i < 50; i++) {
        longContent += `Đây là đoạn văn thứ ${i + 1} của câu hỏi. Nó chứa nhiều thông tin và từ ngữ để tạo ra một câu hỏi dài. `;
      }
      
      // Thêm phần đáp án và lời giải
      longContent += `
        \\choice
        { đáp án 1 rất dài với nhiều nội dung và giải thích}
        { đáp án 2 rất dài với nhiều nội dung và giải thích}
        {\\True đáp án 3 rất dài với nhiều nội dung và giải thích}
        { đáp án 4 rất dài với nhiều nội dung và giải thích}
        \\loigiai{
          Lời giải rất dài với nhiều bước giải thích chi tiết.
          Bước 1: ...
          Bước 2: ...
          Bước 3: ...
        }
      \\end{ex}
      `;
      
      const startTime = Date.now();
      
      const result = await service.parseQuestion(longContent);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(result.type).toBe('MC');
      expect(executionTime).toBeLessThan(2000); // Dưới 2 giây
    });
  });
}); 