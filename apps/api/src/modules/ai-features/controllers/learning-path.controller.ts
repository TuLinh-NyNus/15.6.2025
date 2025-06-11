import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '@project/entities';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { Permission } from '../../auth/enums/permission.enum';
import { CreateLearningPathDto } from '../dtos';

@ApiTags('learning-paths')
@Controller('learning-paths')
@UseGuards(JwtAuthGuard)
export class LearningPathController {
  // Dependency injection sẽ được thêm sau khi tạo service

  @ApiOperation({ summary: 'Tạo lộ trình học tập mới (Admin hoặc Instructor)' })
  @ApiResponse({ status: 201, description: 'Lộ trình học tập đã được tạo thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Forbidden - Không có quyền truy cập' })
  @RequirePermissions(Permission.CREATE_COURSE)
  @Post()
  async createLearningPath(
    @CurrentUser() user: User,
    @Body() createDto: CreateLearningPathDto,
  ) {
    // Xử lý tạo lộ trình học tập sẽ được thêm sau
    return {
      success: true,
      message: 'Lộ trình học tập đã được tạo thành công',
      data: {
        id: 'generated-id',
        ...createDto,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
  }

  @ApiOperation({ summary: 'Lấy danh sách các lộ trình học tập' })
  @ApiResponse({ status: 200, description: 'Danh sách lộ trình học tập' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @Get()
  async getLearningPaths(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('type') _type?: string,
  ) {
    // Xử lý lấy danh sách lộ trình học tập sẽ được thêm sau
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

  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một lộ trình học tập' })
  @ApiResponse({ status: 200, description: 'Thông tin lộ trình học tập' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lộ trình học tập' })
  @Get(':id')
  async getLearningPath(
    @Param('id') id: string,
  ) {
    // Xử lý lấy thông tin chi tiết lộ trình học tập sẽ được thêm sau
    return {
      success: true,
      data: {
        id,
        name: 'Lộ trình học mẫu',
        // Chi tiết sẽ được thêm sau
      }
    };
  }

  @ApiOperation({ summary: 'Cập nhật thông tin lộ trình học tập (Admin hoặc người tạo)' })
  @ApiResponse({ status: 200, description: 'Lộ trình học tập đã được cập nhật' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Forbidden - Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lộ trình học tập' })
  @Patch(':id')
  async updateLearningPath(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateLearningPathDto>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() _user: User,
  ) {
    // Xử lý cập nhật lộ trình học tập sẽ được thêm sau
    return {
      success: true,
      message: 'Lộ trình học tập đã được cập nhật',
      data: {
        id,
        ...updateDto,
        updatedAt: new Date(),
      }
    };
  }

  @ApiOperation({ summary: 'Xóa lộ trình học tập (Admin hoặc người tạo)' })
  @ApiResponse({ status: 200, description: 'Lộ trình học tập đã được xóa' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Forbidden - Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lộ trình học tập' })
  @Delete(':id')
  async deleteLearningPath(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('id') _id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() _user: User,
  ) {
    // Xử lý xóa lộ trình học tập sẽ được thêm sau
    return {
      success: true,
      message: 'Lộ trình học tập đã được xóa thành công',
    };
  }

  @ApiOperation({ summary: 'Lấy các lộ trình học tập của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách lộ trình học tập của người dùng' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Người dùng chưa đăng nhập' })
  @Get('user/my-paths')
  async getMyLearningPaths(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    // Xử lý lấy lộ trình học tập của người dùng sẽ được thêm sau
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