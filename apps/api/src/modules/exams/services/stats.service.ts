import { Injectable } from '@nestjs/common';
import { 
  DetailedExamStatsDto, 
  ExamStatsDto, 
  ExamStatsParamsDto, 
  QuestionStatsDto,
  ExamFilterDto
} from '@project/dto';
import { IExamStatsService } from '@project/interfaces';
import { IExamRepository, IExamResultRepository } from '@project/interfaces';
import { Difficulty, ExamCategory, ExamForm } from '@project/entities';

// Interface cho exam result
interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  isPassed: boolean;
  createdAt: Date;
  timeSpent?: number;
}

// Interface cho exam
interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: number;
  difficulty: Difficulty;
  examCategory: ExamCategory;
  form: ExamForm;
  questions?: Question[];
}

// Interface cho question
interface Question {
  id: number;
  content: string;
  options: Option[];
  correctAnswer?: string;
  orderInExam?: number;
}

// Interface cho option
interface Option {
  text: string;
  value: string;
}

// Interface cho answer
interface QuestionAnswer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent?: number;
}

@Injectable()
export class ExamStatsService implements IExamStatsService {
  constructor(
    private readonly examRepository: IExamRepository,
    private readonly examResultRepository: IExamResultRepository,
  ) {}

  /**
   * Lấy thống kê tổng quan của bài thi
   * @param examId ID của bài thi
   * @returns Thống kê tổng quan
   */
  async getExamStats(examId: string): Promise<ExamStatsDto> {
    // Kiểm tra bài thi có tồn tại
    const exam = await this.examRepository.findById(examId) as unknown as Exam;
    if (!exam) {
      throw new Error('Bài thi không tồn tại');
    }

    // Lấy kết quả bài thi
    const rawResults = await this.examResultRepository.findByExam(examId);
    // Type casting từ unknown sang ExamResult
    const results = rawResults as ExamResult[];
    
    // Tính toán các thống kê
    const totalAttempts = results.length;
    const passCount = results.filter(result => result.isPassed).length;
    const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0;
    
    // Tính điểm trung bình
    const averageScore = totalAttempts > 0 
      ? results.reduce((sum, result) => sum + result.score, 0) / totalAttempts 
      : 0;
    
    // Tìm điểm cao nhất và thấp nhất
    const highestScore = totalAttempts > 0 
      ? Math.max(...results.map(result => result.score)) 
      : 0;
    const lowestScore = totalAttempts > 0 
      ? Math.min(...results.map(result => result.score)) 
      : 0;
      
    // Tính thời gian trung bình làm bài
    const averageDuration = totalAttempts > 0 && results.some(r => r.timeSpent)
      ? results.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / totalAttempts
      : 0;

    // Đảm bảo sử dụng các enum đúng định nghĩa
    const defaultDifficulty: Difficulty = 'MEDIUM' as Difficulty;
    const defaultCategory: ExamCategory = 'GENERAL' as ExamCategory;
    const defaultForm: ExamForm = 'MULTIPLE_CHOICE' as ExamForm;

    return {
      examId,
      title: exam.title || 'Không có tiêu đề',
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      scoreDistribution: {},
      updatedAt: new Date(),
      subject: exam.subject || '',
      grade: exam.grade || 0,
      difficulty: exam.difficulty || defaultDifficulty,
      examCategory: exam.examCategory || defaultCategory,
      form: exam.form || defaultForm,
      averageDuration
    };
  }

  /**
   * Lấy thống kê chi tiết của bài thi bao gồm các câu hỏi
   * @param params Tham số cho thống kê
   * @returns Thống kê chi tiết
   */
  async getDetailedExamStats(params: ExamStatsParamsDto): Promise<DetailedExamStatsDto> {
    const { examId } = params;
    
    // Lấy thống kê tổng quan
    const basicStats = await this.getExamStats(examId);
    
    // Lấy danh sách câu hỏi của bài thi
    // Lưu ý: Chúng ta cần đảm bảo rằng repository có phương thức để lấy câu hỏi
    const examData = await this.examRepository.findById(examId) as unknown as Exam;
    if (!examData) {
      throw new Error('Bài thi không tồn tại');
    }
    
    // Giả định examData có chứa danh sách câu hỏi, hoặc chúng ta cần lấy riêng
    const examWithQuestions = examData;
    const questionIds = examWithQuestions.questions || [];
    
    // Lấy kết quả chi tiết từng câu hỏi
    const questionStats = await Promise.all(
      questionIds.map(async (question: Question) => {
        return await this.getQuestionStats(question.id);
      })
    );

    return {
      ...basicStats,
      questionStats,
    };
  }

