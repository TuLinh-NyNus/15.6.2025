import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IExamQuestionService, IExamRepository, IExamQuestionRepository } from '@project/interfaces';
import { Difficulty, QuestionDifficulty, QuestionType as ExamQuestionType, QuestionType as QuestionBankType, UserRole } from '@project/entities';
import { ExamFilterDto, QuestionFilterDto } from '@project/dto';
import { CreateExamQuestionDto, UpdateExamQuestionDto, QuestionOptionDto } from '@project/dto';
import { ExamQuestion, Exam } from '@project/database';
import { LaTeXParserService } from './latex-parser.service';
import { QuestionsService } from '../../questions/services/questions.service';
import { forwardRef, Inject } from '@nestjs/common';

/**
 * FIXME: TypeScript Errors
 * 
 * Trong file này có một số lỗi TypeScript do sự không tương thích giữa các kiểu dữ liệu:
 * 1. Không tương thích giữa "CreateExamQuestionDto" và "CreateQuestionDto".
 *    Trong file index.ts có một alias từ CreateQuestionDto sang CreateExamQuestionDto,
 *    nhưng cấu trúc của chúng khác nhau trong thực tế.
 * 2. Không tương thích giữa các loại dữ liệu trả về từ repository.
 *    Repository hoạt động với các kiểu dữ liệu khác với kiểu của service hiện tại.
 * 3. Không tương thích giữa kiểu dữ liệu questions trong CommonExam và ExamRepository.
 *
 * Cách xử lý lý tưởng:
 * - Điều chỉnh interfaces/types để thống nhất giữa các module
 * - Xóa bỏ alias trong index.ts và sử dụng các type rõ ràng
 * - Đảm bảo tính nhất quán của dữ liệu trả về từ repository
 *
 * Hiện tại, chúng ta đang sử dụng type casting để tạm thời giải quyết vấn đề.
 * Đây không phải là giải pháp tốt nhất và nên được xem xét lại sau.
 */

/**
 * Interface để xử lý dữ liệu từ ngân hàng câu hỏi
 */
interface QuestionDataType {
  id: string;
  content: string;
  type: QuestionBankType;
  difficulty: QuestionDifficulty;
  options?: {
    id: string;
    content: string;
    isCorrect: boolean;
  }[];
  correctAnswers?: string[] | string;
  explanation?: string;
}

/**
 * Interface để xử lý dữ liệu exam question
 * @deprecated Giữ lại để tham khảo và có thể sử dụng trong tương lai
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExamQuestionDataType {
  id: number;
  examId: string;
  content: string;
  type: string;
  score: number;
  options?: unknown;
  correctAnswers?: unknown;
  explanation?: string;
  difficultyLevel?: unknown;
  sourceQuestionId?: string;
}

/**
 * Interface mở rộng cho CreateQuestionDto để xử lý các trường bổ sung
 */
interface EnhancedCreateQuestionDto extends CreateExamQuestionDto {
  score?: number;
  options?: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  correctAnswers?: Array<string>;
}

/**
 * Interface cho đồng nhất dữ liệu Exam từ các package khác nhau
 */
interface CommonExam {
  id: string;
  title?: string;
  questions?: number[]; // Mảng các ID câu hỏi dạng số
  isPublished?: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}

@Injectable()
export class QuestionService implements IExamQuestionService {
  constructor(
    private readonly examRepository: IExamRepository,
    private readonly questionRepository: IExamQuestionRepository,
    private readonly latexParserService: LaTeXParserService,
    private readonly questionsService: QuestionsService,
    @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
  ) {}

  /**
   * Maps QuestionBankType to ExamQuestionType
   */
  private mapQuestionType(type: QuestionBankType): ExamQuestionType {
    const typeMapping: Record<string, string> = {
      [QuestionBankType.MC]: 'MULTIPLE_CHOICE',
      [QuestionBankType.TF]: 'TRUE_FALSE',
      [QuestionBankType.SA]: 'SHORT_ANSWER',
      [QuestionBankType.ES]: 'ESSAY'
    };
    
    const mappedType = typeMapping[type];
    if (!mappedType) {
      throw new BadRequestException(`Unsupported question type: ${type}`);
    }
    
    return mappedType as unknown as ExamQuestionType;
  }

  /**
   * Maps QuestionDifficulty to Difficulty
   */
  private mapDifficulty(difficulty: QuestionDifficulty): Difficulty {
    switch (difficulty) {
      case QuestionDifficulty.EASY:
        return Difficulty.EASY;
      case QuestionDifficulty.MEDIUM:
        return Difficulty.MEDIUM;
      case QuestionDifficulty.HARD:
        return Difficulty.HARD;
      default:
        throw new BadRequestException(`Unsupported difficulty level: ${difficulty}`);
    }
  }

