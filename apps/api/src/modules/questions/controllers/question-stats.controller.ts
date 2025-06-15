import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QuestionStatsService } from '../services/question-stats.service';
import { getErrorMessage, getErrorName } from '../../../utils/error-handler';

/**
 * DTO cho response lấy thống kê câu hỏi
 */
class QuestionStatDto {
  questionId: string;
  orderInExam: number | null;
  correctRate: number;
  correctCount: number;
  totalAnswered: number;
  averageTimeSpent: number;
  optionDistribution: Array<{
    optionId: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * DTO cho response phân tích độ khó câu hỏi
 */
class QuestionDifficultyAnalysisDto {
  questionId: string;
  currentDifficulty: string | null;
  suggestedDifficulty: string | null;
  correctRate: number;
  totalAnswered: number;
  confidenceLevel: string;
  needsReview: boolean;
}

/**
 * DTO cho response thống kê theo loại câu hỏi
 */
class CategoryStatsDto {
  type: string;
  count: number;
  averageCorrectRate: number;
  averageTimeSpent: number;
  totalAnswered: number;
}

/**
 * DTO cho response thống kê theo độ khó câu hỏi
 */
class DifficultyStatsDto {
  difficulty: string;
  count: number;
  averageCorrectRate: number;
  averageTimeSpent: number;
  totalAnswered: number;
}

/**
 * Controller quản lý các endpoints thống kê câu hỏi
 */
@ApiTags('Question Stats')
@Controller('question-stats')
export class QuestionStatsController {
  private readonly logger = new Logger(QuestionStatsController.name);

  constructor(private readonly questionStatsService: QuestionStatsService) {}

  /**
   * Lấy danh sách câu hỏi được sử dụng nhiều nhất
   */
  @Get('most-used')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi được sử dụng nhiều nhất' })
  @ApiQuery({
    name: 'limit',
    description: 'Số lượng kết quả tối đa',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi được sử dụng nhiều nhất',
    type: [QuestionStatDto],
  })
  async getMostUsedQuestions(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      this.logger.log(`Yêu cầu lấy ${limit} câu hỏi được sử dụng nhiều nhất`);
      
      // Lấy danh sách các câu hỏi có nhiều lượt trả lời nhất
      const questionIds = await this.questionStatsService.getTopAnsweredQuestions(limit);
      const stats = await this.questionStatsService.getMultipleQuestionStats(questionIds);
      
      return stats;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy câu hỏi được sử dụng nhiều nhất: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể lấy danh sách câu hỏi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy kết quả phân tích độ khó câu hỏi
   */
  @Get('difficulty-analysis')
  @ApiOperation({ summary: 'Lấy kết quả phân tích độ khó câu hỏi' })
  @ApiQuery({
    name: 'minimumAnswers',
    description: 'Số lượng câu trả lời tối thiểu để phân tích',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Số lượng kết quả tối đa',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả phân tích độ khó',
    type: [QuestionDifficultyAnalysisDto],
  })
  async getDifficultyAnalysis(
    @Query('minimumAnswers', new DefaultValuePipe(30), ParseIntPipe) minimumAnswers: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    try {
      this.logger.log(`Yêu cầu phân tích độ khó câu hỏi (tối thiểu ${minimumAnswers} câu trả lời, giới hạn ${limit} kết quả)`);
      
      const results = await this.questionStatsService.getQuestionsForDifficultyReview(
        minimumAnswers,
        limit
      );
      
      return results;
    } catch (error) {
      this.logger.error(`Lỗi khi phân tích độ khó câu hỏi: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể phân tích độ khó câu hỏi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thống kê chi tiết của một câu hỏi
   */
  @Get('questions/:questionId')
  @ApiOperation({ summary: 'Lấy thống kê chi tiết của một câu hỏi' })
  @ApiParam({
    name: 'questionId',
    description: 'ID của câu hỏi cần lấy thống kê',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê chi tiết của câu hỏi',
    type: QuestionStatDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy câu hỏi',
  })
  async getQuestionStats(@Param('questionId') questionId: string) {
    try {
      this.logger.log(`Yêu cầu lấy thống kê chi tiết cho câu hỏi: ${questionId}`);
      
      const stats = await this.questionStatsService.getQuestionStats(questionId);
      
      return stats;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thống kê câu hỏi ${questionId}: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể lấy thống kê câu hỏi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thống kê theo loại câu hỏi
   */
  @Get('by-category')
  @ApiOperation({ summary: 'Lấy thống kê theo loại câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê theo loại câu hỏi',
    type: [CategoryStatsDto],
  })
  async getStatsByCategory() {
    try {
      this.logger.log('Yêu cầu lấy thống kê theo loại câu hỏi');
      
      const results = await this.questionStatsService.getStatsByQuestionType();
      
      return results;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thống kê theo loại câu hỏi: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể lấy thống kê theo loại câu hỏi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thống kê theo độ khó của câu hỏi
   */
  @Get('by-difficulty')
  @ApiOperation({ summary: 'Lấy thống kê theo độ khó của câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê theo độ khó của câu hỏi',
    type: [DifficultyStatsDto],
  })
  async getStatsByDifficulty() {
    try {
      this.logger.log('Yêu cầu lấy thống kê theo độ khó của câu hỏi');
      
      const results = await this.questionStatsService.getStatsByDifficulty();
      
      return results;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thống kê theo độ khó của câu hỏi: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể lấy thống kê theo độ khó của câu hỏi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thống kê về thời gian làm câu hỏi
   */
  @Get('time-analysis')
  @ApiOperation({ summary: 'Lấy thống kê về thời gian làm câu hỏi' })
  @ApiQuery({
    name: 'limit',
    description: 'Số lượng kết quả tối đa',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê về thời gian làm câu hỏi',
    type: [QuestionStatDto],
  })
  async getTimeAnalysis(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      this.logger.log(`Yêu cầu lấy thống kê về thời gian làm ${limit} câu hỏi`);
      
      const results = await this.questionStatsService.getTimeConsumingQuestions(limit);
      
      return results;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thống kê về thời gian làm câu hỏi: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể lấy thống kê về thời gian làm câu hỏi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách câu hỏi khó nhất dựa trên tỷ lệ trả lời đúng
   */
  @Get('most-difficult')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi khó nhất dựa trên tỷ lệ trả lời đúng' })
  @ApiQuery({
    name: 'limit',
    description: 'Số lượng kết quả tối đa',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi khó nhất',
    type: [QuestionStatDto],
  })
  async getMostDifficultQuestions(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      this.logger.log(`Yêu cầu lấy ${limit} câu hỏi khó nhất`);
      
      const results = await this.questionStatsService.getMostDifficultQuestions(limit);
      
      return results;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy danh sách câu hỏi khó nhất: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể lấy danh sách câu hỏi khó nhất',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách câu hỏi dễ nhất dựa trên tỷ lệ trả lời đúng
   */
  @Get('easiest')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi dễ nhất dựa trên tỷ lệ trả lời đúng' })
  @ApiQuery({
    name: 'limit',
    description: 'Số lượng kết quả tối đa',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi dễ nhất',
    type: [QuestionStatDto],
  })
  async getEasiestQuestions(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      this.logger.log(`Yêu cầu lấy ${limit} câu hỏi dễ nhất`);
      
      const results = await this.questionStatsService.getEasiestQuestions(limit);
      
      return results;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy danh sách câu hỏi dễ nhất: ${getErrorMessage(error)}`, getErrorName(error));
      throw new HttpException(
        'Không thể lấy danh sách câu hỏi dễ nhất',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 
