import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { getErrorMessage, getErrorName } from '../../../utils/error-handler';

/**
 * Interface kết quả trả lời câu hỏi
 */
export interface QuestionAnswerResult {
  questionId: string;
  isCorrect: boolean;
  timeSpent?: number;
  selectedAnswer?: string;
}

/**
 * Enum cho độ khó câu hỏi
 */
export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD'
}

/**
 * DTO cho thống kê câu hỏi
 */
export interface QuestionStatsDto {
  questionId: number | string;
  orderInExam?: number | null;
  correctRate: number;
  correctCount: number;
  totalAnswered: number;
  averageTimeSpent: number;
  optionDistribution: Record<string, number>;
  content?: string;
  difficulty?: string;
  type?: string;
  examIds?: string[];
}

/**
 * Interface cho thống kê câu hỏi nội bộ trong service
 * Được sử dụng để giải quyết vấn đề không tương thích kiểu dữ liệu với QuestionStatsDto từ @project/dto
 */
interface InternalQuestionStatsDto {
  questionId: string;
  orderInExam: number | null;
  correctRate: number;
  correctCount: number;
  totalAnswered: number;
  averageTimeSpent: number;
  optionDistribution: {
    optionId: string;
    count: number;
    percentage: number;
  }[];
}

/**
 * Interface for question difficulty analysis result
 */
export interface QuestionDifficultyAnalysisResult {
  questionId: string;
  currentDifficulty: string | null;
  suggestedDifficulty: string | null;
  correctRate: number;
  totalAnswered: number;
  confidenceLevel: string;
  needsReview: boolean;
}

/**
 * Interface for statistics by question type
 */
export interface TypeStatsResult {
  type: string;
  count: number;
  averageCorrectRate: number;
  averageTimeSpent: number;
  totalAnswered: number;
}

/**
 * Interface for statistics by difficulty level
 */
export interface DifficultyStatsResult {
  difficulty: string;
  count: number;
  averageCorrectRate: number;
  averageTimeSpent: number;
  totalAnswered: number;
}

/**
 * Service xử lý thống kê và phân tích câu hỏi
 */