  /**
   * Lấy tất cả câu hỏi của một bài thi
   * @param examId ID của bài thi
   * @returns Danh sách câu hỏi của bài thi
   */
  async getQuestionsByExamId(examId: string): Promise<ExamQuestion[]> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }

    const questions = [];
    
    // Chuyển đổi exam thành CommonExam để tránh xung đột kiểu
    const examData = exam as unknown as CommonExam;
    
    if (examData.questions && examData.questions.length > 0) {
      // Fetch all questions in parallel for performance
      const questionPromises = examData.questions.map((questionId) =>
        this.questionRepository.findById(questionId),
      );
      
      const questionResults = await Promise.all(questionPromises);
      
      // Filter out any null results in case some questions don't exist
      for (const question of questionResults) {
        if (question) {
          questions.push(question as ExamQuestion);
        }
      }
    }
    
    return questions;
  }

  /**
   * Lấy thông tin chi tiết câu hỏi theo ID
   * @param id ID của câu hỏi
   * @returns Câu hỏi nếu tìm thấy
   */
  async getQuestionById(id: number): Promise<ExamQuestion> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${id}`);
    }
    return question as ExamQuestion;
  }

  /**
   * Tạo câu hỏi mới cho bài thi
   * @param examId ID của bài thi
   * @param questionData Dữ liệu câu hỏi
   * @returns Câu hỏi đã tạo
   */
  async createQuestion(examId: string, questionData: CreateExamQuestionDto): Promise<ExamQuestion> {
    const examData = await this.examRepository.findById(examId);
    if (!examData) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }
    
    // Chuyển đổi exam thành CommonExam để tránh xung đột kiểu
    const exam = examData as unknown as CommonExam;
    
    // Validate cấu trúc câu hỏi
    this.validateQuestionData(questionData);
    
    // Thêm examId vào questionData
    const questionWithExamId = {
      ...questionData,
      examId
    } as EnhancedCreateQuestionDto;
    
    try {
      // Tạo câu hỏi mới
      const newQuestion = await this.questionRepository.create(questionWithExamId as unknown as Record<string, unknown>);
      
      // Cập nhật danh sách câu hỏi trong bài thi
      if (newQuestion && 'id' in (newQuestion as object)) {
        const questionId = (newQuestion as { id: number }).id;
        const currentQuestions = exam.questions || [];
        const updateData = { 
          questions: [...currentQuestions, questionId]
        } as Partial<Record<string, unknown>>;
        await this.examRepository.update(examId, updateData);
      }
      
      return newQuestion as ExamQuestion;
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo câu hỏi: ${error.message}`);
    }
  }

  /**
   * Tạo nhiều câu hỏi cùng lúc cho bài thi
   * @param examId ID của bài thi
   * @param questionsData Dữ liệu nhiều câu hỏi
   * @returns Danh sách câu hỏi đã tạo
   */
  async createManyQuestions(examId: string, questionsData: CreateExamQuestionDto[]): Promise<ExamQuestion[]> {
    const examData = await this.examRepository.findById(examId);
    if (!examData) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }
    
    // Chuyển đổi exam thành CommonExam để tránh xung đột kiểu
    const exam = examData as unknown as CommonExam;
    
    // Validate từng câu hỏi và thêm examId
    const questionsWithExamId = questionsData.map(question => {
      this.validateQuestionData(question);
      return {
        ...question,
        examId
      } as EnhancedCreateQuestionDto;
    });
    
    try {
      // Tạo nhiều câu hỏi 
      const newQuestions = await this.questionRepository.createMany(
        questionsWithExamId as unknown as Record<string, unknown>[]
      );
      
      // Cập nhật danh sách câu hỏi trong bài thi
      if (newQuestions && Array.isArray(newQuestions) && newQuestions.length > 0) {
        const newQuestionIds = newQuestions.map(q => 'id' in (q as object) ? (q as { id: number }).id : null).filter(id => id !== null);
        const currentQuestions = exam.questions || [];
        const updateData = { 
          questions: [...currentQuestions, ...newQuestionIds]
        } as Partial<Record<string, unknown>>;
        await this.examRepository.update(examId, updateData);
      }
      
      return newQuestions as ExamQuestion[];
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo nhiều câu hỏi: ${error.message}`);
    }
  }

  /**
   * Cập nhật câu hỏi
   * @param id ID câu hỏi
   * @param data Dữ liệu cập nhật
   * @returns Câu hỏi đã cập nhật
   */
  async updateQuestion(id: number, data: UpdateExamQuestionDto): Promise<ExamQuestion> {
    try {
      // Kiểm tra xem câu hỏi có tồn tại không
      const question = await this.questionRepository.findById(id);
      if (!question) {
        throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${id}`);
      }
      
      // Validate cấu trúc câu hỏi
      this.validateQuestionData({...(question as object), ...data});
      
      // Cập nhật câu hỏi
      const updatedQuestion = await this.questionRepository.update(id, data);
      return updatedQuestion as ExamQuestion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi cập nhật câu hỏi: ${error.message}`);
    }
  }

  /**
   * Xóa câu hỏi
   * @param id ID của câu hỏi
   * @returns true nếu xóa thành công
   */
  async deleteQuestion(id: number): Promise<boolean> {
    // Kiểm tra câu hỏi tồn tại
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${id}`);
    }
    
    try {
      // Xóa câu hỏi từ repository
      const deleted = await this.questionRepository.delete(id);
      
      // Cập nhật danh sách câu hỏi trong bài thi
      if (deleted) {
        // Lấy examId từ question (nếu có)
        if ('examId' in (question as object) && (question as { examId: string }).examId) {
          const examId = (question as { examId: string }).examId;
          const exam = await this.examRepository.findById(examId);
          
          if (exam) {
            // Chuyển đổi exam thành CommonExam để tránh xung đột kiểu
            const examData = exam as unknown as CommonExam;
            const updatedQuestions = (examData.questions || []).filter(
              qId => qId !== id
            );
            const updateData = { 
              questions: updatedQuestions
            } as Partial<Record<string, unknown>>;
            await this.examRepository.update(examId, updateData);
          }
        }
      }
      
      return deleted;
    } catch (error) {
      throw new BadRequestException(`Lỗi khi xóa câu hỏi: ${error.message}`);
    }
  }

  /**
   * Tìm câu hỏi theo độ khó
   * @param difficulty Độ khó
   * @returns Danh sách câu hỏi
   */
  async getQuestionsByDifficulty(difficulty: string): Promise<ExamQuestion[]> {
    // Kiểm tra độ khó hợp lệ
    if (!Object.values(Difficulty).includes(difficulty as Difficulty)) {
      throw new BadRequestException(`Độ khó không hợp lệ: ${difficulty}`);
    }
    
    try {
      // Tìm câu hỏi theo độ khó
      const questions = await this.questionRepository.findByDifficulty(difficulty);
      return questions.map(q => q as ExamQuestion);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tìm câu hỏi theo độ khó: ${error.message}`);
    }
  }

  /**
   * Tìm câu hỏi theo môn học
   * @param subject Môn học
   * @returns Danh sách câu hỏi
   */
  async getQuestionsBySubject(subject: string): Promise<ExamQuestion[]> {
    try {
      const questions = await this.questionRepository.findBySubject(subject);
      return questions.map(q => q as ExamQuestion);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tìm câu hỏi theo môn học: ${error.message}`);
    }
  }

  /**
   * Tìm câu hỏi theo tags
   * @param tags Danh sách tags
   * @returns Danh sách câu hỏi
   */
  async getQuestionsByTags(tags: string[]): Promise<ExamQuestion[]> {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      throw new BadRequestException('Tags không được để trống');
    }
    
    try {
      const questions = await this.questionRepository.findByTags(tags);
      return questions.map(q => q as ExamQuestion);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tìm câu hỏi theo tags: ${error.message}`);
    }
  }

  /**
   * Xáo trộn thứ tự các câu hỏi trong bài thi
   * @param examId ID của bài thi
   * @returns Danh sách câu hỏi đã xáo trộn
   */
  async shuffleQuestions(examId: string): Promise<ExamQuestion[]> {
    const questions = await this.getQuestionsByExamId(examId);
    
    // Fisher-Yates shuffle algorithm
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    return questions;
  }

  /**
   * Kiểm tra quyền truy cập câu hỏi
   * @param questionId ID của câu hỏi
   * @param userId ID của người dùng
   * @param roles Vai trò người dùng
   * @returns true nếu có quyền truy cập
   */
  async checkQuestionAccess(questionId: number, userId: string, roles: UserRole[]): Promise<boolean> {
    // Admin luôn có quyền truy cập
    if (roles.includes(UserRole.ADMIN)) {
      return true;
    }
    
    // Kiểm tra câu hỏi tồn tại
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${questionId}`);
    }
    
    // Lấy examId từ question
    const examId = this.getExamIdFromQuestion(question);
    
    // Nếu không có examId, không thể kiểm tra
    if (!examId) {
      if (roles.includes(UserRole.INSTRUCTOR)) {
        return true; // INSTRUCTOR có thể truy cập câu hỏi không thuộc bài thi nào
      } else {
        throw new ForbiddenException('Bạn không có quyền truy cập câu hỏi này');
      }
    }
    
    // Kiểm tra quyền truy cập thông qua bài thi
    try {
      // Lấy thông tin bài thi
      const exam = await this.examRepository.findById(examId);
      
      if (exam) {
        // Chuyển đổi exam thành CommonExam để tránh xung đột kiểu
        const examData = exam as unknown as CommonExam;
        if (examData.createdBy === userId) {
          return true;
        }
      }
    } catch (error) {
      throw new BadRequestException(`Lỗi khi kiểm tra quyền truy cập: ${error.message}`);
    }
    
    // Nếu là INSTRUCTOR nhưng không phải người tạo, vẫn có thể truy cập
    if (roles.includes(UserRole.INSTRUCTOR)) {
      return true;
    }
    
    // Học sinh chỉ có thể truy cập câu hỏi của các bài thi đã được publish
    if (roles.includes(UserRole.STUDENT)) {
      try {
        const exam = await this.examRepository.findById(examId);
        // Chuyển đổi exam thành CommonExam để tránh xung đột kiểu
        const examData = exam as unknown as CommonExam;
        return !!examData && !!examData.isPublished;
      } catch (error) {
        return false;
      }
    }
    
    // Mặc định không cho phép truy cập
    return false;
  }

  /**
   * Validate dữ liệu câu hỏi
   * @param questionData Dữ liệu câu hỏi
   */
  private validateQuestionData(questionData: unknown): void {
    const data = questionData as Record<string, unknown>;
    
    // Kiểm tra các trường bắt buộc
    if (!data.content) {
      throw new BadRequestException('Nội dung câu hỏi không được để trống');
    }
    
    if (!data.type) {
      throw new BadRequestException('Loại câu hỏi không được để trống');
    }
    
    // Kiểm tra theo loại câu hỏi
    switch (data.type) {
      case 'MULTIPLE_CHOICE': {
        if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
          throw new BadRequestException('Câu hỏi trắc nghiệm nhiều lựa chọn phải có ít nhất 2 lựa chọn');
        }
        
        // Kiểm tra đáp án đúng cho MULTIPLE_CHOICE
        if (!data.correctAnswers || !Array.isArray(data.correctAnswers) || data.correctAnswers.length === 0) {
          throw new BadRequestException('Phải có ít nhất một đáp án đúng cho câu hỏi nhiều lựa chọn');
        }
        break;
      }
        
      case 'SINGLE_CHOICE': {
        if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
          throw new BadRequestException('Câu hỏi trắc nghiệm một lựa chọn phải có ít nhất 2 lựa chọn');
        }
        
        // Kiểm tra đáp án đúng cho SINGLE_CHOICE
        if (!data.correctAnswers || !Array.isArray(data.correctAnswers) || data.correctAnswers.length !== 1) {
          throw new BadRequestException('Phải có đúng một đáp án đúng cho câu hỏi một lựa chọn');
        }
        break;
      }
        
      case 'TRUE_FALSE': {
        // Kiểm tra đáp án đúng cho TRUE_FALSE
        if (!data.correctAnswers || !Array.isArray(data.correctAnswers) || data.correctAnswers.length !== 1) {
          throw new BadRequestException('Câu hỏi Đúng/Sai phải có đúng một đáp án đúng');
        }
        
        // Đảm bảo giá trị đáp án là true hoặc false
        const tfAnswer = data.correctAnswers[0];
        if (typeof tfAnswer !== 'boolean' && tfAnswer !== 0 && tfAnswer !== 1) {
          throw new BadRequestException('Đáp án cho câu hỏi Đúng/Sai phải là true/false hoặc 0/1');
        }
        break;
      }
        
      case 'ESSAY': {
        // Câu hỏi tự luận cần có hướng dẫn chấm điểm
        if (!data.explanation) {
          throw new BadRequestException('Câu hỏi tự luận cần có hướng dẫn chấm điểm hoặc đáp án mẫu');
        }
        break;
      }
        
      default:
        throw new BadRequestException(`Loại câu hỏi không hợp lệ: ${data.type}. Loại câu hỏi phải là một trong: MULTIPLE_CHOICE, SINGLE_CHOICE, TRUE_FALSE, ESSAY`);
    }
    
    // Kiểm tra các lựa chọn cho câu hỏi trắc nghiệm
    if (['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(data.type as string) && Array.isArray(data.options)) {
      for (const option of data.options as Record<string, unknown>[]) {
        if (!option.content) {
          throw new BadRequestException('Nội dung lựa chọn không được để trống');
        }
        
        if (option.id === undefined) {
          throw new BadRequestException('Mỗi lựa chọn phải có ID');
        }
      }
      
      // Kiểm tra đáp án đúng phải có trong danh sách options
      if (Array.isArray(data.correctAnswers)) {
        for (const answerId of data.correctAnswers) {
          const foundOption = (data.options as Record<string, unknown>[]).find((o) => o.id === answerId);
          if (!foundOption) {
            throw new BadRequestException(`Đáp án đúng với ID ${answerId} không tồn tại trong danh sách lựa chọn`);
          }
        }
      }
    }
    
    // Kiểm tra điểm số
    if (typeof data.score !== 'number' || data.score <= 0) {
      throw new BadRequestException('Điểm số phải là số dương');
    }
    
    // Kiểm tra các trường tùy chọn
    if (data.difficultyLevel && !Object.values(Difficulty).includes(data.difficultyLevel as Difficulty)) {
      throw new BadRequestException(`Độ khó không hợp lệ: ${data.difficultyLevel}`);
    }
    
    if (data.tags && (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string'))) {
      throw new BadRequestException('Tags phải là một mảng các chuỗi');
    }
  }
  
  /**
   * Lấy examId từ câu hỏi
   * @param question Đối tượng câu hỏi
   * @returns ExamId của câu hỏi hoặc null
   */
  private getExamIdFromQuestion(question: unknown): string | null {
    if (!question) return null;
    
    if (typeof question === 'object' && question !== null && 'examId' in question) {
      return (question as { examId: string }).examId;
    }
    
    return null;
  }
  
  /**
   * Tìm tất cả câu hỏi với bộ lọc
   */
  async findAll(examId?: string, options?: { page?: number; limit?: number }): Promise<unknown> {
    const filter: ExamFilterDto = { 
      page: options?.page || 1,
      limit: options?.limit || 10
    };
    
    try {
      // Nếu có examId, trả về câu hỏi của bài thi đó
      if (examId) {
        return {
          examQuestions: await this.getQuestionsByExamId(examId),
          total: (await this.getQuestionsByExamId(examId)).length
        };
      }
      
      // Nếu không có examId, trả về tất cả câu hỏi theo bộ lọc
      return this.questionRepository.findAll(filter);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tìm câu hỏi: ${error.message}`);
    }
  }

  /**
   * Tìm câu hỏi theo ID
   */
  async findById(id: number): Promise<ExamQuestion | null> {
    const question = await this.questionRepository.findById(id);
    return question ? (question as ExamQuestion) : null;
  }

  /**
   * Tạo câu hỏi mới
   */
  async create(data: CreateExamQuestionDto): Promise<ExamQuestion> {
    // Nếu data có examId, sử dụng createQuestion
    if ('examId' in data && data.examId) {
      return this.createQuestion(data.examId as string, data);
    }
    
    // Validate dữ liệu
    this.validateQuestionData(data);
    
    try {
      // Tạo câu hỏi mới
      const question = await this.questionRepository.create(data);
      return question as ExamQuestion;
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo câu hỏi: ${error.message}`);
    }
  }

  /**
   * Tạo nhiều câu hỏi
   */
  async createBulk(data: CreateExamQuestionDto[]): Promise<ExamQuestion[]> {
    // Lấy examId từ câu hỏi đầu tiên nếu có
    const firstQuestion = data[0];
    if (firstQuestion && 'examId' in firstQuestion && firstQuestion.examId) {
      return this.createManyQuestions(firstQuestion.examId as string, data);
    }
    
    // Validate từng câu hỏi
    data.forEach(question => this.validateQuestionData(question));
    
    try {
      // Tạo nhiều câu hỏi mới
      const newQuestions = await this.questionRepository.createMany(data);
      return newQuestions as ExamQuestion[];
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo nhiều câu hỏi: ${error.message}`);
    }
  }

  /**
   * Cập nhật câu hỏi
   */
  async update(id: number, data: UpdateExamQuestionDto): Promise<ExamQuestion> {
    return this.updateQuestion(id, data);
  }

  /**
   * Xóa câu hỏi
   */
  async remove(id: number): Promise<boolean> {
    return this.deleteQuestion(id);
  }

  /**
   * Lọc câu hỏi theo độ khó
   */
  async filterByDifficulty(difficulty: string): Promise<ExamQuestion[]> {
    return this.getQuestionsByDifficulty(difficulty);
  }

  /**
   * Lọc câu hỏi theo môn học
   */
  async filterBySubject(subject: string): Promise<ExamQuestion[]> {
    return this.getQuestionsBySubject(subject);
  }

  /**
   * Lọc câu hỏi theo tags
   */
  async filterByTags(tags: string[]): Promise<ExamQuestion[]> {
    return this.getQuestionsByTags(tags);
  }
  
  /**
   * Lọc câu hỏi theo khối lớp
   */
  async filterByGrade(grade: number): Promise<ExamQuestion[]> {
    try {
      const questions = await this.questionRepository.findByGrade(grade);
      return questions.map(q => q as ExamQuestion);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tìm câu hỏi theo khối lớp: ${error.message}`);
    }
  }

  /**
   * Parse nội dung LaTeX thành đối tượng Question
   * @param latexContent Nội dung LaTeX cần parse
   * @returns Đối tượng Question đã parse
   */
  async parseLatexContent(latexContent: string): Promise<{
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
      // Sử dụng LaTeXParserService để phân tích cú pháp
      const parsedQuestion = await this.latexParserService.parseQuestion(latexContent);
      return parsedQuestion;
    } catch (error) {
      throw new BadRequestException(`Lỗi khi phân tích cú pháp LaTeX: ${error.message}`);
    }
  }

  /**
   * Xác thực cú pháp LaTeX
   * @param latexContent Nội dung LaTeX cần xác thực
   * @returns Kết quả xác thực
   */
  async validateLatexSyntax(latexContent: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      // Sử dụng LaTeXParserService để xác thực cú pháp
      const validationResult = await this.latexParserService.validateSyntax(latexContent);
      return validationResult;
    } catch (error) {
      return {
        isValid: false,
        errors: [`Lỗi khi xác thực cú pháp LaTeX: ${error.message}`]
      };
    }
  }

  /**
   * Tạo câu hỏi từ nội dung LaTeX
   * @param examId ID của bài thi
   * @param latexContent Nội dung LaTeX
   * @returns Câu hỏi đã tạo
   */
  async createQuestionFromLatex(examId: string, latexContent: string): Promise<ExamQuestion> {
    try {
      // Xác thực cú pháp LaTeX
      const syntaxValidation = await this.validateLatexSyntax(latexContent);
      if (!syntaxValidation.isValid) {
        throw new BadRequestException(`Cú pháp LaTeX không hợp lệ: ${syntaxValidation.errors.join(', ')}`);
      }

      // Phân tích cú pháp LaTeX
      const parsedQuestion = await this.parseLatexContent(latexContent);

      // Map loại câu hỏi từ chuỗi sang string
      let questionType: string;
      switch (parsedQuestion.type) {
        case 'MC':
          questionType = 'SINGLE_CHOICE';
          break;
        case 'TF':
          questionType = 'MULTIPLE_CHOICE';
          break;
        case 'SA':
          questionType = 'TRUE_FALSE';
          break;
        case 'ES':
          questionType = 'ESSAY';
          break;
        default:
          questionType = 'MULTIPLE_CHOICE';
      }

      // Tạo CreateExamQuestionDto từ kết quả phân tích
      const questionData = {
        content: parsedQuestion.content,
        type: questionType as unknown as ExamQuestionType, // Sử dụng string thay vì enum
        score: 1, // Điểm mặc định
        options: this.createOptionsFromAnswers(parsedQuestion.answers || [], parsedQuestion.correctAnswer),
        correctAnswers: [],
        explanation: parsedQuestion.solutions?.[0] || '',
        difficultyLevel: Difficulty.MEDIUM, // Mặc định
        tags: parsedQuestion.sources || [],
        subject: '',
        grade: '0' // Chuyển sang string
      } as unknown as EnhancedCreateQuestionDto; // Sử dụng interface EnhancedCreateQuestionDto thay vì any

      // Tạo câu hỏi mới
      return this.createQuestion(examId, questionData);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo câu hỏi từ LaTeX: ${error.message}`);
    }
  }

  /**
   * Tạo nhiều câu hỏi từ nhiều nội dung LaTeX
   * @param examId ID của bài thi
   * @param latexContents Mảng nội dung LaTeX
   * @returns Danh sách câu hỏi đã tạo
   */
  async createManyQuestionsFromLatex(examId: string, latexContents: string[]): Promise<ExamQuestion[]> {
    try {
      // Xử lý từng nội dung LaTeX
      const questionPromises = latexContents.map(async (latexContent) => {
        // Xác thực cú pháp LaTeX
        const syntaxValidation = await this.validateLatexSyntax(latexContent);
        if (!syntaxValidation.isValid) {
          console.warn(`Bỏ qua nội dung LaTeX không hợp lệ: ${syntaxValidation.errors.join(', ')}`);
          return null;
        }

        // Phân tích cú pháp LaTeX
        const parsedQuestion = await this.parseLatexContent(latexContent);

        // Map loại câu hỏi từ chuỗi sang string
        let questionType: string;
        switch (parsedQuestion.type) {
          case 'MC':
            questionType = 'SINGLE_CHOICE';
            break;
          case 'TF':
            questionType = 'MULTIPLE_CHOICE';
            break;
          case 'SA':
            questionType = 'TRUE_FALSE';
            break;
          case 'ES':
            questionType = 'ESSAY';
            break;
          default:
            questionType = 'MULTIPLE_CHOICE';
        }

        // Tạo CreateExamQuestionDto từ kết quả phân tích
        const questionData: CreateExamQuestionDto = {
          content: parsedQuestion.content,
          type: questionType as unknown as ExamQuestionType, // Sử dụng string thay vì enum
          options: this.createOptionsFromAnswers(parsedQuestion.answers || [], parsedQuestion.correctAnswer),
          correctAnswers: [],
          explanation: parsedQuestion.solutions?.[0] || '',
          difficultyLevel: Difficulty.MEDIUM, // Mặc định
          tags: parsedQuestion.sources || [],
          subject: '',
          grade: '0' // Chuyển sang string
        } as unknown as EnhancedCreateQuestionDto; // Sử dụng interface thay cho any

        return questionData;
      });

      // Đợi tất cả các promises hoàn thành
      const questionDataArray = await Promise.all(questionPromises);

      // Lọc bỏ các null (các nội dung LaTeX không hợp lệ)
      const validQuestionData = questionDataArray.filter(q => q !== null) as CreateExamQuestionDto[];

      // Tạo nhiều câu hỏi cùng lúc
      return this.createManyQuestions(examId, validQuestionData);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi tạo nhiều câu hỏi từ LaTeX: ${error.message}`);
    }
  }

  /**
   * Map chuỗi loại câu hỏi sang string
   * @param typeString Loại câu hỏi dạng chuỗi
   * @returns String type
   * @private
   */
  private mapToQuestionType(typeString: string): string {
    switch (typeString) {
      case 'MC':
        return 'SINGLE_CHOICE';
      case 'TF':
        return 'MULTIPLE_CHOICE';
      case 'SA':
        return 'TRUE_FALSE';
      case 'ES':
        return 'ESSAY';
      default:
        return 'MULTIPLE_CHOICE';
    }
  }

  /**
   * Tạo mảng options từ danh sách câu trả lời
   * @param answers Danh sách câu trả lời
   * @param correctAnswer Câu trả lời đúng
   * @returns Mảng options
   * @private
   */
  private createOptionsFromAnswers(
    answers: string[],
    correctAnswer: string | string[]
  ): QuestionOptionDto[] {
    if (!answers || answers.length === 0) {
      return [];
    }

    return answers.map((answer, index) => {
      const isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.includes(answer)
        : correctAnswer === answer;

      return {
        id: (index + 1).toString(), // Convert to string to match QuestionOptionDto
        content: answer,
        isCorrect
      };
    });
  }

  /**
   * Liên kết một câu hỏi từ ngân hàng đề vào bài thi
   * @param examId ID của bài thi
   * @param questionId ID của câu hỏi từ ngân hàng
   * @param score Điểm số cho câu hỏi trong bài thi
   * @returns Câu hỏi đã được thêm vào bài thi
   */
  async linkQuestionToExam(examId: string, questionId: string, score: number): Promise<ExamQuestion> {
    // Kiểm tra bài thi có tồn tại không
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }

    // Lấy thông tin câu hỏi từ ngân hàng đề
    const question = await this.questionsService.findById(questionId);
    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${questionId}`);
    }

    // Ánh xạ loại câu hỏi từ ngân hàng sang loại câu hỏi trong bài thi
    const questionData = question as unknown as QuestionDataType;
    
    // Chuyển đổi loại câu hỏi từ ngân hàng đề sang dạng ExamQuestionType
    const mappedType = this.mapToQuestionType(questionData.type);

    // Ánh xạ độ khó từ ngân hàng sang bài thi
    let examDifficulty: string;
    switch (questionData.difficulty) {
      case QuestionDifficulty.EASY:
        examDifficulty = Difficulty.EASY;
        break;
      case QuestionDifficulty.MEDIUM:
        examDifficulty = Difficulty.MEDIUM;
        break;
      case QuestionDifficulty.HARD:
        examDifficulty = Difficulty.HARD;
        break;
      default:
        examDifficulty = Difficulty.MEDIUM;
    }

    // Chuyển đổi options từ ngân hàng đề sang định dạng cho bài thi
    const options: QuestionOptionDto[] = [];

    if (questionData.options && Array.isArray(questionData.options)) {
      questionData.options.forEach((option, index) => {
        options.push({
          id: option.id || `option_${index + 1}`,
          content: option.content,
          isCorrect: option.isCorrect
        });
      });
    }

    // Tạo dữ liệu câu hỏi cho bài thi
    const createExamQuestionDto = {
      content: questionData.content,
      type: mappedType as unknown as ExamQuestionType,
      options: options,
      correctAnswers: [],
      score,
      difficultyLevel: examDifficulty,
      explanation: questionData.explanation,
      sourceQuestionId: questionId // Lưu ID của câu hỏi từ ngân hàng đề
    } as unknown as EnhancedCreateQuestionDto; // Sử dụng interface thay cho any

    // Xác định correctAnswers dựa vào options
    if (options.length > 0) {
      createExamQuestionDto.correctAnswers = options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);
    }

    // Tạo câu hỏi mới trong bài thi
    const createdQuestion = await this.createQuestion(examId, createExamQuestionDto);

    // TODO: Cập nhật usage count cho câu hỏi gốc
    // Có thể thực hiện bằng cách gọi API hoặc trực tiếp đến repository

    return createdQuestion;
  }

  /**
   * Import nhiều câu hỏi từ ngân hàng đề vào bài thi
   * @param examId ID của bài thi
   * @param filter Bộ lọc để chọn câu hỏi từ ngân hàng
   * @param score Điểm số cho mỗi câu hỏi trong bài thi
   * @returns Danh sách câu hỏi đã được thêm vào bài thi
   */
  async importQuestionsFromBank(
    examId: string, 
    filter: QuestionFilterDto, 
    score: number
  ): Promise<ExamQuestion[]> {
    // Kiểm tra bài thi có tồn tại không
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }

    // Lấy danh sách câu hỏi từ ngân hàng dựa trên bộ lọc
    const result = await this.questionsService.findAll(filter);
    const questions = (result as { questions: QuestionDataType[] }).questions || [];

    if (questions.length === 0) {
      throw new BadRequestException('Không tìm thấy câu hỏi phù hợp với điều kiện lọc');
    }

    // Thêm từng câu hỏi vào bài thi
    const createdQuestions: ExamQuestion[] = [];
    
    for (const question of questions) {
      try {
        const examQuestion = await this.linkQuestionToExam(examId, question.id, score);
        createdQuestions.push(examQuestion);
      } catch (error) {
        console.error(`Lỗi khi thêm câu hỏi ${question.id} vào bài thi: ${error.message}`);
        // Tiếp tục với câu hỏi tiếp theo nếu có lỗi
      }
    }

    return createdQuestions;
  }

  /**
   * Lấy danh sách bài thi chứa câu hỏi
   * @param questionId ID của câu hỏi (từ ngân hàng câu hỏi)
   * @returns Danh sách bài thi chứa câu hỏi
   */
  async getExamsContainingQuestion(questionId: string): Promise<Exam[]> {
    // Lấy tất cả các exam questions có nguồn từ câu hỏi này
    const filter: ExamFilterDto = { 
      sourceQuestionId: questionId 
    } as unknown as ExamFilterDto;
    
    const examQuestions = await this.questionRepository.findAll(filter);
    
    if (!examQuestions || !examQuestions.examQuestions || examQuestions.examQuestions.length === 0) {
      return [];
    }
    
    // Lấy danh sách examId từ các exam questions
    const examIds = examQuestions.examQuestions.map(q => {
      const question = q as unknown as { examId: string };
      return question.examId;
    }).filter(id => !!id);
    
    // Lấy thông tin chi tiết của các bài thi
    const exams = await Promise.all(
      [...new Set(examIds)].map(async (examId) => {
        try {
          return await this.examRepository.findById(examId as string);
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin bài thi ${examId}:`, error);
          return null;
        }
      })
    );
    
    return exams.filter(exam => exam !== null) as unknown as Exam[];
  }

  /**
   * Lấy danh sách câu hỏi đã được sử dụng trong các bài thi
   * @param filter Bộ lọc tùy chọn
   * @returns Danh sách câu hỏi và số lần sử dụng
   */
  async getQuestionsUsedInExams(filter?: QuestionFilterDto): Promise<{
    id: string;
    usageCount: number;
    exams: string[];
  }[]> {
    // Get all questions from question bank
    const result = await this.questionsService.findAll(filter);
    const questions = (result as { questions: QuestionDataType[] }).questions || [];

    // For each question, get the exams it's used in
    const questionUsage = await Promise.all(
      questions.map(async question => {
        const exams = await this.getExamsContainingQuestion(question.id);
        return {
          id: question.id,
          usageCount: exams.length,
          exams: exams.map(exam => (exam as unknown as { id: string }).id)
        };
      })
    );

    return questionUsage;
  }
} 