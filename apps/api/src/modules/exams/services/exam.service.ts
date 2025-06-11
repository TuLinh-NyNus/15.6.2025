import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { 
  CreateExamDto, 
  UpdateExamDto, 
  ExamFilterDto,
  ExamStatsParamsDto,
  DetailedExamStatsDto,
  QuestionStatsDto
} from '@project/dto';
import { IExamService, IExamRepository, IExamResultRepository } from '@project/interfaces';
import { Difficulty, ExamCategory, ExamForm, ExamType, UserRole } from '@project/entities';

@Injectable()
export class ExamService implements IExamService {
  constructor(
    private readonly examRepository: IExamRepository,
    private readonly examResultRepository: IExamResultRepository
  ) {}

  /**
   * Lấy danh sách bài thi với phân trang và lọc
   * @param filters Các tham số lọc và phân trang
   * @returns Danh sách bài thi đã phân trang
   */
  async getAllExams(filters: ExamFilterDto): Promise<{ exams: unknown[]; total: number }> {
    // Thực hiện lọc và phân trang
    return this.examRepository.findAll(filters);
  }

  /**
   * Lấy thông tin chi tiết bài thi theo ID
   * @param id ID của bài thi
   * @returns Bài thi nếu tìm thấy
   */
  async getExamById(id: string): Promise<unknown> {
    const exam = await this.examRepository.findById(id);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${id}`);
    }
    return exam;
  }

  /**
   * Tạo bài thi mới
   * @param createExamDto Dữ liệu bài thi
   * @returns Bài thi đã tạo
   */
  async createExam(createExamDto: CreateExamDto): Promise<unknown> {
    // Nếu không có type, thiết lập giá trị mặc định là PRACTICE
    if (!createExamDto.type) {
      createExamDto.type = ExamType.PRACTICE;
    }

    // Tạo bài thi mới
    return this.examRepository.create(createExamDto as unknown as Record<string, unknown>);
  }

  /**
   * Cập nhật bài thi
   * @param id ID của bài thi
   * @param updateExamDto Dữ liệu cập nhật
   * @returns Bài thi đã cập nhật
   */
  async updateExam(id: string, updateExamDto: UpdateExamDto): Promise<unknown> {
    // Kiểm tra bài thi tồn tại
    const existingExam = await this.examRepository.findById(id);
    if (!existingExam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${id}`);
    }

    // Cập nhật bài thi
    return this.examRepository.update(id, updateExamDto as unknown as Record<string, unknown>);
  }

  /**
   * Xóa bài thi
   * @param id ID của bài thi
   * @returns Kết quả xóa (true/false)
   */
  async deleteExam(id: string): Promise<boolean> {
    // Kiểm tra bài thi tồn tại
    const existingExam = await this.examRepository.findById(id);
    if (!existingExam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${id}`);
    }

    // Xóa bài thi
    return this.examRepository.delete(id);
  }

  /**
   * Kiểm tra người dùng có quyền truy cập bài thi không
   * @param examId ID của bài thi
   * @param userId ID của người dùng
   * @param roles Vai trò của người dùng
   * @returns true nếu có quyền, nếu không throw ForbiddenException
   */
  async checkExamAccess(examId: string, userId: string, roles: UserRole[]): Promise<boolean> {
    // Admin luôn có quyền truy cập
    if (roles.includes(UserRole.ADMIN)) {
      return true;
    }

    // Lấy thông tin bài thi
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }

    // Kiểm tra nếu người dùng là người tạo bài thi
    if (exam['createdBy'] === userId) {
      return true;
    }

    // Nếu là INSTRUCTOR nhưng không phải người tạo, không có quyền
    if (roles.includes(UserRole.INSTRUCTOR)) {
      throw new ForbiddenException('Bạn không có quyền truy cập bài thi này');
    }

    // Nếu là STUDENT, có thể truy cập nếu bài thi đã PUBLISHED
    if (roles.includes(UserRole.STUDENT) && exam['type'] === ExamType.ASSESSMENT) {
      return true;
    }

    // Mặc định không cho phép truy cập
    throw new ForbiddenException('Bạn không có quyền truy cập bài thi này');
  }

  /**
   * Lấy danh sách các loại bài thi
   * @returns Danh sách các loại bài thi
   */
  async getExamCategories(): Promise<{ key: string; value: string }[]> {
    return Object.values(ExamCategory).map(category => ({
      key: category,
      value: category
    }));
  }

  /**
   * Lấy thống kê về bài thi
   * @param params Tham số cho thống kê
   * @returns Thống kê bài thi
   */
  async getExamStats(params: ExamStatsParamsDto): Promise<DetailedExamStatsDto> {
    const { examId, includeQuestionStats = false } = params;

    // Kiểm tra bài thi tồn tại
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${examId}`);
    }

    // Lấy tất cả kết quả bài thi
    const examResults = await this.examResultRepository.findByExam(examId) as Record<string, unknown>[];
    
    if (!examResults || examResults.length === 0) {
      throw new BadRequestException('Chưa có dữ liệu kết quả cho bài thi này');
    }

    // Tính toán các chỉ số thống kê
    const totalAttempts = examResults.length;
    
    // Tổng điểm và điểm trung bình
    const totalScores = examResults.reduce((sum, result) => {
      const score = result['score'];
      return sum + (typeof score === 'number' ? score : 0);
    }, 0);
    const averageScore = totalAttempts > 0 ? totalScores / totalAttempts : 0;
    
    // Điểm cao nhất và thấp nhất
    const scores = examResults.map(result => {
      const score = result['score'];
      return typeof score === 'number' ? score : 0;
    });
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    
    // Thời gian làm bài trung bình
    const totalDuration = examResults.reduce((sum, result) => {
      const duration = result['duration'];
      return sum + (typeof duration === 'number' ? duration : 0);
    }, 0);
    const averageDuration = totalAttempts > 0 ? totalDuration / totalAttempts : 0;
    
    // Tạo phân phối điểm theo khoảng điểm
    const scoreDistribution = this.calculateScoreDistribution(scores);
    
    // Tỷ lệ đỗ (nếu điểm trung bình >= 50% thì coi là đỗ)
    const passingCount = examResults.filter(result => {
      const score = result['score'];
      return typeof score === 'number' && score >= 5;
    }).length;
    const passRate = totalAttempts > 0 ? (passingCount / totalAttempts) * 100 : 0;

    // Xây dựng thống kê cơ bản
    const basicStats: DetailedExamStatsDto = {
      examId,
      title: exam['title'] as string,
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
      averageDuration,
      passRate,
      scoreDistribution,
      updatedAt: new Date(),
      subject: exam['subject'] as string,
      grade: exam['grade'] as number,
      difficulty: exam['difficulty'] as Difficulty,
      examCategory: exam['examCategory'] as ExamCategory,
      form: exam['form'] as ExamForm,
      questionStats: []
    };

    // Thêm thống kê chi tiết từng câu hỏi nếu yêu cầu
    if (includeQuestionStats) {
      basicStats.questionStats = await this.getQuestionStats(examId, examResults);
    }

    return basicStats;
  }

  /**
   * Tính toán phân phối điểm theo khoảng
   * @param scores Mảng điểm số
   */
  private calculateScoreDistribution(scores: number[]): Record<string, number> {
    const distribution: Record<string, number> = {
      '0-2': 0,
      '2-4': 0,
      '4-6': 0,
      '6-8': 0,
      '8-10': 0
    };
    
    scores.forEach(score => {
      if (score >= 0 && score < 2) distribution['0-2']++;
      else if (score >= 2 && score < 4) distribution['2-4']++;
      else if (score >= 4 && score < 6) distribution['4-6']++;
      else if (score >= 6 && score < 8) distribution['6-8']++;
      else if (score >= 8 && score <= 10) distribution['8-10']++;
    });
    
    return distribution;
  }

  /**
   * Tính toán thống kê cho từng câu hỏi trong bài thi
   * @param examId ID bài thi
   * @param examResults Kết quả thi
   */
  private async getQuestionStats(examId: string, examResults: Record<string, unknown>[]): Promise<QuestionStatsDto[]> {
    // Lấy thông tin bài thi để biết các câu hỏi
    const exam = await this.examRepository.findById(examId);
    const questionIds = ((exam['questions'] || []) as unknown[]).map(q => {
      if (typeof q === 'number') return q;
      if (typeof q === 'object' && q !== null) {
        const qObj = q as Record<string, unknown>;
        return typeof qObj.id === 'number' ? qObj.id : Number(qObj.id);
      }
      return Number(q);
    });
    
    // Tạo map để lưu thống kê cho từng câu hỏi
    const questionStatsMap = new Map<number, {
      questionId: number;
      orderInExam: number;
      correctCount: number;
      totalAnswered: number;
      timeSpentTotal: number;
      optionCounts: Record<string, number>;
    }>();
    
    // Khởi tạo dữ liệu thống kê cho mỗi câu hỏi
    questionIds.forEach((questionId, index) => {
      questionStatsMap.set(questionId, {
        questionId,
        orderInExam: index + 1,
        correctCount: 0,
        totalAnswered: 0,
        timeSpentTotal: 0,
        optionCounts: {}
      });
    });
    
    // Tính toán thống kê từ các kết quả thi
    examResults.forEach(result => {
      const answers = result.answers as Record<string, unknown> || {};
      
      Object.entries(answers).forEach(([questionId, answerData]) => {
        const qId = parseInt(questionId);
        if (!questionStatsMap.has(qId)) return;
        
        const stats = questionStatsMap.get(qId)!;
        stats.totalAnswered++;
        
        if ((answerData as Record<string, unknown>)['isCorrect']) {
          stats.correctCount++;
        }
        
        const timeSpent = (answerData as Record<string, unknown>)['timeSpent'];
        if (typeof timeSpent === 'number') {
          stats.timeSpentTotal += timeSpent;
        }
        
        // Tính toán phân phối lựa chọn
        const selectedOptionIds = (answerData as Record<string, unknown>)['selectedOptionIds'] as unknown;
        if (selectedOptionIds && Array.isArray(selectedOptionIds)) {
          selectedOptionIds.forEach(optionId => {
            const optionIdStr = String(optionId);
            stats.optionCounts[optionIdStr] = (stats.optionCounts[optionIdStr] || 0) + 1;
          });
        }
      });
    });
    
    // Chuyển đổi dữ liệu thống kê thành mảng kết quả
    const questionStats = Array.from(questionStatsMap.values()).map(stats => {
      const { questionId, orderInExam, correctCount, totalAnswered, timeSpentTotal, optionCounts } = stats;
      
      return {
        questionId,
        orderInExam,
        correctRate: totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0,
        correctCount,
        totalAnswered,
        averageTimeSpent: totalAnswered > 0 ? timeSpentTotal / totalAnswered : 0,
        optionDistribution: optionCounts
      } as QuestionStatsDto;
    });
    
    return questionStats;
  }

  /**
   * Cập nhật điểm trung bình cho bài thi
   * @param id ID của bài thi
   * @param score Điểm trung bình mới
   * @returns Bài thi đã cập nhật
   */
  async updateAverageScore(id: string, score: number): Promise<unknown> {
    // Kiểm tra bài thi tồn tại
    const existingExam = await this.examRepository.findById(id);
    if (!existingExam) {
      throw new NotFoundException(`Không tìm thấy bài thi với ID: ${id}`);
    }

    // Cập nhật điểm trung bình
    return this.examRepository.updateAverageScore(id, score);
  }
} 