import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '@project/entities';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { Permission } from '../../auth/enums/permission.enum';
import { CreateUserActivityDto } from '../dtos';

@ApiTags('user-activity')
@Controller('user-activity')
@UseGuards(JwtAuthGuard)
export class UserActivityController {
  // Dependency injection sẽ được thêm sau khi tạo service

  @ApiOperation({ summary: 'Ghi lại hoạt động của người dùng' })
  @ApiResponse({ status: 201, description: 'Hoạt động đã được ghi lại thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @Post()
  async trackActivity(
    @CurrentUser() user: User,
    @Body() activityDto: CreateUserActivityDto,
  ) {
    // Xử lý ghi lại hoạt động sẽ được thêm sau
    return { 
      success: true, 
      message: 'Hoạt động đã được ghi lại',
      data: {
        userId: user.id,
        ...activityDto,
        timestamp: new Date(),
      }
    };
  }

  @ApiOperation({ summary: 'Lấy lịch sử hoạt động của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách hoạt động của người dùng' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @Get('my-activities')
  async getMyActivities(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    // Xử lý lấy danh sách hoạt động sẽ được thêm sau
    return {
      success: true,
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };
  }

  @ApiOperation({ summary: 'Lấy lịch sử hoạt động của một người dùng cụ thể (Admin only)' })
  @ApiResponse({ status: 200, description: 'Danh sách hoạt động của người dùng' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Forbidden - Không có quyền truy cập' })
  @Get('users/:userId')
  @RequirePermissions(Permission.READ_USER)
  async getUserActivities(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    // Xử lý lấy danh sách hoạt động của một người dùng cụ thể sẽ được thêm sau
    return {
      success: true,
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };
  }
} 
