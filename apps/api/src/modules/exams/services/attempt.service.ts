import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IExamRepository, IExamQuestionRepository, IExamResultService } from '@project/interfaces';
import { ExamFilterDto } from '@project/dto';

/**
 * Interface cho Exam để xử lý type-safety
 */
interface Exam {
  id: string;
  isPublished: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Service quản lý các lần làm bài thi của người dùng
 */
@Injectable()
export class AttemptService implements IExamResultService {
  
  constructor(
    @Inject('IExamRepository')
    private readonly examRepository: IExamRepository,
    @Inject('IExamQuestionRepository')
    private readonly questionRepository: IExamQuestionRepository,
    @Inject('IExamAttemptRepository')
    private readonly attemptRepository: IExamAttemptRepository
  ) {}

  /**
   * Lấy tất cả kết quả bài thi với phân trang và lọc
   */
  async getAllResults(filters: ExamFilterDto): Promise<{ examResults: unknown[]; total: number }> {
    const attempts = await this.attemptRepository.findAll(filters);
    const total = await this.attemptRepository.count(filters);
    
    return {
      examResults: attempts,
      total
    };
  }

  /**
   * Lấy thông tin chi tiết kết quả bài thi theo ID
   */
  async getResultById(id: string): Promise<unknown> {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy lần làm bài thi với ID: ${id}`);
    }
    return attempt;
  }

  /**
   * Lấy kết quả bài thi theo người dùng
   */
  async getResultsByUser(userId: string): Promise<unknown[]> {
    return this.attemptRepository.findByUserId(userId);
  }

  /**
   * Lấy kết quả bài thi theo bài thi
   */
  async getResultsByExam(examId: string): Promise<unknown[]> {
    return this.attemptRepository.findByExamId(examId);
  }

  /**
   * Tạo kết quả bài thi mới
   */
  async createResult(resultData: unknown): Promise<unknown> {
    // Kiểm tra bài thi có tồn tại
    const data = resultData as { examId: string; userId: string; startedAt: Date; isCompleted: boolean; };
    
    const exam = await this.examRepository.findById(data.examId);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${data.examId}`);
    }