  /**
   * Lấy thống kê của một câu hỏi cụ thể
   * @param questionId ID của câu hỏi
   * @returns Thống kê câu hỏi
   */
  async getQuestionStats(questionId: number): Promise<QuestionStatsDto> {
    // Lấy thông tin câu hỏi - cần đảm bảo repository có phương thức này
    // const question = await this.examRepository.findQuestionById(questionId);
    // Thay thế bằng cách gọi phương thức phù hợp từ repository hoặc service khác
    const question = await this.findQuestionById(questionId);
    if (!question) {
      throw new Error('Câu hỏi không tồn tại');
    }
    
    // Lấy danh sách câu trả lời cho câu hỏi này - cần đảm bảo repository có phương thức này
    // const answers = await this.examResultRepository.findAnswersByQuestionId(questionId);
    // Thay thế bằng cách gọi phương thức phù hợp từ repository
    const answers = await this.findAnswersByQuestionId(questionId);
    
    // Khởi tạo thống kê
    const stats: QuestionStatsDto = {
      questionId,
      orderInExam: 0, // Cần cập nhật giá trị này từ dữ liệu thực tế
      correctRate: 0,
      correctCount: 0,
      totalAnswered: answers.length,
      averageTimeSpent: 0,
      optionDistribution: {},
    };
    
    // Tính toán các thống kê
    if (answers.length > 0) {
      // Đếm số câu trả lời đúng/sai
      stats.correctCount = answers.filter(answer => answer.isCorrect).length;
      stats.correctRate = (stats.correctCount / answers.length) * 100;
      
      // Tính phân bố lựa chọn
      if (question.options) {
        // Khởi tạo phân bố cho mỗi lựa chọn
        question.options.forEach((option: Option, index: number) => {
          stats.optionDistribution[`option_${index}`] = 0;
        });
        
        // Đếm số lượng mỗi lựa chọn được chọn
        answers.forEach(answer => {
          if (answer.selectedAnswer) {
            stats.optionDistribution[`option_${answer.selectedAnswer}`] += 1;
          }
        });
      }
      
      // Tính thời gian trung bình làm bài
      if (answers.some(a => a.timeSpent)) {
        const totalTime = answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
        stats.averageTimeSpent = totalTime / answers.length;
      }
    }
    
    return stats;
  }

  /**
   * Phương thức tạm thời để lấy thông tin câu hỏi
   * Cần thay thế bằng phương thức thực tế từ repository hoặc service khác
   */
  private async findQuestionById(questionId: number): Promise<Question> {
    // Implement logic hoặc gọi đến service/repository phù hợp
    // Đây chỉ là phương thức tạm thời
    return { id: questionId, content: '', options: [] };
  }

  /**
   * Phương thức tạm thời để lấy câu trả lời cho câu hỏi
   * Cần thay thế bằng phương thức thực tế từ repository hoặc service khác
   */
  private async findAnswersByQuestionId(questionId: number): Promise<QuestionAnswer[]> {
    // Implement logic hoặc gọi đến service/repository phù hợp
    // Đây chỉ là phương thức tạm thời
    // Trong triển khai thực tế, questionId sẽ được sử dụng để query database
    console.log(`Finding answers for question ID: ${questionId}`); // Sử dụng questionId để tránh lỗi linter
    return [];
  }

  /**
   * Lấy thống kê về tỷ lệ đỗ của các bài thi
   * @param filters Bộ lọc (môn học, khối lớp, v.v.)
   * @returns Thống kê tỷ lệ đỗ
   */
  async getPassRateStats(filters?: Record<string, unknown>): Promise<Record<string, number>> {
    // Lấy danh sách bài thi phù hợp với bộ lọc
    const filterDto: ExamFilterDto = {}; 
    if (filters) {
      // Chuyển đổi filters thành ExamFilterDto
      Object.keys(filters).forEach(key => {
        (filterDto as Record<string, unknown>)[key] = filters[key];
      });
    }
    
    const examsResult = await this.examRepository.findAll(filterDto);
    
    // Lấy thống kê tỷ lệ đỗ cho từng bài thi
    const passRates: Record<string, number> = {};
    
    const exams = examsResult.exams;
    await Promise.all(
      exams.map(async (examData: unknown) => {
        const exam = examData as unknown as { id: string; title: string };
        const stats = await this.getExamStats(exam.id);
        passRates[exam.title] = stats.passRate;
      })
    );
    
    return passRates;
  }

