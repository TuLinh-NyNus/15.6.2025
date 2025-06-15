import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Query,
  Put,
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
import { 
  CreateExamDto, 
  ExamFilterDto, 
  ExamResponseDto, 
  UpdateExamDto,
  ExamStatsParamsDto,
  DetailedExamStatsDto,
  QuestionFilterDto
} from '@project/dto';
import { ExamCategory } from '@project/entities';
import { IExamService, IExamQuestionService } from '@project/interfaces';

@ApiTags('exams')
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(
    private readonly examsService: IExamService,
    private readonly examQuestionService: IExamQuestionService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài thi với phân trang và lọc' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về danh sách bài thi được phân trang.', 
    type: ExamResponseDto,
    isArray: true 
  })
  @RequirePermissions(Permission.READ_EXAM)
  findAll(@Query() filters: ExamFilterDto) {
    return this.examsService.getAllExams(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bài thi theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin bài thi.', type: ExamResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'id', description: 'ID của bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.getExamById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài thi mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài thi thành công.', type: ExamResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.CREATE_EXAM)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.createExam(createExamDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin bài thi' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin bài thi thành công.', type: ExamResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'id', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_EXAM)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.updateExam(id, updateExamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài thi' })
  @ApiResponse({ status: 200, description: 'Xóa bài thi thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'id', description: 'ID của bài thi', type: String })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.DELETE_EXAM)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.examsService.deleteExam(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách các loại bài thi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về danh sách các loại bài thi.', 
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          value: { type: 'string' }
        }
      }
    }
  })
  @RequirePermissions(Permission.READ_EXAM)
  getCategories() {
    const categories = Object.values(ExamCategory).map(category => ({
      key: category,
      value: category
    }));
    return categories;
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Lấy thống kê của bài thi' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê của bài thi.', type: DetailedExamStatsDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'id', description: 'ID của bài thi', type: String })
  @RequirePermissions(Permission.READ_EXAM)
  getExamStats(@Param('id', ParseUUIDPipe) id: string, @Query() params: ExamStatsParamsDto) {
    const statsParams = { ...params, examId: id };
    return this.examsService.getExamStats(statsParams);
  }

  @Post(':id/questions/link')
  @ApiOperation({ summary: 'Liên kết câu hỏi từ ngân hàng câu hỏi vào bài thi' })
  @ApiResponse({ status: 201, description: 'Liên kết câu hỏi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi hoặc câu hỏi.' })
  @ApiParam({ name: 'id', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_EXAM)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  linkQuestionToExam(
    @Param('id', ParseUUIDPipe) examId: string,
    @Body() data: { questionId: string; score: number }
  ) {
    return this.examQuestionService.linkQuestionToExam(examId, data.questionId, data.score);
  }

  @Post(':id/questions/import')
  @ApiOperation({ summary: 'Nhập nhiều câu hỏi từ ngân hàng câu hỏi vào bài thi' })
  @ApiResponse({ status: 201, description: 'Nhập câu hỏi thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài thi.' })
  @ApiParam({ name: 'id', description: 'ID của bài thi', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.UPDATE_EXAM)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  importQuestionsFromBank(
    @Param('id', ParseUUIDPipe) examId: string,
    @Body() data: { filter: QuestionFilterDto; score: number }
  ) {
    return this.examQuestionService.importQuestionsFromBank(examId, data.filter, data.score);
  }

  @Get('/questions/:questionId/exams')
  @ApiOperation({ summary: 'Lấy danh sách bài thi chứa một câu hỏi cụ thể' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài thi chứa câu hỏi.', type: ExamResponseDto, isArray: true })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi.' })
  @ApiParam({ name: 'questionId', description: 'ID của câu hỏi', type: String })
  @RequirePermissions(Permission.READ_EXAM)
  getExamsContainingQuestion(@Param('questionId') questionId: string) {
    return this.examQuestionService.getExamsContainingQuestion(questionId);
  }

  @Get('/questions/used')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi đã được sử dụng trong các bài thi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về danh sách câu hỏi và số lần sử dụng.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          usageCount: { type: 'number' },
          exams: { 
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  })
  @RequirePermissions(Permission.READ_EXAM)
  getQuestionsUsedInExams(@Query() filter: QuestionFilterDto) {
    return this.examQuestionService.getQuestionsUsedInExams(filter);
  }
} 
