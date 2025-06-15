import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto,
  CategoryResponseDto,
  CourseResponseDto,
  CategoryFiltersDto
} from '@project/dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@project/entities';
import { CourseMapper, CategoryMapper } from '../../common/mappers';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns all categories', 
    type: [CategoryResponseDto] 
  })
  async findAll(@Query() filters: CategoryFiltersDto = {}): Promise<CategoryResponseDto[]> {
    const [categories] = await this.categoriesService.findAll(filters);
    return categories.map(category => CategoryMapper.toResponseDto(category));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns a category by ID', 
    type: CategoryResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findById(id);
    return CategoryMapper.toResponseDto(category);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get courses by category ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns courses by category ID', 
    type: [CourseResponseDto] 
  })
  async getCoursesByCategory(@Param('id') id: string): Promise<CourseResponseDto[]> {
    const courses = await this.categoriesService.getCoursesByCategory(id);
    return courses.map(course => CourseMapper.toResponseDto(course));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Category created successfully', 
    type: CategoryResponseDto 
  })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(createCategoryDto);
    return CategoryMapper.toResponseDto(category);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a category' })
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Category updated successfully', 
    type: CategoryResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return CategoryMapper.toResponseDto(category);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Category deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoriesService.delete(id);
  }
} 