  /**
   * Lấy thống kê về phân phối điểm của bài thi
   * @param examId ID của bài thi
   * @returns Phân phối điểm theo khoảng
   */
  async getScoreDistribution(examId: string): Promise<Record<string, number>> {
    // Lấy kết quả bài thi
    const rawResults = await this.examResultRepository.findByExam(examId);
    const results = rawResults as ExamResult[];
    
    // Khởi tạo các khoảng điểm
    const distribution: Record<string, number> = {
      '0-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '61-70': 0,
      '71-80': 0,
      '81-90': 0,
      '91-100': 0,
    };
    
    // Phân loại điểm vào từng khoảng
    results.forEach(result => {
      const score = result.score;
      
      if (score <= 10) distribution['0-10']++;
      else if (score <= 20) distribution['11-20']++;
      else if (score <= 30) distribution['21-30']++;
      else if (score <= 40) distribution['31-40']++;
      else if (score <= 50) distribution['41-50']++;
      else if (score <= 60) distribution['51-60']++;
      else if (score <= 70) distribution['61-70']++;
      else if (score <= 80) distribution['71-80']++;
      else if (score <= 90) distribution['81-90']++;
      else distribution['91-100']++;
    });
    
    return distribution;
  }

  /**
   * Cập nhật thống kê bài thi sau khi có thêm lượt làm bài
   * @param examId ID của bài thi
   * @returns Thống kê đã cập nhật
   */
  async updateExamStats(examId: string): Promise<ExamStatsDto> {
    // Đơn giản là tính toán lại các thống kê
    return this.getExamStats(examId);
  }

  /**
   * Lấy thống kê theo thời gian (theo ngày, tuần, tháng)
   * @param examId ID của bài thi
   * @param timeRange Khoảng thời gian
   * @returns Thống kê theo thời gian
   */
  async getStatsByTimeRange(examId: string, timeRange: string): Promise<Record<string, unknown>> {
    // Lấy kết quả bài thi
    const rawResults = await this.examResultRepository.findByExam(examId);
    const results = rawResults as ExamResult[];
    
    // Tính toán thời điểm bắt đầu dựa trên khoảng thời gian
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'day':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // 7 ngày gần nhất
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7 * 4); // 4 tuần gần nhất
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6); // 6 tháng gần nhất
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Mặc định 30 ngày
    }
    
    // Lọc kết quả trong khoảng thời gian
    const filteredResults = results.filter(result => {
      const createdAt = new Date(result.createdAt);
      return createdAt >= startDate && createdAt <= now;
    });
    
    // Nhóm kết quả theo khoảng thời gian
    const groupedData: Record<string, unknown> = {};
    
    if (timeRange === 'day') {
      // Nhóm theo ngày
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayResults = filteredResults.filter(result => {
          const createdAt = new Date(result.createdAt);
          return createdAt.toISOString().split('T')[0] === dateStr;
        });
        
        groupedData[dateStr] = {
          count: dayResults.length,
          averageScore: dayResults.length > 0 
            ? dayResults.reduce((sum, r) => sum + r.score, 0) / dayResults.length 
            : 0,
        };
      }
    } else if (timeRange === 'week') {
      // Nhóm theo tuần
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7 * i);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() - 6);
        
        const weekLabel = `Week ${i + 1}`;
        
        const weekResults = filteredResults.filter(result => {
          const createdAt = new Date(result.createdAt);
          return createdAt <= weekStart && createdAt >= weekEnd;
        });
        
        groupedData[weekLabel] = {
          count: weekResults.length,
          averageScore: weekResults.length > 0 
            ? weekResults.reduce((sum, r) => sum + r.score, 0) / weekResults.length 
            : 0,
        };
      }
    } else {
      // Nhóm theo tháng
      for (let i = 0; i < 6; i++) {
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() - i);
        const monthLabel = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
        
        const monthResults = filteredResults.filter(result => {
          const createdAt = new Date(result.createdAt);
          return createdAt.getMonth() === monthDate.getMonth() && 
                 createdAt.getFullYear() === monthDate.getFullYear();
        });
        
        groupedData[monthLabel] = {
          count: monthResults.length,
          averageScore: monthResults.length > 0 
            ? monthResults.reduce((sum, r) => sum + r.score, 0) / monthResults.length 
            : 0,
        };
      }
    }
    
    return groupedData;
  }

  /**
   * So sánh thống kê giữa các bài thi
   * @param examIds Danh sách ID bài thi cần so sánh
   * @returns Thống kê so sánh
   */
  async compareExamStats(examIds: string[]): Promise<Record<string, ExamStatsDto>> {
    // Lấy thống kê cho từng bài thi
    const statsMap: Record<string, ExamStatsDto> = {};
    
    await Promise.all(
      examIds.map(async (examId) => {
        try {
          const stats = await this.getExamStats(examId);
          statsMap[examId] = stats;
        } catch (error) {
          // Bỏ qua bài thi không tồn tại
          console.error(`Không thể lấy thống kê cho bài thi ID ${examId}: ${error.message}`);
        }
      })
    );
    
    return statsMap;
  }
} 