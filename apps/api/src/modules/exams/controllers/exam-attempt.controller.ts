import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@project/entities';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AttemptService } from '../services/attempt.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('exam-attempts')
@Controller('exam-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExamAttemptController {
  constructor(
    private readonly attemptService: AttemptService,
  ) {}

  @Post('start/:examId')
  @ApiOperation({ summary: 'Bắt đầu làm bài thi mới' })
  @ApiResponse({ status: 201, description: 'Phiên làm bài mới được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi' })
  @Roles(UserRole.STUDENT)
  async startExam(
    @Param('examId') examId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.attemptService.startExamAttempt(userId, examId);
  }

  @Get(':attemptId')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết về lần làm bài' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết về lần làm bài' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lần làm bài' })
  @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
  async getAttemptById(@Param('attemptId') attemptId: string) {
    const attempt = await this.attemptService.getResultById(attemptId);
    if (!attempt) {
      throw new NotFoundException(`Không tìm thấy lần làm bài với ID: ${attemptId}`);
    }
    return attempt;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách lần làm bài của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách lần làm bài' })
  @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
  async getUserAttempts(
    @Param('userId') userId: string,
    @Query('examId') examId?: string,
  ) {
    // Nếu có examId, lấy danh sách lần làm bài của user cho bài thi cụ thể
    if (examId) {
      const results = await this.attemptService.getResultsByUser(userId);
      return results.filter((result: Record<string, unknown>) => {
        const examIdKey = 'examId' in result ? 'examId' : 'exam_id';
        return result[examIdKey] === examId;
      });
    }
    
    // Lấy tất cả các lần làm bài của user
    return this.attemptService.getResultsByUser(userId);
  }

  @Post(':attemptId/submit')
  @ApiOperation({ summary: 'Nộp bài thi và tính điểm' })
  @ApiResponse({ status: 200, description: 'Bài thi được nộp thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lần làm bài' })
  @Roles(UserRole.STUDENT)
  async submitExam(
    @Param('attemptId') attemptId: string,
    @Body() answers: Record<string, unknown>,
  ) {
    return this.attemptService.submitExamAttempt(attemptId, answers);
  }

  @Get('exam/:examId')
  @ApiOperation({ summary: 'Lấy danh sách lần làm bài của một bài thi' })
  @ApiResponse({ status: 200, description: 'Danh sách lần làm bài' })
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async getExamAttempts(@Param('examId') examId: string) {
    return this.attemptService.getResultsByExam(examId);
  }
} 