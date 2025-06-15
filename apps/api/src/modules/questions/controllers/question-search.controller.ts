import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  NotFoundException
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@project/entities';
import {
  QuestionFilterDto,
  QuestionSearchDto,
  QuestionResponseDto
} from '@project/dto';
import { QuestionsService } from '../services/questions.service';

@ApiTags('questions-search')
@Controller('questions-search')
export class QuestionSearchController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm câu hỏi với filter' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi theo filter',
  })
  async search(@Query() filter: QuestionFilterDto) {
    return this.questionsService.findAll(filter);
  }

  @Get('by-id/:questionId')
  @ApiOperation({ summary: 'Tìm câu hỏi theo QuestionID (mã XXXXX-X)' })
  @ApiParam({ name: 'questionId', description: 'Question ID định dạng XXXXX-X' })
  @ApiResponse({
    status: 200,
    description: 'Câu hỏi theo ID',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  async searchByQuestionId(@Param('questionId') questionId: string) {
    // Tìm câu hỏi dựa trên mã câu hỏi
    const filter: QuestionFilterDto = {
      search: questionId, // Sử dụng search với mã câu hỏi
      page: 1,
      limit: 1
    };

    const result = await this.questionsService.findAll(filter);

    // Xử lý kết quả trả về từ service một cách an toàn
    let questions: any[] = [];

    if (Array.isArray(result)) {
      questions = result;
    } else if (result && typeof result === 'object' && 'questions' in result) {
      questions = Array.isArray(result.questions) ? result.questions : [];
    }

    if (!questions.length) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với mã: ${questionId}`);
    }

    return questions[0];
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm kiếm nâng cao câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi phù hợp với tiêu chí tìm kiếm',
    type: QuestionResponseDto,
    isArray: true,
  })
  async searchQuestions(@Body() searchDto: QuestionSearchDto) {
    // Chuyển đổi SearchDto sang FilterDto để sử dụng service hiện có
    const filterDto: QuestionFilterDto = {
      page: searchDto.page,
      limit: searchDto.limit,
      search: searchDto.query,
      // Thêm các tham số khác nếu cần
    };

    return this.questionsService.findAll(filterDto);
  }

  @Get('by-tag/:tagId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm kiếm câu hỏi theo tag' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi thuộc tag',
    type: QuestionResponseDto,
    isArray: true,
  })
  async searchByTag(
    @Param('tagId') tagId: string,
    @Query() filterDto: QuestionFilterDto
  ) {
    // Gán tagId vào filter
    const enhancedFilter: QuestionFilterDto = {
      ...filterDto,
      tags: [tagId],
    };

    return this.questionsService.findAll(enhancedFilter);
  }

  @Get('by-metadata')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm kiếm câu hỏi theo metadata' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách câu hỏi phù hợp với metadata',
    type: QuestionResponseDto,
    isArray: true,
  })
  async searchByMetadata(@Query() filterDto: QuestionFilterDto) {
    // Tìm kiếm câu hỏi dựa trên metadata (questionId, subcount...)
    return this.questionsService.findAll(filterDto);
  }
}
