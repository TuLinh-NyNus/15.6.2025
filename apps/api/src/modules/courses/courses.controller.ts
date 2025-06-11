import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { 
  CreateCourseDto, 
  UpdateCourseDto, 
  CourseFiltersDto, 
  RateCourseDto,
  CourseResponseDto 
} from '@project/dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CourseOwnershipGuard } from '../auth/guards/ownership.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireOwnership } from '../auth/decorators/ownership.decorator';
import { UserRole, CourseStatus } from '@project/entities';
import { CourseMapper } from '../../common/mappers';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses with filters' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns courses and total count', 
    type: Object 
  })
  async findAll(@Query() filters: CourseFiltersDto): Promise<{ courses: CourseResponseDto[]; total: number }> {
    const { courses, total } = await this.coursesService.findAll(filters);
    
    return {
      courses: courses.map(course => CourseMapper.toResponseDto(course)),
      total
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured courses' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns featured courses', 
    type: [CourseResponseDto] 
  })
  async getFeatured(@Query('limit') limit: number = 6): Promise<CourseResponseDto[]> {
    const filters: CourseFiltersDto = {
      limit,
      page: 1,
      sort: 'averageRating:desc',
      status: CourseStatus.PUBLISHED
    };
    
    const { courses } = await this.coursesService.findAll(filters);
    return courses.map(course => CourseMapper.toResponseDto(course));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns a course by ID', 
    type: CourseResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.findById(id);
    return CourseMapper.toResponseDto(course);
  }

  @Get('instructor/:id')
  @ApiOperation({ summary: 'Get courses by instructor ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns courses by instructor ID', 
    type: [CourseResponseDto] 
  })
  async findByInstructor(@Param('id') id: string): Promise<CourseResponseDto[]> {
    const courses = await this.coursesService.findByInstructor(id);
    return courses.map(course => CourseMapper.toResponseDto(course));
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get courses by category ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns courses by category ID', 
    type: [CourseResponseDto] 
  })
  async findByCategory(@Param('id') id: string): Promise<CourseResponseDto[]> {
    const courses = await this.coursesService.findByCategory(id);
    return courses.map(course => CourseMapper.toResponseDto(course));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Course created successfully', 
    type: CourseResponseDto 
  })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.create(createCourseDto, req.user);
    return CourseMapper.toResponseDto(course);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, CourseOwnershipGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @RequireOwnership()
  @ApiOperation({ summary: 'Update a course' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Course updated successfully', 
    type: CourseResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not the owner of the course' })
  async update(
    @Param('id') id: string, 
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.updateWithOwnerCheck(id, updateCourseDto, req.user.id);
    return CourseMapper.toResponseDto(course);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, CourseOwnershipGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @RequireOwnership()
  @ApiOperation({ summary: 'Delete a course' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Course deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not the owner of the course' })
  async remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<void> {
    await this.coursesService.deleteWithOwnerCheck(id, req.user.id);
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rate a course' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Course rated successfully', 
    type: CourseResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
  async rateCourse(
    @Param('id') id: string,
    @Body() rateDto: RateCourseDto
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.rateCourse(id, rateDto);
    return CourseMapper.toResponseDto(course);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard, CourseOwnershipGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @RequireOwnership()
  @ApiOperation({ summary: 'Publish a course' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Course published successfully', 
    type: CourseResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not the owner of the course' })
  async publishCourse(
    @Param('id') id: string,
    @Request() req
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.publishCourse(id, req.user.id);
    return CourseMapper.toResponseDto(course);
  }
} 