@Injectable()
export class QuestionStatsService {
  private readonly logger = new Logger(QuestionStatsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Chuyển đổi từ InternalQuestionStatsDto sang QuestionStatsDto
   * @param internalDto - DTO nội bộ
   * @returns QuestionStatsDto phù hợp với định nghĩa từ @project/dto
   */
  private mapToExternalDto(internalDto: InternalQuestionStatsDto): QuestionStatsDto {
    // Có thể giữ nguyên questionId dạng string thay vì chuyển sang number
    // để tránh lỗi chuyển đổi kiểu
    const questionId = internalDto.questionId;
    
    // Chuyển đổi mảng optionDistribution thành Record<string, number>
    const optionDistributionRecord: Record<string, number> = {};
    internalDto.optionDistribution.forEach(option => {
      optionDistributionRecord[option.optionId] = option.count;
    });
    
    return {
      questionId: questionId,
      orderInExam: internalDto.orderInExam,
      correctRate: internalDto.correctRate,
      correctCount: internalDto.correctCount,
      totalAnswered: internalDto.totalAnswered,
      averageTimeSpent: internalDto.averageTimeSpent,
      optionDistribution: optionDistributionRecord
    };
  }

  /**
   * Lấy thống kê tổng quan về câu hỏi
   * @param questionId - ID của câu hỏi cần lấy thống kê
   */
  async getQuestionStats(questionId: string): Promise<QuestionStatsDto> {
    try {
      this.logger.log(`Getting stats for question: ${questionId}`);
      
      const stats = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" WHERE "questionId" = ${questionId}
      `;
      
      // Prisma returns an array when using $queryRaw
      const statsRecord = Array.isArray(stats) && stats.length > 0 ? stats[0] : null;
      
      if (!statsRecord) {
        const internalDto: InternalQuestionStatsDto = {
          questionId,
          orderInExam: null,
          correctRate: 0,
          correctCount: 0,
          totalAnswered: 0,
          averageTimeSpent: 0,
          optionDistribution: [],
        };
        return this.mapToExternalDto(internalDto);
      }
      
      let optionDistribution = [];
      try {
        // Parse optionDistribution from JSON if it's a string
        const optionDistributionData = typeof statsRecord.optionDistribution === 'string'
          ? JSON.parse(statsRecord.optionDistribution)
          : (statsRecord.optionDistribution || {});
        
        // Convert from object format to array format expected by InternalQuestionStatsDto
        optionDistribution = Object.entries(optionDistributionData).map(([optionId, count]) => ({
          optionId,
          count: count as number,
          percentage: statsRecord.totalAnswered > 0 
            ? ((count as number) / statsRecord.totalAnswered) * 100 
            : 0,
        }));
      } catch (e) {
        this.logger.warn(`Error parsing optionDistribution for question ${questionId}: ${getErrorMessage(e)}`);
      }
      
      const internalDto: InternalQuestionStatsDto = {
        questionId: statsRecord.questionId,
        orderInExam: null,
        correctRate: statsRecord.correctRate || 0,
        correctCount: statsRecord.correctCount || 0,
        totalAnswered: statsRecord.totalAnswered || 0,
        averageTimeSpent: statsRecord.averageTimeSpent || 0,
        optionDistribution,
      };
      
      return this.mapToExternalDto(internalDto);
    } catch (error) {
      this.logger.error(`Error getting question stats: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Cập nhật thống kê sau khi học sinh trả lời câu hỏi
   * @param questionId - ID của câu hỏi
   * @param isCorrect - Câu trả lời có đúng không
   * @param timeSpent - Thời gian trả lời (ms)
   * @param selectedOption - Lựa chọn được chọn
   */
  async updateQuestionStats(
    questionId: string,
    isCorrect: boolean,
    timeSpent: number,
    selectedOptionId: string,
  ): Promise<void> {
    try {
      this.logger.log(`Updating stats for question: ${questionId}`);

      // Find or create stats for the question
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" WHERE "questionId" = ${questionId}
      `;
      
      const existingStats = Array.isArray(statsResult) && statsResult.length > 0 
        ? statsResult[0] 
        : null;
      
      if (!existingStats) {
        // Create new stats record
        const optionDistribution = selectedOptionId 
          ? { [selectedOptionId]: 1 } 
          : {};
          
        const now = new Date();
        await this.prisma.$executeRaw`
          INSERT INTO "question_stats" 
          ("questionId", "totalAnswered", "correctCount", "correctRate", "averageTimeSpent", "optionDistribution", "examIds", "createdAt", "updatedAt") 
          VALUES (
            ${questionId}, 
            1, 
            ${isCorrect ? 1 : 0}, 
            ${isCorrect ? 100 : 0}, 
            ${timeSpent || 0}, 
            ${JSON.stringify(optionDistribution)}::jsonb, 
            ARRAY[]::text[], 
            ${now}, 
            ${now}
          )
        `;
      } else {
        // Update existing stats
        const totalAnswered = (existingStats.totalAnswered || 0) + 1;
        const correctCount = (existingStats.correctCount || 0) + (isCorrect ? 1 : 0);
        const correctRate = (correctCount / totalAnswered) * 100;
        
        // Calculate new average time spent
        const currentTotalTime = (existingStats.averageTimeSpent || 0) * (existingStats.totalAnswered || 0);
        const newTotalTime = currentTotalTime + (timeSpent || 0);
        const averageTimeSpent = newTotalTime / totalAnswered;
        
        // Update option distribution
        let optionDistribution = {};
        try {
          optionDistribution = typeof existingStats.optionDistribution === 'string'
            ? JSON.parse(existingStats.optionDistribution)
            : (existingStats.optionDistribution || {});
        } catch (e) {
          this.logger.warn(`Error parsing optionDistribution for question ${questionId}: ${getErrorMessage(e)}`);
        }
        
        if (selectedOptionId) {
          optionDistribution[selectedOptionId] = (optionDistribution[selectedOptionId] || 0) + 1;
        }
        
        // Update the record
        await this.prisma.$executeRaw`
          UPDATE "question_stats" 
          SET 
            "totalAnswered" = ${totalAnswered},
            "correctCount" = ${correctCount},
            "correctRate" = ${correctRate},
            "averageTimeSpent" = ${averageTimeSpent},
            "optionDistribution" = ${JSON.stringify(optionDistribution)}::jsonb,
            "updatedAt" = ${new Date()}
          WHERE "questionId" = ${questionId}
        `;
      }
    } catch (error) {
      this.logger.error(`Error updating question stats: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Phân tích khó khăn của câu hỏi dựa trên tỷ lệ trả lời đúng
   * @param questionId - ID của câu hỏi cần phân tích
   */
  async analyzeQuestionDifficulty(questionId: string) {
    try {
      const stats = await this.getQuestionStats(questionId);
      
      if (stats.totalAnswered < 10) {
        return {
          questionId,
          currentDifficulty: null,
          suggestedDifficulty: null,
          confidenceLevel: 'LOW',
          message: 'Không đủ dữ liệu để phân tích (cần ít nhất 10 lần trả lời)',
        };
      }

      // Lấy độ khó hiện tại của câu hỏi
      const questionResult = await this.prisma.$queryRaw`
        SELECT * FROM "question" WHERE "id" = ${questionId}
      `;
      
      const question = Array.isArray(questionResult) && questionResult.length > 0 ? questionResult[0] : null;
      const currentDifficulty = question ? question.difficulty : null;

      // Phân tích độ khó dựa trên tỷ lệ trả lời đúng
      let suggestedDifficulty: QuestionDifficulty;
      if (stats.correctRate > 80) {
        suggestedDifficulty = QuestionDifficulty.EASY;
      } else if (stats.correctRate > 50) {
        suggestedDifficulty = QuestionDifficulty.MEDIUM;
      } else {
        suggestedDifficulty = QuestionDifficulty.HARD;
      }

      // Xác định mức độ tin cậy dựa trên số lần trả lời
      let confidenceLevel: string;
      if (stats.totalAnswered > 100) {
        confidenceLevel = 'HIGH';
      } else if (stats.totalAnswered > 30) {
        confidenceLevel = 'MEDIUM';
      } else {
        confidenceLevel = 'LOW';
      }

      // Kiểm tra xem có cần xem xét điều chỉnh độ khó không
      const needsReview = suggestedDifficulty !== currentDifficulty;

      return {
        questionId,
        currentDifficulty,
        suggestedDifficulty,
        correctRate: stats.correctRate,
        totalAnswered: stats.totalAnswered,
        confidenceLevel,
        needsReview,
      };
    } catch (error) {
      this.logger.error(`Error analyzing question difficulty: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy danh sách câu hỏi cần xem xét điều chỉnh độ khó
   * @param minimumAnswers Số lượng câu trả lời tối thiểu
   * @param limit Số lượng kết quả tối đa
   */
  async getQuestionsForDifficultyReview(minimumAnswers = 30, limit = 20) {
    try {
      // Lấy danh sách câu hỏi có đủ dữ liệu để phân tích
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" 
        WHERE "totalAnswered" >= ${minimumAnswers}
        LIMIT ${limit}
      `;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      
      // Lấy thông tin về các câu hỏi
      const questionIds = stats.map(s => s.questionId);
      const questionsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question" 
        WHERE "id" IN (${questionIds.join(',')})
      `;
      
      const questions = Array.isArray(questionsResult) ? questionsResult : [];

      // Map questions by ID for easy lookup
      const questionMap = new Map();
      questions.forEach(q => questionMap.set(q.id, q));

      // Phân tích độ khó cho từng câu hỏi
      const results = stats.map(stat => {
        const question = questionMap.get(stat.questionId);
        
        // Xác định độ khó gợi ý dựa trên tỷ lệ đúng
        let suggestedDifficulty: QuestionDifficulty;
        if (stat.correctRate > 0.8) {
          suggestedDifficulty = QuestionDifficulty.EASY;
        } else if (stat.correctRate > 0.5) {
          suggestedDifficulty = QuestionDifficulty.MEDIUM;
        } else {
          suggestedDifficulty = QuestionDifficulty.HARD;
        }

        // Xác định mức độ tin cậy
        let confidenceLevel: string;
        if (stat.totalAnswered > 100) {
          confidenceLevel = 'HIGH';
        } else if (stat.totalAnswered > 50) {
          confidenceLevel = 'MEDIUM';
        } else {
          confidenceLevel = 'LOW';
        }

        const needsReview = suggestedDifficulty !== question?.difficulty;

        return {
          questionId: stat.questionId,
          currentDifficulty: question?.difficulty || null,
          suggestedDifficulty,
          correctRate: stat.correctRate,
          totalAnswered: stat.totalAnswered,
          confidenceLevel,
          needsReview,
        };
      });

      // Sắp xếp kết quả theo mức độ cần xem xét và độ lệch
      return results.sort((a, b) => {
        // Ưu tiên các câu hỏi cần xem xét
        if (a.needsReview !== b.needsReview) {
          return a.needsReview ? -1 : 1;
        }
        
        // Sau đó ưu tiên theo độ lệch
        const aDiff = Math.abs(getDifficultyValue(a.currentDifficulty) - getDifficultyValue(a.suggestedDifficulty));
        const bDiff = Math.abs(getDifficultyValue(b.currentDifficulty) - getDifficultyValue(b.suggestedDifficulty));
        
        return bDiff - aDiff;
      });
    } catch (error) {
      this.logger.error(`Error getting questions for difficulty review: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy thống kê theo loại câu hỏi
   */
  async getStatsByQuestionType() {
    try {
      // Lấy tất cả thống kê
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats"
      `;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      
      // Lấy thông tin về loại câu hỏi
      const questionIds = stats.map(s => s.questionId);
      const questionsResult = await this.prisma.$queryRaw`
        SELECT q.*, qt."type" 
        FROM "question" q
        LEFT JOIN "question_type" qt ON q."questionTypeId" = qt.id
        WHERE q."id" IN (${questionIds.join(',')})
      `;
      
      const questions = Array.isArray(questionsResult) ? questionsResult : [];
      
      // Group theo loại câu hỏi
      const typeStats = new Map<string, { count: number, totalCorrectRate: number, totalTimeSpent: number, totalAnswered: number }>();
      
      // Khởi tạo map
      questions.forEach(question => {
        const type = question.type || 'unknown';
        if (!typeStats.has(type)) {
          typeStats.set(type, { count: 0, totalCorrectRate: 0, totalTimeSpent: 0, totalAnswered: 0 });
        }
      });
      
      // Fill data
      stats.forEach(stat => {
        const question = questions.find(q => q.id === stat.questionId);
        if (question) {
          const type = question.type || 'unknown';
          const typeStat = typeStats.get(type);
          if (typeStat) {
            typeStat.count++;
            typeStat.totalCorrectRate += stat.correctRate;
            typeStat.totalTimeSpent += stat.averageTimeSpent;
            typeStat.totalAnswered += stat.totalAnswered;
          }
        }
      });
      
      // Calculate averages and format results
      return Array.from(typeStats.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        averageCorrectRate: data.count > 0 ? data.totalCorrectRate / data.count : 0,
        averageTimeSpent: data.count > 0 ? data.totalTimeSpent / data.count : 0,
        totalAnswered: data.totalAnswered
      }));
    } catch (error) {
      this.logger.error(`Error getting stats by question type: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy thống kê theo độ khó của câu hỏi
   */
  async getStatsByDifficulty() {
    try {
      // Lấy tất cả thống kê
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats"
      `;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      
      // Lấy thông tin về độ khó câu hỏi
      const questionIds = stats.map(s => s.questionId);
      const questionsResult = await this.prisma.$queryRaw`
        SELECT q.*, qd."difficultyLevel" as "difficulty"
        FROM "question" q
        LEFT JOIN "question_difficulty" qd ON q."difficultyId" = qd.id
        WHERE q."id" IN (${questionIds.join(',')})
      `;
      
      const questions = Array.isArray(questionsResult) ? questionsResult : [];
      
      // Group theo độ khó
      const difficultyStats = new Map<string, { count: number, totalCorrectRate: number, totalTimeSpent: number, totalAnswered: number }>();
      
      // Khởi tạo map cho tất cả độ khó
      [QuestionDifficulty.EASY, QuestionDifficulty.MEDIUM, QuestionDifficulty.HARD].forEach(diff => {
        difficultyStats.set(diff, { count: 0, totalCorrectRate: 0, totalTimeSpent: 0, totalAnswered: 0 });
      });
      
      // Fill data
      stats.forEach(stat => {
        const question = questions.find(q => q.id === stat.questionId);
        if (question && question.difficulty) {
          const difficulty = question.difficulty as string;
          const diffStat = difficultyStats.get(difficulty);
          if (diffStat) {
            diffStat.count++;
            diffStat.totalCorrectRate += stat.correctRate;
            diffStat.totalTimeSpent += stat.averageTimeSpent;
            diffStat.totalAnswered += stat.totalAnswered;
          }
        }
      });
      
      // Calculate averages and format results
      return Array.from(difficultyStats.entries()).map(([difficulty, data]) => ({
        difficulty,
        count: data.count,
        averageCorrectRate: data.count > 0 ? data.totalCorrectRate / data.count : 0,
        averageTimeSpent: data.count > 0 ? data.totalTimeSpent / data.count : 0,
        totalAnswered: data.totalAnswered
      }));
    } catch (error) {
      this.logger.error(`Error getting stats by difficulty: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Đăng ký câu hỏi trong bài thi
   * @param questionId ID của câu hỏi
   * @param examId ID của bài thi
   */
  async registerQuestionInExam(questionId: string, examId: string): Promise<void> {
    try {
      // Find or create stats for the question
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" WHERE "questionId" = ${questionId}
      `;
      
      const stats = Array.isArray(statsResult) && statsResult.length > 0 ? statsResult[0] : null;
      
      if (!stats) {
        // Create new stats if not exists
        const now = new Date();
        await this.prisma.$executeRaw`
          INSERT INTO "question_stats" 
          ("questionId", "totalAnswered", "correctCount", "correctRate", "averageTimeSpent", "optionDistribution", "examIds", "createdAt", "updatedAt") 
          VALUES (
            ${questionId}, 
            0, 
            0, 
            0, 
            0, 
            '{}'::jsonb, 
            ARRAY[${examId}]::text[], 
            ${now}, 
            ${now}
          )
        `;
      } else {
        // Update examIds if stats exists
        const examIds = stats.examIds || [];
        if (!examIds.includes(examId)) {
          const updatedExamIds = [...examIds, examId];
          await this.prisma.$executeRaw`
            UPDATE "question_stats" 
            SET "examIds" = ${updatedExamIds}::text[] 
            WHERE "questionId" = ${questionId}
          `;
        }
      }
    } catch (error) {
      this.logger.error(`Error registering question in exam: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy thống kê cho một hoặc nhiều câu hỏi
   * @param questionIds ID của câu hỏi hoặc mảng ID
   */
  async getMultipleQuestionStats(questionIds: string[]): Promise<QuestionStatsDto[]> {
    try {
      if (!questionIds || questionIds.length === 0) {
        return [];
      }

      // Get stats for all specified questions
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" 
        WHERE "questionId" IN (${questionIds.join(',')})
      `;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      
      // Get all questions
      const questionsResult = await this.prisma.$queryRaw`
        SELECT q.*, 
               qd."difficultyLevel" as "difficulty", 
               qt."type" as "questionType" 
        FROM "question" q
        LEFT JOIN "question_difficulty" qd ON q."difficultyId" = qd.id
        LEFT JOIN "question_type" qt ON q."questionTypeId" = qt.id
        WHERE q."id" IN (${questionIds.join(',')})
      `;
      
      const questions = Array.isArray(questionsResult) ? questionsResult : [];
      
      // Map stats to full DTO data
      return questionIds.map(id => {
        const stat = stats.find(s => s.questionId === id);
        const question = questions.find(q => q.id === id);
        
        if (!stat || !question) {
          return null;
        }
        
        // Parse optionDistribution 
        let optionDistribution = {};
        try {
          optionDistribution = typeof stat.optionDistribution === 'string'
            ? JSON.parse(stat.optionDistribution)
            : (stat.optionDistribution || {});
        } catch (e) {
          this.logger.warn(`Error parsing optionDistribution for question ${id}: ${getErrorMessage(e)}`);
        }
        
        return {
          questionId: id,
          content: question.content,
          difficulty: question.difficulty || 'unknown',
          type: question.questionType || 'unknown',
          correctRate: stat.correctRate || 0,
          totalAnswered: stat.totalAnswered || 0,
          correctCount: stat.correctCount || 0,
          averageTimeSpent: stat.averageTimeSpent || 0,
          optionDistribution: optionDistribution,
          examIds: stat.examIds || []
        };
      }).filter(Boolean);
    } catch (error) {
      this.logger.error(`Error getting multiple question stats: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy danh sách câu hỏi khó nhất dựa trên tỷ lệ trả lời đúng
   * @param limit Số lượng kết quả tối đa
   */
  async getMostDifficultQuestions(limit = 10): Promise<QuestionStatsDto[]> {
    try {
      // Lấy câu hỏi có tỷ lệ trả lời đúng thấp nhất
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" 
        WHERE "totalAnswered" > 10
        ORDER BY "correctRate" ASC
        LIMIT ${limit}
      `;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      
      return this.getMultipleQuestionStats(stats.map(s => s.questionId));
    } catch (error) {
      this.logger.error(`Error getting most difficult questions: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy danh sách câu hỏi dễ nhất dựa trên tỷ lệ trả lời đúng
   * @param limit Số lượng kết quả tối đa
   */
  async getEasiestQuestions(limit = 10): Promise<QuestionStatsDto[]> {
    try {
      // Lấy câu hỏi có tỷ lệ trả lời đúng cao nhất
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" 
        WHERE "totalAnswered" > 10
        ORDER BY "correctRate" DESC
        LIMIT ${limit}
      `;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      
      return this.getMultipleQuestionStats(stats.map(s => s.questionId));
    } catch (error) {
      this.logger.error(`Error getting easiest questions: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy danh sách câu hỏi tiêu tốn nhiều thời gian nhất
   * @param limit Số lượng kết quả tối đa
   */
  async getTimeConsumingQuestions(limit = 10): Promise<QuestionStatsDto[]> {
    try {
      // Lấy câu hỏi có thời gian trả lời trung bình cao nhất
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" 
        WHERE "totalAnswered" > 5
        ORDER BY "averageTimeSpent" DESC
        LIMIT ${limit}
      `;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      
      return this.getMultipleQuestionStats(stats.map(s => s.questionId));
    } catch (error) {
      this.logger.error(`Error getting time consuming questions: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }

  /**
   * Lấy danh sách câu hỏi được sử dụng nhiều nhất
   * @param limit Số lượng kết quả
   */
  async getMostUsedQuestionIds(limit: number): Promise<string[]> {
    try {
      this.logger.log(`Lấy ${limit} câu hỏi có nhiều lượt trả lời nhất`);
      
      // Sử dụng raw query thay vì truy cập trực tiếp vào questionStats
      const result = await this.prisma.$queryRaw`
        SELECT "questionId" FROM "question_stats"
        ORDER BY "totalAnswered" DESC
        LIMIT ${limit}
      `;
      
      const questions = Array.isArray(result) ? result : [];
      return questions.map((q: { questionId: string }) => q.questionId);
    } catch (error) {
      this.logger.error(`Lỗi khi lấy câu hỏi có nhiều lượt trả lời: ${getErrorMessage(error)}`, getErrorName(error));
      return [];
    }
  }

  /**
   * Lấy danh sách các câu hỏi có nhiều lượt trả lời nhất
   * @param limit Số lượng kết quả tối đa
   * @returns Danh sách ID của các câu hỏi
   */
  async getTopAnsweredQuestions(limit = 10): Promise<string[]> {
    return this.getMostUsedQuestionIds(limit);
  }

  /**
   * Cập nhật thống kê cho một câu hỏi dựa trên kết quả trả lời
   * @param result Kết quả trả lời
   */
  async updateStatsFromAnswerResult(result: QuestionAnswerResult): Promise<void> {
    try {
      const { questionId, isCorrect, timeSpent, selectedAnswer } = result;
      
      // Check if stats exists
      const statsResult = await this.prisma.$queryRaw`
        SELECT * FROM "question_stats" WHERE "questionId" = ${questionId}
      `;
      
      const existingStats = Array.isArray(statsResult) && statsResult.length > 0 
        ? statsResult[0] 
        : null;
      
      if (!existingStats) {
        // Create new stats record
        const optionDistribution = selectedAnswer 
          ? { [selectedAnswer]: 1 } 
          : {};
          
        const now = new Date();
        await this.prisma.$executeRaw`
          INSERT INTO "question_stats" 
          ("questionId", "totalAnswered", "correctCount", "correctRate", "averageTimeSpent", "optionDistribution", "examIds", "createdAt", "updatedAt") 
          VALUES (
            ${questionId}, 
            1, 
            ${isCorrect ? 1 : 0}, 
            ${isCorrect ? 100 : 0}, 
            ${timeSpent || 0}, 
            ${JSON.stringify(optionDistribution)}::jsonb, 
            ARRAY[]::text[], 
            ${now}, 
            ${now}
          )
        `;
      } else {
        // Update existing stats
        const totalAnswered = (existingStats.totalAnswered || 0) + 1;
        const correctCount = (existingStats.correctCount || 0) + (isCorrect ? 1 : 0);
        const correctRate = (correctCount / totalAnswered) * 100;
        
        // Calculate new average time spent
        const currentTotalTime = (existingStats.averageTimeSpent || 0) * (existingStats.totalAnswered || 0);
        const newTotalTime = currentTotalTime + (timeSpent || 0);
        const averageTimeSpent = newTotalTime / totalAnswered;
        
        // Update option distribution
        let optionDistribution = {};
        try {
          optionDistribution = typeof existingStats.optionDistribution === 'string'
            ? JSON.parse(existingStats.optionDistribution)
            : (existingStats.optionDistribution || {});
        } catch (e) {
          this.logger.warn(`Error parsing optionDistribution for question ${questionId}: ${getErrorMessage(e)}`);
        }
        
        if (selectedAnswer) {
          optionDistribution[selectedAnswer] = (optionDistribution[selectedAnswer] || 0) + 1;
        }
        
        // Update the record
        await this.prisma.$executeRaw`
          UPDATE "question_stats" 
          SET 
            "totalAnswered" = ${totalAnswered},
            "correctCount" = ${correctCount},
            "correctRate" = ${correctRate},
            "averageTimeSpent" = ${averageTimeSpent},
            "optionDistribution" = ${JSON.stringify(optionDistribution)}::jsonb,
            "updatedAt" = ${new Date()}
          WHERE "questionId" = ${questionId}
        `;
      }
    } catch (error) {
      this.logger.error(`Error updating stats from answer result: ${getErrorMessage(error)}`, getErrorName(error));
      throw error;
    }
  }
}

/**
 * Utility function to convert difficulty string to numeric value
 */
function getDifficultyValue(difficulty: string | null): number {
  switch (difficulty) {
    case QuestionDifficulty.EASY:
      return 1;
    case QuestionDifficulty.MEDIUM:
      return 2;
    case QuestionDifficulty.HARD:
      return 3;
    case QuestionDifficulty.VERY_HARD:
      return 4;
    default:
      return 0;
  }
} 
