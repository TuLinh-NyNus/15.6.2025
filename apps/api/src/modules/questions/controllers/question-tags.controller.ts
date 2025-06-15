import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags 
} from '@nestjs/swagger';
import { 
  CreateQuestionTagDto, 
  QuestionTagFilterDto, 
  QuestionTagResponseDto, 
  UpdateQuestionTagDto 
} from '@project/dto';
import { QuestionTagService } from '../services/question-tag.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@project/entities';

@ApiTags('question-tags')
@Controller('question-tags')
export class QuestionTagsController {
  constructor(private readonly questionTagService: QuestionTagService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả tag câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tag câu hỏi',
    type: QuestionTagResponseDto,
    isArray: true,
  })
  async findAll(@Query() filters: QuestionTagFilterDto) {
    return this.questionTagService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một tag câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tag',
    type: QuestionTagResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tag',
  })
  async findById(@Param('id') id: string) {
    return this.questionTagService.findById(id);
  }

  @Get('question/:questionId')
  @ApiOperation({ summary: 'Lấy danh sách tag của câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tag của câu hỏi',
    type: QuestionTagResponseDto,
    isArray: true,
  })
  async findAllByQuestionId(@Param('questionId') questionId: string) {
    return this.questionTagService.findAllByQuestionId(questionId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo tag câu hỏi mới' })
  @ApiResponse({
    status: 201,
    description: 'Tag câu hỏi đã được tạo',
    type: QuestionTagResponseDto,
  })
  async create(@Body() createDto: CreateQuestionTagDto) {
    return this.questionTagService.create(createDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật tag câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Tag câu hỏi đã được cập nhật',
    type: QuestionTagResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tag',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateQuestionTagDto,
  ) {
    return this.questionTagService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tag câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Tag câu hỏi đã được xóa',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tag',
  })
  async delete(@Param('id') id: string) {
    return this.questionTagService.delete(id);
  }

  @Post('question/:questionId/tags')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật danh sách tag của câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tag đã được cập nhật',
  })
  async updateQuestionTags(
    @Param('questionId') questionId: string,
    @Body() data: { tagIds: string[] },
  ) {
    return this.questionTagService.updateQuestionTags(questionId, data.tagIds);
  }
} 
