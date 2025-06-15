import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Put,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { Permission } from '../../../common/enums/permission.enum';
import { UserRole } from '@project/entities';
import { ExamFilterDto } from '@project/dto';
import { IExamResultService } from '@project/interfaces';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('exam-results')
@Controller('exams/:examId/results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamResultsController {
  constructor(
    private readonly examResultsService: IExamResultService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách kết quả bài thi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về danh sách kết quả bài thi được phân trang.' 
  })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM_RESULT)
  findAll(
    @Param('examId', ParseUUIDPipe) examId: string,
    @Query() filters: ExamFilterDto
  ) {
    return this.examResultsService.getAllResults(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết kết quả bài thi theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin kết quả bài thi.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kết quả bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'id', description: 'ID của kết quả bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM_RESULT)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examResultsService.getResultById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo kết quả bài thi mới' })
  @ApiResponse({ status: 201, description: 'Tạo kết quả bài thi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_EXAM_RESULT)
  @ApiBearerAuth()
  create(
    @Param('examId', ParseUUIDPipe) examId: string,
    @Body() resultData: unknown
  ) {
    return this.examResultsService.createResult(resultData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin kết quả bài thi' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin kết quả bài thi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kết quả bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'id', description: 'ID của kết quả bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_EXAM_RESULT)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resultData: unknown
  ) {
    return this.examResultsService.updateResult(id, resultData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa kết quả bài thi' })
  @ApiResponse({ status: 200, description: 'Xóa kết quả bài thi thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kết quả bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'id', description: 'ID của kết quả bài thi', type: String })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.DELETE_EXAM_RESULT)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.examResultsService.deleteResult(id);
  }

  @Post('start')
  @ApiOperation({ summary: 'Bắt đầu làm bài thi mới' })
  @ApiResponse({ status: 201, description: 'Bắt đầu làm bài thi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_EXAM_RESULT)
  @ApiBearerAuth()
  startExam(
    @Param('examId', ParseUUIDPipe) examId: string,
    @CurrentUser() user: { id: string }
  ) {
    return this.examResultsService.startExamAttempt(user.id, examId);
  }

  @Post(':attemptId/submit')
  @ApiOperation({ summary: 'Nộp bài thi và tính điểm' })
  @ApiResponse({ status: 200, description: 'Nộp bài thi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lần làm bài.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'attemptId', description: 'ID của lần làm bài', type: String })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_EXAM_RESULT)
  @ApiBearerAuth()
  submitExam(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() answers: unknown
  ) {
    return this.examResultsService.submitExamAttempt(attemptId, answers);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy kết quả bài thi theo người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách kết quả bài thi của người dùng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'userId', description: 'ID của người dùng', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.READ_EXAM_RESULT)
  @ApiBearerAuth()
  getResultsByUser(
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return this.examResultsService.getResultsByUser(userId);
  }

  @Get('performance/:userId')
  @ApiOperation({ summary: 'Lấy hiệu suất làm bài của người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê hiệu suất.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng hoặc bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'userId', description: 'ID của người dùng', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.READ_EXAM_RESULT)
  @ApiBearerAuth()
  getUserPerformance(
    @Param('examId', ParseUUIDPipe) examId: string,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return this.examResultsService.getUserPerformance(userId, examId);
  }

  @Get('stats/average-score')
  @ApiOperation({ summary: 'Tính điểm trung bình cho bài thi' })
  @ApiResponse({ status: 200, description: 'Trả về điểm trung bình.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.READ_EXAM_RESULT)
  @ApiBearerAuth()
  getAverageScore(
    @Param('examId', ParseUUIDPipe) examId: string
  ) {
    return this.examResultsService.calculateAverageScore(examId);
  }
} 