    return this.attemptRepository.create(data);
  }

  /**
   * Cập nhật kết quả bài thi
   */
  async updateResult(id: string, resultData: unknown): Promise<unknown> {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy lần làm bài thi với ID: ${id}`);
    }

    return this.attemptRepository.update(id, resultData);
  }

  /**
   * Xóa kết quả bài thi
   */
  async deleteResult(id: string): Promise<boolean> {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy lần làm bài thi với ID: ${id}`);
    }

    return this.attemptRepository.delete(id);
  }

  /**
   * Tính điểm trung bình cho một bài thi
   */
  async calculateAverageScore(examId: string): Promise<number> {
    const attempts = await this.attemptRepository.findByExamId(examId);
    if (!attempts || attempts.length === 0) {
      return 0;
    }
    
    const completedAttempts = attempts.filter(a => a.isCompleted && a.score !== undefined);
    if (completedAttempts.length === 0) {
      return 0;
    }
    
    const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    return totalScore / completedAttempts.length;
  }

  /**
   * Đếm số lượng người đã làm bài thi
   */
  async countAttempts(examId: string): Promise<number> {
    return this.attemptRepository.count({ examId });
  }

  /**
   * Bắt đầu làm bài thi mới
   */
  async startExamAttempt(userId: string, examId: string): Promise<unknown> {
    // Kiểm tra bài thi có tồn tại không
    const examData = await this.examRepository.findById(examId);
    if (!examData) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }
    
    const exam = examData as unknown as Exam;

    // Kiểm tra bài thi đã được công bố chưa
    if (!exam.isPublished) {
      throw new BadRequestException('Bài thi chưa được công bố');
    }

    // Kiểm tra thời gian làm bài
    const now = new Date();
    if (exam.startDate && new Date(exam.startDate) > now) {
      throw new BadRequestException('Bài thi chưa đến thời gian bắt đầu');
    }
    
    if (exam.endDate && new Date(exam.endDate) < now) {
      throw new BadRequestException('Bài thi đã kết thúc');
    }

    // Kiểm tra xem người dùng đã có phiên làm bài chưa hoàn thành không
    const incompleteAttempt = await this.attemptRepository.findIncompleteAttempt(userId, examId);
    if (incompleteAttempt) {
      return incompleteAttempt; // Trả về phiên làm bài đang dang dở
    }

    // Lấy tất cả câu hỏi của bài thi
    // Sử dụng findAll với bộ lọc mặc định vì không có phương thức lấy theo examId
    // Trong thực tế, cần bổ sung phương thức findByExamId vào interface IExamQuestionRepository
    const questionsResult = await this.questionRepository.findAll({
      // Sử dụng bộ lọc mặc định
      page: 1,
      limit: 1000 // Lấy tất cả câu hỏi
    });
    
    // TODO: Lọc câu hỏi theo examId ở tầng service vì interface không hỗ trợ
    const questions = questionsResult.examQuestions;
    
    // Kiểm tra bài thi có câu hỏi không
    if (!questions || questions.length === 0) {
      throw new BadRequestException('Bài thi không có câu hỏi');
    }

    // Tạo phiên làm bài mới
    const attemptData = {
      examId,
      userId,
      startedAt: new Date(),
      isCompleted: false,
    };

    // Lưu vào database và trả về phiên làm bài
    return this.attemptRepository.create(attemptData);
  }

  /**
   * Nộp bài thi và tính điểm
   */
  async submitExamAttempt(attemptId: string, answers: unknown): Promise<unknown> {
    // Tìm phiên làm bài
    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy phiên làm bài với ID: ${attemptId}`);
    }

    // Kiểm tra phiên làm bài đã kết thúc chưa
    if (attempt.isCompleted) {
      throw new BadRequestException('Phiên làm bài đã kết thúc');
    }

    // Xử lý câu trả lời
    const answersObj = answers as Record<string, unknown>;
    
    // Lấy examId từ attempt một cách an toàn trước khi dùng
    const attemptObj = attempt as unknown as Record<string, unknown>;
    const examId = attemptObj.examId as string;
    
    if (!examId) {
      throw new BadRequestException('Không tìm thấy ID của bài thi');
    }
    
    // Kiểm tra câu trả lời hợp lệ
    if (answersObj && typeof answersObj === 'object') {
      try {
        // Tìm tất cả câu hỏi trong bài thi để xác thực câu trả lời
        const questionsResult = await this.questionRepository.findAll({
          page: 1,
          limit: 1000 // Lấy tất cả câu hỏi
        });

        // Đảm bảo rằng chỉ có câu trả lời cho câu hỏi tồn tại trong bài thi
        const examQuestions = questionsResult.examQuestions || [];
        
        // Lọc câu hỏi thuộc về bài thi hiện tại và tạo danh sách IDs
        const validExamQuestions = examQuestions.filter(q => {
          const question = q as Record<string, unknown>;
          return question.examId === examId;
        });
        
        const validQuestionIds = new Set(validExamQuestions.map(q => {
          const question = q as Record<string, unknown>;
          return String(question.id);
        }));
        
        // Chuẩn bị câu trả lời hợp lệ
        const validAnswers: Record<string, unknown> = {};
        for (const [questionId, answer] of Object.entries(answersObj)) {
          if (validQuestionIds.has(questionId)) {
            validAnswers[questionId] = answer;
          }
        }
        
        // Chuyển đổi dữ liệu sang định dạng phù hợp cho repository
        const processedAnswers: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(validAnswers)) {
          // Giữ nguyên giá trị (cả string và non-string) vì repository đã được cập nhật
          // để chấp nhận Record<string, unknown>
          processedAnswers[key] = value;
        }
        
        // Gọi updateAnswers, sử dụng processedAnswers
        // Không cần type casting vì kiểu dữ liệu đã phù hợp
        await this.attemptRepository.updateAnswers(attemptId, processedAnswers);
      } catch (error) {
        console.error('Lỗi khi xử lý câu trả lời:', error);
        throw new BadRequestException('Có lỗi xảy ra khi xử lý câu trả lời');
      }
    }

    // Hoàn thành bài thi
    const endTime = new Date();
    const completedAttempt = await this.attemptRepository.completeAttempt(attemptId, endTime);
    
    // Tính điểm cho bài làm
    const score = await this.attemptRepository.calculateScore(attemptId);
    
    // Kiểm tra và chuyển đổi completedAttempt thành object trước khi spread
    const attemptResult = typeof completedAttempt === 'object' && completedAttempt !== null
      ? { ...completedAttempt as Record<string, unknown> }
      : { id: attemptId };
    
    // Cập nhật điểm trung bình của bài thi
    await this.updateExamAverageScore(examId);
    
    // Trả về thông tin bài làm đã hoàn thành kèm điểm
    return {
      ...attemptResult,
      score,
      passed: score >= 5 // Đạt khi điểm >= 5/10
    };
  }

  /**
   * Cập nhật điểm trung bình của bài thi
   * @private
   */
  private async updateExamAverageScore(examId: string): Promise<void> {
    try {
      const averageScore = await this.calculateAverageScore(examId);
      await this.examRepository.updateAverageScore(examId, averageScore);
    } catch (error) {
      console.error(`Lỗi khi cập nhật điểm trung bình cho bài thi ${examId}:`, error);
    }
  }

  /**
   * Lấy hiệu suất làm bài của người dùng
   */
  async getUserPerformance(userId: string, examId: string): Promise<unknown> {
    // Kiểm tra bài thi có tồn tại không
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }

    // Lấy tất cả các lần làm bài thi của người dùng cho bài thi này
    const attempts = await this.attemptRepository.findAll({
      userId,
      examId,
      isCompleted: true, // Chỉ xem xét các lần làm bài đã hoàn thành
    });

    if (attempts.length === 0) {
      return {
        userId,
        examId,
        attempts: 0,
        bestScore: null,
        averageScore: null,
        passed: false,
        lastAttemptDate: null,
      };
    }

    // Tính toán các chỉ số
    const completedAttempts = attempts.filter(a => a.isCompleted);
    const scores = completedAttempts.map(a => a.score || 0);
    const bestScore = Math.max(...scores);
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
      
    // Kiểm tra xem người dùng đã vượt qua bài thi chưa
    const passed = completedAttempts.some(a => a.passed === true);
    
    // Lấy ngày làm bài gần nhất
    const lastAttemptDate = completedAttempts.length > 0 
      ? completedAttempts[0].completedAt // Các lần làm bài được sắp xếp theo thứ tự mới nhất đầu tiên
      : null;

    return {
      userId,
      examId,
      attempts: completedAttempts.length,
      bestScore,
      averageScore,
      passed,
      lastAttemptDate,
    };
  }

  /**
   * Xáo trộn danh sách câu hỏi
   */
  private shuffleQuestions<T>(questions: T[]): T[] {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Interface cho Attempt Repository để tránh lỗi kiểu
 */
interface IExamAttemptRepository {
  findAll(filters: unknown): Promise<Array<{ isCompleted: boolean; score?: number; passed?: boolean; completedAt?: Date }>>;
  findById(id: string): Promise<{ isCompleted: boolean } | null>;
  findByUserId(userId: string): Promise<unknown[]>;
  findByExamId(examId: string): Promise<Array<{ isCompleted: boolean; score?: number }>>;
  findIncompleteAttempt(userId: string, examId: string): Promise<unknown | null>;
  create(data: unknown): Promise<unknown>;
  update(id: string, data: unknown): Promise<unknown>;
  updateAnswers(id: string, answers: Record<string, unknown>): Promise<unknown>;
  completeAttempt(id: string, endTime: Date): Promise<unknown>;
  calculateScore(id: string): Promise<number>;
  delete(id: string): Promise<boolean>;
  count(filters: unknown): Promise<number>;
} 
