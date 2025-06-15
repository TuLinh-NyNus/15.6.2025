import { 
  Controller, 
  Get, 
  UseGuards, 
  Param, 
  Query,
  ParseUUIDPipe,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { Permission } from '../../../common/enums/permission.enum';
import { 
  DetailedExamStatsDto, 
  ExamStatsDto, 
  ExamStatsParamsDto, 
  QuestionStatsDto 
} from '@project/dto';
import { IExamStatsService } from '@project/interfaces';

@ApiTags('exam-stats')
@Controller('exam-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamStatsController {
  constructor(
    private readonly examStatsService: IExamStatsService
  ) {}

  @Get('exams/:examId')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan của bài thi' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê tổng quan.', type: ExamStatsDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM)
  @ApiBearerAuth()
  getExamStats(@Param('examId', ParseUUIDPipe) examId: string) {
    return this.examStatsService.getExamStats(examId);
  }

  @Get('exams/:examId/detailed')
  @ApiOperation({ summary: 'Lấy thống kê chi tiết của bài thi bao gồm các câu hỏi' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê chi tiết.', type: DetailedExamStatsDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM)
  @ApiBearerAuth()
  getDetailedExamStats(
    @Param('examId', ParseUUIDPipe) examId: string,
    @Query() params: ExamStatsParamsDto
  ) {
    const statsParams = { ...params, examId };
    return this.examStatsService.getDetailedExamStats(statsParams);
  }

  @Get('questions/:questionId')
  @ApiOperation({ summary: 'Lấy thống kê của một câu hỏi cụ thể' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê câu hỏi.', type: QuestionStatsDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi.' })
  @ApiParam({ name: 'questionId', description: 'ID của câu hỏi', type: Number })
  @RequirePermissions(Permission.READ_EXAM_QUESTION)
  @ApiBearerAuth()
  getQuestionStats(@Param('questionId', ParseIntPipe) questionId: number) {
    return this.examStatsService.getQuestionStats(questionId);
  }

  @Get('pass-rate')
  @ApiOperation({ summary: 'Lấy thống kê về tỷ lệ đỗ của các bài thi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về thống kê tỷ lệ đỗ.',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'number'
      }
    }
  })
  @RequirePermissions(Permission.READ_EXAM)
  @ApiBearerAuth()
  getPassRateStats() {
    return this.examStatsService.getPassRateStats();
  }

  @Get('exams/:examId/score-distribution')
  @ApiOperation({ summary: 'Lấy thống kê về phân phối điểm của bài thi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về phân phối điểm theo khoảng.',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'number'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM)
  @ApiBearerAuth()
  getScoreDistribution(@Param('examId', ParseUUIDPipe) examId: string) {
    return this.examStatsService.getScoreDistribution(examId);
  }

  @Get('exams/:examId/time-range/:timeRange')
  @ApiOperation({ summary: 'Lấy thống kê theo thời gian (theo ngày, tuần, tháng)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về thống kê theo thời gian.',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'timeRange', description: 'Khoảng thời gian (day, week, month)', type: String })
  @RequirePermissions(Permission.READ_EXAM)
  @ApiBearerAuth()
  getStatsByTimeRange(
    @Param('examId', ParseUUIDPipe) examId: string,
    @Param('timeRange') timeRange: string
  ) {
    return this.examStatsService.getStatsByTimeRange(examId, timeRange);
  }

  @Get('compare')
  @ApiOperation({ summary: 'So sánh thống kê giữa các bài thi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về thống kê so sánh.',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object'
      }
    }
  })
  @RequirePermissions(Permission.READ_EXAM)
  @ApiBearerAuth()
  compareExamStats(@Query('examIds') examIds: string) {
    const examIdArray = examIds.split(',');
    return this.examStatsService.compareExamStats(examIdArray);
  }
} 
