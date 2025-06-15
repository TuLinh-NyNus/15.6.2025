import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetRecommendationsDto, RecommendationType } from '../dtos';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '@project/entities';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  // Dependency injection sẽ được thêm sau khi tạo service

  @ApiOperation({ summary: 'Lấy các khóa học được gợi ý cho người dùng đã đăng nhập' })
  @ApiResponse({ status: 200, description: 'Danh sách khóa học được gợi ý' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getPersonalizedRecommendations(
    @CurrentUser() user: User,
    @Query() queryParams: GetRecommendationsDto,
  ) {
    // Xử lý lấy gợi ý cá nhân hóa sẽ được thêm sau
    return {
      success: true,
      data: [],
      metadata: {
        recommendationType: queryParams.type || RecommendationType.PERSONALIZED,
        userId: user.id,
      }
    };
  }

  @ApiOperation({ summary: 'Lấy các khóa học được gợi ý cho người dùng chưa đăng nhập' })
  @ApiResponse({ status: 200, description: 'Danh sách khóa học được gợi ý' })
  @Get('public')
  async getPublicRecommendations(
    @Query() queryParams: GetRecommendationsDto,
  ) {
    // Xử lý lấy gợi ý công khai sẽ được thêm sau
    return {
      success: true,
      data: [],
      metadata: {
        recommendationType: queryParams.type || RecommendationType.TRENDING,
      }
    };
  }

  @ApiOperation({ summary: 'Lấy các khóa học tương tự với một khóa học cụ thể' })
  @ApiResponse({ status: 200, description: 'Danh sách khóa học tương tự' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khóa học' })
  @Get('similar-to/:courseId')
  async getSimilarCourses(
    @Param('courseId') courseId: string,
    @Query('limit') limit = 10,
  ) {
    // Xử lý lấy khóa học tương tự sẽ được thêm sau
    return {
      success: true,
      data: [],
      metadata: {
        recommendationType: RecommendationType.SIMILAR_COURSES,
        courseId,
        limit,
      }
    };
  }

  @ApiOperation({ summary: 'Lấy các khóa học xu hướng trong hệ thống' })
  @ApiResponse({ status: 200, description: 'Danh sách khóa học xu hướng' })
  @Get('trending')
  async getTrendingCourses(
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
  ) {
    // Xử lý lấy khóa học xu hướng sẽ được thêm sau
    return {
      success: true,
      data: [],
      metadata: {
        recommendationType: RecommendationType.TRENDING,
        categoryId,
        limit,
      }
    };
  }
} 
