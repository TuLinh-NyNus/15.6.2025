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
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@project/entities';
import { QuestionService } from '../services/question.service';
import { 
  CreateExamQuestionDto, 
  UpdateExamQuestionDto,
  QuestionFilterDto
} from '@project/dto';
import { ExamQuestionResponseDto } from '@project/dto';

@ApiTags('questions')
@ApiBearerAuth()
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamQuestionController {
  constructor(
    private readonly questionService: QuestionService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi',
  })
  @ApiQuery({ name: 'examId', required: false, description: 'ID của bài thi' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async getQuestions(
    @Query('examId') examId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.questionService.findAll(examId, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy câu hỏi theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về câu hỏi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async getQuestionById(@Param('id') id: string) {
    return this.questionService.findById(parseInt(id, 10));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo câu hỏi mới' })
  @ApiResponse({
    status: 201,
    description: 'Câu hỏi được tạo thành công',
  })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async createQuestion(@Body() createQuestionDto: CreateExamQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Tạo nhiều câu hỏi cùng lúc' })
  @ApiResponse({
    status: 201,
    description: 'Các câu hỏi được tạo thành công',
  })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async createBulkQuestions(@Body() createQuestionsDto: CreateExamQuestionDto[]) {
    return this.questionService.createBulk(createQuestionsDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật câu hỏi' })
  @ApiResponse({ status: 200, description: 'Trả về câu hỏi đã cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateExamQuestionDto,
  ) {
    return this.questionService.update(parseInt(id, 10), updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa câu hỏi' })
  @ApiResponse({ status: 200, description: 'Trả về thông báo xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async deleteQuestion(@Param('id') id: string) {
    return this.questionService.remove(parseInt(id, 10));
  }

  @Get('filter/difficulty')
  @ApiOperation({ summary: 'Lọc câu hỏi theo độ khó' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi theo độ khó',
  })
  @ApiQuery({ name: 'difficulty', required: true, description: 'Độ khó của câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async filterByDifficulty(@Query('difficulty') difficulty: string) {
    return this.questionService.filterByDifficulty(difficulty);
  }

  @Get('filter/subject')
  @ApiOperation({ summary: 'Lọc câu hỏi theo chủ đề' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi theo chủ đề',
  })
  @ApiQuery({ name: 'subject', required: true, description: 'Chủ đề của câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async filterBySubject(@Query('subject') subject: string) {
    return this.questionService.filterBySubject(subject);
  }

  @Get('filter/tags')
  @ApiOperation({ summary: 'Lọc câu hỏi theo tags' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi theo tags',
  })
  @ApiQuery({ name: 'tags', required: true, description: 'Tags của câu hỏi (cách nhau bởi dấu phẩy)' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async filterByTags(@Query('tags') tags: string) {
    const tagList = tags.split(',').map(tag => tag.trim());
    return this.questionService.filterByTags(tagList);
  }

  /**
   * Liên kết một câu hỏi từ ngân hàng đề với bài thi
   * @param examId ID của bài thi
   * @param questionId ID của câu hỏi từ ngân hàng
   * @param score Điểm số cho câu hỏi
   * @returns Câu hỏi đã được thêm vào bài thi
   */
  @Post(':examId/questions/link/:questionId')
  @ApiOperation({ summary: 'Liên kết câu hỏi từ ngân hàng đề với bài thi' })
  @ApiResponse({
    status: 201,
    description: 'Câu hỏi đã được liên kết thành công',
    type: ExamQuestionResponseDto
  })
  @ApiParam({ name: 'examId', description: 'ID của bài thi' })
  @ApiParam({ name: 'questionId', description: 'ID của câu hỏi từ ngân hàng đề' })
  @ApiQuery({ name: 'score', description: 'Điểm số cho câu hỏi', type: Number, required: true })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async linkQuestionToExam(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @Query('score') score: number
  ) {
    return this.questionService.linkQuestionToExam(examId, questionId, score);
  }

  /**
   * Import nhiều câu hỏi từ ngân hàng đề vào bài thi
   * @param examId ID của bài thi
   * @param filter Bộ lọc để chọn câu hỏi
   * @param score Điểm số cho mỗi câu hỏi
   * @returns Danh sách câu hỏi đã được thêm vào bài thi
   */
  @Post(':examId/questions/import')
  @ApiOperation({ summary: 'Import nhiều câu hỏi từ ngân hàng đề vào bài thi' })
  @ApiResponse({
    status: 201,
    description: 'Câu hỏi đã được import thành công',
    type: [ExamQuestionResponseDto]
  })
  @ApiParam({ name: 'examId', description: 'ID của bài thi' })
  @ApiQuery({ name: 'score', description: 'Điểm số cho mỗi câu hỏi', type: Number, required: true })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async importQuestionsFromBank(
    @Param('examId') examId: string,
    @Body() filter: QuestionFilterDto,
    @Query('score') score: number
  ) {
    return this.questionService.importQuestionsFromBank(examId, filter, score);
  }

  /**
   * Lấy danh sách bài thi chứa một câu hỏi cụ thể từ ngân hàng
   * @param questionId ID của câu hỏi từ ngân hàng đề
   * @returns Danh sách bài thi chứa câu hỏi
   */
  @Get('bank/:questionId/exams')
  @ApiOperation({ summary: 'Lấy danh sách bài thi chứa một câu hỏi cụ thể từ ngân hàng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài thi được trả về thành công',
  })
  @ApiParam({ name: 'questionId', description: 'ID của câu hỏi từ ngân hàng đề' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async getExamsContainingQuestion(@Param('questionId') questionId: string) {
    return this.questionService.getExamsContainingQuestion(questionId);
  }

  /**
   * Lấy danh sách câu hỏi đã được sử dụng trong các bài thi
   * @returns Danh sách câu hỏi và số lần sử dụng
   */
  @Get('bank/used')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi đã được sử dụng trong các bài thi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi được trả về thành công',
  })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async getQuestionsUsedInExams(@Query() filter: QuestionFilterDto) {
    return this.questionService.getQuestionsUsedInExams(filter);
  }
} 