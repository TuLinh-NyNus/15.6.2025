import { extractAnswersFromLatex } from '../question-answer-extractor';
import { QuestionTypeEnum } from '../latex-parser';

// Mock cho hàm extractFromLatex
jest.mock('../latex-parser', () => ({
  extractFromLatex: jest.fn(),
  QuestionTypeEnum: {
    MC: 'MC',
    TF: 'TF',
    SA: 'SA',
    ES: 'ES',
    MA: 'MA'
  }
}));

// Import sau khi mock
import { extractFromLatex } from '../latex-parser';

describe('Question Answer Extractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractAnswersFromLatex', () => {
    it('should extract answers and correctAnswer for multiple-choice questions', () => {
      // Mock kết quả trả về từ extractFromLatex
      (extractFromLatex as jest.Mock).mockReturnValue({
        type: 'multiple-choice',
        answers: [
          { id: '1', content: 'Đáp án 1', isCorrect: false },
          { id: '2', content: 'Đáp án 2', isCorrect: false },
          { id: '3', content: 'Đáp án 3', isCorrect: true },
          { id: '4', content: 'Đáp án 4', isCorrect: false }
        ],
        correctAnswer: 'Đáp án 3'
      });

      const result = extractAnswersFromLatex('\\begin{ex}\\choice{Đáp án 1}{Đáp án 2}{\\True Đáp án 3}{Đáp án 4}\\end{ex}');

      expect(result).toEqual({
        answers: ['Đáp án 1', 'Đáp án 2', 'Đáp án 3', 'Đáp án 4'],
        correctAnswer: 'Đáp án 3'
      });
    });

    it('should extract answers and correctAnswer for true-false questions', () => {
      // Mock kết quả trả về từ extractFromLatex
      (extractFromLatex as jest.Mock).mockReturnValue({
        type: 'true-false',
        answers: [
          { id: '1', content: 'Đáp án 1', isCorrect: true },
          { id: '2', content: 'Đáp án 2', isCorrect: false },
          { id: '3', content: 'Đáp án 3', isCorrect: true },
          { id: '4', content: 'Đáp án 4', isCorrect: false }
        ],
        correctAnswer: ['Đáp án 1', 'Đáp án 3']
      });

      const result = extractAnswersFromLatex('\\begin{ex}\\choiceTF{\\True Đáp án 1}{Đáp án 2}{\\True Đáp án 3}{Đáp án 4}\\end{ex}');

      expect(result).toEqual({
        answers: ['Đáp án 1', 'Đáp án 2', 'Đáp án 3', 'Đáp án 4'],
        correctAnswer: ['Đáp án 1', 'Đáp án 3']
      });
    });

    it('should extract correctAnswer for short-answer questions', () => {
      // Mock kết quả trả về từ extractFromLatex
      (extractFromLatex as jest.Mock).mockReturnValue({
        type: 'short-answer',
        answers: [],
        correctAnswer: 'Đáp án đúng'
      });

      const result = extractAnswersFromLatex('\\begin{ex}\\shortans{Đáp án đúng}\\end{ex}');

      expect(result).toEqual({
        answers: null,
        correctAnswer: 'Đáp án đúng'
      });
    });

    it('should return null for essay questions', () => {
      // Mock kết quả trả về từ extractFromLatex
      (extractFromLatex as jest.Mock).mockReturnValue({
        type: 'essay',
        answers: [],
        correctAnswer: null
      });

      const result = extractAnswersFromLatex('\\begin{ex}Câu hỏi tự luận\\end{ex}');

      expect(result).toEqual({
        answers: null,
        correctAnswer: null
      });
    });
  });

  // TODO: Add tests for prepareAnswersForDatabase and prepareAnswersForForm when they are implemented
});
