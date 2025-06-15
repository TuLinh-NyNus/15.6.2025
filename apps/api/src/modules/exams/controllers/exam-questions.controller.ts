import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Put,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { Permission } from '../../../common/enums/permission.enum';
import { UserRole } from '@project/entities';
import { IExamQuestionService } from '@project/interfaces';

@ApiTags('exam-questions')
@Controller('exams/:examId/questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamQuestionsController {
  constructor(
    private readonly examQuestionsService: IExamQuestionService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi của bài thi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi của bài thi.',
    isArray: true
  })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM_QUESTION)
  findAll(@Param('examId', ParseUUIDPipe) examId: string) {
    return this.examQuestionsService.getQuestionsByExamId(examId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết câu hỏi theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin câu hỏi.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi', type: Number })
  @RequirePermissions(Permission.READ_EXAM_QUESTION)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examQuestionsService.getQuestionById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo câu hỏi mới cho bài thi' })
  @ApiResponse({ status: 201, description: 'Tạo câu hỏi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_EXAM_QUESTION)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  create(@Param('examId', ParseUUIDPipe) examId: string, @Body() questionData: unknown) {
    return this.examQuestionsService.createQuestion(examId, questionData);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Tạo nhiều câu hỏi cùng lúc cho bài thi' })
  @ApiResponse({ status: 201, description: 'Tạo các câu hỏi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_EXAM_QUESTION)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  createMany(@Param('examId', ParseUUIDPipe) examId: string, @Body() questionsData: unknown[]) {
    return this.examQuestionsService.createManyQuestions(examId, questionsData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin câu hỏi' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin câu hỏi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_EXAM_QUESTION)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() questionData: unknown
  ) {
    return this.examQuestionsService.updateQuestion(id, questionData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa câu hỏi' })
  @ApiResponse({ status: 200, description: 'Xóa câu hỏi thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi', type: Number })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.DELETE_EXAM_QUESTION)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.examQuestionsService.deleteQuestion(id);
  }

  @Post('shuffle')
  @ApiOperation({ summary: 'Xáo trộn thứ tự các câu hỏi trong bài thi' })
  @ApiResponse({ status: 200, description: 'Xáo trộn câu hỏi thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'examId', description: 'ID của bài thi', type: String })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_EXAM_QUESTION)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  shuffleQuestions(@Param('examId', ParseUUIDPipe) examId: string) {
    return this.examQuestionsService.shuffleQuestions(examId);
  }
} 
