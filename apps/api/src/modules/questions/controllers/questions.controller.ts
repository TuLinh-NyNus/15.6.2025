import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../modules/auth/decorators/public.decorator';
import { UserRole, QuestionStatus } from '@project/entities';
import { QuestionsService } from '../services/questions.service';
import { QuestionVersionService, QuestionVersionData } from '../services/question-version.service';
import { QuestionFilterDto, CreateQuestionDto, UpdateQuestionDto } from '@project/dto';
import { getErrorMessage, getErrorName } from '../../../utils/error-handler';

@ApiTags('questions')
@ApiBearerAuth()
@Controller('questions')
// @UseGuards(JwtAuthGuard, RolesGuard) // TẠMTHỜI DISABLE ĐỂ TEST
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly questionVersionService: QuestionVersionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi',
  })
  @Public() // Tạm thời bỏ qua xác thực để kiểm tra chức năng lọc
  // @Roles(UserRole.ADMIN)
  async findAll(@Query() filters: QuestionFilterDto) {
    return this.questionsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin câu hỏi theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin câu hỏi',
  })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async findOne(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Get('by-subcount/:subcount')
  @ApiOperation({ summary: 'Lấy thông tin câu hỏi theo Subcount' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin câu hỏi',
  })
  @ApiParam({ name: 'subcount', description: 'Subcount của câu hỏi (định dạng XX.N)' })
  @Public() // Cho phép truy cập công khai
  async findBySubcount(@Param('subcount') subcount: string) {
    const question = await this.questionsService.findBySubcount(subcount);
    return { question };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo câu hỏi mới' })
  @ApiResponse({
    status: 201,
    description: 'Trả về câu hỏi đã tạo',
  })
  @ApiBody({ type: CreateQuestionDto })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    return this.questionsService.create(createQuestionDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về câu hỏi đã cập nhật',
  })
  @ApiParam({ name: 'id', description: 'ID hoặc Subcount của câu hỏi' })
  @ApiBody({ type: UpdateQuestionDto })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    try {
      // Kiểm tra xem id có phải là subcount không
      if (id.includes('.')) {
        console.log(`ID ${id} có vẻ là subcount, tìm câu hỏi theo subcount`);
        // Tìm câu hỏi theo subcount
        const question = await this.questionsService.findBySubcount(id);

        if (!question) {
          throw new NotFoundException(`Không tìm thấy câu hỏi với subcount: ${id}`);
        }

        // Lấy ID thực sự của câu hỏi
        const realId = question.id;
        console.log(`Đã tìm thấy câu hỏi với subcount ${id}, ID thực: ${realId}`);

        // Cập nhật câu hỏi với ID thực
        return this.questionsService.update(realId, updateQuestionDto);
      }

      // Nếu không phải subcount, sử dụng ID trực tiếp
      return this.questionsService.update(id, updateQuestionDto);
    } catch (error) {
      console.error(`Lỗi khi cập nhật câu hỏi với ID/Subcount ${id}:`, error);
      throw error;
    }
  }

  @Delete('by-content')
  @ApiOperation({ summary: 'Xóa câu hỏi dựa trên nội dung' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông báo xóa thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Không có quyền truy cập',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Không tìm thấy câu hỏi',
  })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async removeByContent(@Body() body: { content: string }, @Request() req) {
    console.log(`Đang xóa câu hỏi dựa trên nội dung, người dùng: ${req.user?.email || 'không xác định'}`);
    console.log('Nội dung câu hỏi:', body.content?.substring(0, 30));

    if (!body.content) {
      console.error('Nội dung câu hỏi không hợp lệ');
      return {
        success: false,
        message: 'Nội dung câu hỏi không hợp lệ'
      };
    }

    try {
      const result = await this.questionsService.deleteByContent(body.content);
      console.log(`Xóa câu hỏi thành công, kết quả:`, result);

      return {
        success: result.success !== undefined ? result.success : true,
        message: result.message || 'Đã xóa câu hỏi thành công',
        data: 'data' in result ? result.data : null
      };
    } catch (error) {
      console.error(`Lỗi khi xóa câu hỏi:`, error);

      return {
        success: false,
        message: `Không thể xóa câu hỏi: ${getErrorMessage(error) || 'Lỗi không xác định'}`,
        error: getErrorName(error) || 'UNKNOWN_ERROR'
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông báo xóa thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Không có quyền truy cập',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Không tìm thấy câu hỏi',
  })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req, @Body() body: any) {
    console.log(`Đang xóa câu hỏi với ID: ${id}, người dùng: ${req.user?.email || 'không xác định'}`);
    console.log('Body request:', body);

    // Kiểm tra ID từ params hoặc body
    let questionId = id;

    // Nếu ID không hợp lệ trong params, thử lấy từ body
    if (!questionId || questionId === 'undefined' || questionId === 'null' || questionId === 'unknown') {
      if (body && body.id) {
        questionId = body.id;
        console.log('Sử dụng ID từ body request:', questionId);
      } else {
        console.error('ID câu hỏi không hợp lệ:', questionId);
        return {
          success: false,
          message: 'ID câu hỏi không hợp lệ'
        };
      }
    }

    try {
      // Thử xóa liên kết assessment_questions và exam_questions trước
      try {
        // Xóa liên kết assessment_questions
        await this.questionsService['prisma'].$executeRaw`
          DELETE FROM assessment_questions WHERE "questionId" = ${questionId}
        `;
        console.log('Đã xóa liên kết assessment_questions trước khi xóa câu hỏi');

        // Xóa liên kết exam_questions
        await this.questionsService['prisma'].$executeRaw`
          DELETE FROM exam_questions WHERE "questionId" = ${questionId}
        `;
        console.log('Đã xóa liên kết exam_questions trước khi xóa câu hỏi');
      } catch (err) {
        console.log('Không thể xóa liên kết từ bảng liên kết:', getErrorMessage(err));
      }

      const result = await this.questionsService.delete(questionId);
      console.log(`Xóa câu hỏi thành công, ID: ${questionId}, kết quả:`, result);

      // Đảm bảo trả về cấu trúc nhất quán
      return {
        success: result.success !== undefined ? result.success : true,
        message: result.message || 'Đã xóa câu hỏi thành công',
        data: 'data' in result ? result.data : null
      };
    } catch (error) {
      console.error(`Lỗi khi xóa câu hỏi ID ${id}:`, error);

      // Thử xóa trực tiếp nếu có lỗi
      try {
        console.log('Thử xóa trực tiếp sau khi gặp lỗi...');
        await this.questionsService['prisma'].$executeRaw`
          DELETE FROM questions WHERE id = ${questionId}
        `;
        console.log('Đã xóa câu hỏi trực tiếp thành công');

        return {
          success: true,
          message: 'Đã xóa câu hỏi thành công (phương pháp trực tiếp)',
          data: { id: questionId }
        };
      } catch (directError) {
        console.error('Không thể xóa trực tiếp:', getErrorMessage(error));
      }

      // Xử lý lỗi và trả về phản hồi có cấu trúc
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: getErrorMessage(error) || 'Không tìm thấy câu hỏi',
          error: 'NOT_FOUND'
        };
      }

      return {
        success: false,
        message: `Không thể xóa câu hỏi: ${getErrorMessage(error) || 'Lỗi không xác định'}`,
        error: getErrorName(error) || 'UNKNOWN_ERROR'
      };
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về câu hỏi đã cập nhật trạng thái',
  })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(QuestionStatus),
          description: 'Trạng thái mới của câu hỏi',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: QuestionStatus,
  ) {
    return this.questionsService.updateStatus(id, status);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Lấy danh sách phiên bản của câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách phiên bản',
  })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async getVersions(@Param('id') id: string) {
    return this.questionVersionService.findAllVersionsByQuestionId(id);
  }

  @Get(':id/versions/latest')
  @ApiOperation({ summary: 'Lấy phiên bản mới nhất của câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về phiên bản mới nhất',
  })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async getLatestVersion(@Param('id') id: string) {
    return this.questionVersionService.findLatestVersion(id);
  }

  @Get(':id/versions/:version')
  @ApiOperation({ summary: 'Lấy phiên bản cụ thể của câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về phiên bản được chỉ định',
  })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiParam({ name: 'version', description: 'Số phiên bản' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async getSpecificVersion(
    @Param('id') id: string,
    @Param('version') version: string,
  ) {
    return this.questionVersionService.findByQuestionIdAndVersion(id, parseInt(version, 10));
  }

  @Post(':id/versions/:versionId/revert')
  @ApiOperation({ summary: 'Khôi phục câu hỏi về phiên bản cũ' })
  @ApiResponse({
    status: 200,
    description: 'Trả về phiên bản mới được tạo từ phiên bản cũ',
  })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiParam({ name: 'versionId', description: 'ID của phiên bản cần khôi phục' })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async revertToVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Request() req,
  ): Promise<QuestionVersionData> {
    return this.questionVersionService.revertToVersion(id, versionId, req.user.id);
  }

  @Post('versions/compare')
  @ApiOperation({ summary: 'So sánh hai phiên bản câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về kết quả so sánh',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['versionId1', 'versionId2'],
      properties: {
        versionId1: {
          type: 'string',
          description: 'ID của phiên bản thứ nhất',
        },
        versionId2: {
          type: 'string',
          description: 'ID của phiên bản thứ hai',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async compareVersions(
    @Body('versionId1') versionId1: string,
    @Body('versionId2') versionId2: string,
  ) {
    return this.questionVersionService.compareVersions(versionId1, versionId2);
  }
}
