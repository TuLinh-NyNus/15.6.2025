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
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { 
  CreateEnrollmentDto, 
  EnrollmentFiltersDto, 
  EnrollmentResponseDto 
} from '@project/dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, EnrollmentStatus } from '@project/entities';
import { EnrollmentMapper } from '../../common/mappers';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all enrollments with filters' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns enrollments and total count',
    type: Object
  })
  async findAll(@Query() filters: EnrollmentFiltersDto, @Request() req): Promise<{ enrollments: EnrollmentResponseDto[]; total: number }> {
    // Nếu không phải ADMIN, chỉ cho phép xem enrollments của chính mình
    if (req.user.role !== UserRole.ADMIN) {
      filters.userId = req.user.id;
    }
    
    const { enrollments, total } = await this.enrollmentsService.findAll(filters);
    
    return {
      enrollments: enrollments.map(enrollment => EnrollmentMapper.toResponseDto(enrollment)),
      total
    };
  }

  @Get('my-courses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get enrollments of the current user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns user enrollments',
    type: [EnrollmentResponseDto]
  })
  async findMyEnrollments(@Request() req): Promise<EnrollmentResponseDto[]> {
    const enrollments = await this.enrollmentsService.findByUser(req.user.id);
    return enrollments.map(enrollment => EnrollmentMapper.toResponseDto(enrollment));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an enrollment by ID',
    type: EnrollmentResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Enrollment not found' })
  async findOne(@Param('id') id: string, @Request() req): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.findById(id);
    
    // Nếu không phải ADMIN, kiểm tra xem enrollment có phải của user hiện tại không
    if (req.user.role !== UserRole.ADMIN && enrollment.userId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to access this enrollment');
    }
    
    return EnrollmentMapper.toResponseDto(enrollment);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Enrollment created successfully',
    type: EnrollmentResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Course not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot enroll in an unpublished course' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User is already enrolled in this course' })
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Request() req): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.create(createEnrollmentDto, req.user);
    return EnrollmentMapper.toResponseDto(enrollment);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark enrollment as completed' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment marked as completed',
    type: EnrollmentResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Enrollment not found' })
  async markAsCompleted(@Param('id') id: string, @Request() req): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.findById(id);
    
    // Nếu không phải ADMIN, kiểm tra xem enrollment có phải của user hiện tại không
    if (req.user.role !== UserRole.ADMIN && enrollment.userId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to update this enrollment');
    }
    
    const updatedEnrollment = await this.enrollmentsService.updateStatus(id, EnrollmentStatus.COMPLETED);
    return EnrollmentMapper.toResponseDto(updatedEnrollment);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel enrollment' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Enrollment cancelled',
    type: EnrollmentResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Enrollment not found' })
  async cancelEnrollment(@Param('id') id: string, @Request() req): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.findById(id);
    
    // Nếu không phải ADMIN, kiểm tra xem enrollment có phải của user hiện tại không
    if (req.user.role !== UserRole.ADMIN && enrollment.userId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to cancel this enrollment');
    }
    
    const updatedEnrollment = await this.enrollmentsService.updateStatus(id, EnrollmentStatus.CANCELLED);
    return EnrollmentMapper.toResponseDto(updatedEnrollment);
  }

  @Patch(':id/lessons/:lessonId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark lesson as completed' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lesson marked as completed',
    type: EnrollmentResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Enrollment not found' })
  async markLessonAsCompleted(
    @Param('id') id: string,
    @Param('lessonId') lessonId: string,
    @Request() req
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.findById(id);
    
    // Nếu không phải ADMIN, kiểm tra xem enrollment có phải của user hiện tại không
    if (req.user.role !== UserRole.ADMIN && enrollment.userId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to update this enrollment');
    }
    
    const updatedEnrollment = await this.enrollmentsService.updateProgress(id, lessonId, true);
    return EnrollmentMapper.toResponseDto(updatedEnrollment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete enrollment (Admin only)' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Enrollment not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.enrollmentsService.delete(id);
  }
} 