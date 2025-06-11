import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  LessonResponseDto,
  LessonFiltersDto
} from '@project/dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { UserRole, User } from '@project/entities';
import { Request } from 'express';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài học' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài học đã được trả về',
    type: [LessonResponseDto]
  })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filter by course ID' })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by title (contains)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by lesson type' })
  @ApiQuery({ name: 'isFree', required: false, description: 'Filter by free lessons' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field:direction (e.g. "order:asc")' })
  async findAll(@Query() filters: LessonFiltersDto): Promise<{ data: LessonResponseDto[], total: number }> {
    const [lessons, total] = await this.lessonsService.findAll(filters);
    return {
      data: lessons.map(LessonResponseDto.fromEntity),
      total
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bài học' })
  @ApiResponse({
    status: 200,
    description: 'Bài học đã được tìm thấy',
    type: LessonResponseDto
  })
  @ApiResponse({ status: 404, description: 'Bài học không được tìm thấy' })
  async findOne(@Param('id') id: string): Promise<LessonResponseDto> {
    const lesson = await this.lessonsService.findById(id);
    return LessonResponseDto.fromEntity(lesson);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Lấy danh sách bài học của một khóa học' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài học của khóa học đã được trả về',
    type: [LessonResponseDto]
  })
  async findByCourse(@Param('courseId') courseId: string): Promise<LessonResponseDto[]> {
    const lessons = await this.lessonsService.findByCourse(courseId);
    return lessons.map(LessonResponseDto.fromEntity);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @RequirePermissions(Permission.CREATE_LESSON)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài học mới' })
  @ApiResponse({
    status: 201,
    description: 'Bài học đã được tạo thành công',
    type: LessonResponseDto
  })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo bài học' })
  async create(@Body() createLessonDto: CreateLessonDto, @Req() req: Request): Promise<LessonResponseDto> {
    const user = req.user as User;
    // Chỉ ADMIN mới có thể tạo bài học cho bất kỳ khóa học nào
    // INSTRUCTOR chỉ có thể tạo bài học cho khóa học do họ sở hữu
    const lesson = await this.lessonsService.create(createLessonDto, user);
    return LessonResponseDto.fromEntity(lesson);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @RequirePermissions(Permission.UPDATE_LESSON)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin bài học' })
  @ApiResponse({
    status: 200,
    description: 'Bài học đã được cập nhật thành công',
    type: LessonResponseDto
  })
  @ApiResponse({ status: 404, description: 'Bài học không được tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật bài học' })
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req: Request
  ): Promise<LessonResponseDto> {
    const user = req.user as User;
    const lesson = await this.lessonsService.update(id, updateLessonDto, user);
    return LessonResponseDto.fromEntity(lesson);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @RequirePermissions(Permission.DELETE_LESSON)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bài học' })
  @ApiResponse({
    status: 200,
    description: 'Bài học đã được xóa thành công'
  })
  @ApiResponse({ status: 404, description: 'Bài học không được tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa bài học' })
  async remove(@Param('id') id: string, @Req() req: Request): Promise<{ message: string }> {
    const user = req.user as User;
    await this.lessonsService.delete(id, user);
    return { message: 'Bài học đã được xóa thành công' };
  }

  @Get(':id/content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.READ_LESSON)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem nội dung bài học' })
  @ApiResponse({
    status: 200,
    description: 'Nội dung bài học đã được trả về',
    type: LessonResponseDto
  })
  @ApiResponse({ status: 404, description: 'Bài học không được tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem nội dung bài học' })
  async getLessonContent(@Param('id') id: string, @Req() req: Request): Promise<LessonResponseDto> {
    const user = req.user as User;
    const lesson = await this.lessonsService.getLessonContent(id, user);
    return LessonResponseDto.fromEntity(lesson);
  }

  @Get(':id/resources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions(Permission.READ_LESSON)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tải tài liệu bài học' })
  @ApiResponse({
    status: 200,
    description: 'Tài liệu bài học đã được trả về'
  })
  @ApiResponse({ status: 404, description: 'Bài học không được tìm thấy' })
  @ApiResponse({ status: 403, description: 'Không có quyền tải tài liệu bài học' })
  async getLessonResources(@Param('id') id: string, @Req() req: Request): Promise<{ resourceUrl: string }> {
    const user = req.user as User;
    const resourceUrl = await this.lessonsService.getLessonResources(id, user);
    return { resourceUrl };
  }
} 