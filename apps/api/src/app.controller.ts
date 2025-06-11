import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

export class HealthCheckResponse {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '2024-03-19T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '1.0.0' })
  version!: string;
}

export class InfoResponse {
  @ApiProperty({ example: 'NyNus API' })
  name!: string;

  @ApiProperty({ example: 'Backend API for NyNus application' })
  description!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;
}

export class ApiWelcomeResponse {
  @ApiProperty({ example: 'Chào mừng đến với API NyNus!' })
  message!: string;

  @ApiProperty({ 
    example: {
      '/': 'Trang chào mừng hiện tại',
      '/health': 'Kiểm tra trạng thái API',
      '/info': 'Thông tin về API'
    }
  })
  endpoints!: Record<string, string>;

  @ApiProperty({ example: '2024' })
  currentYear!: string;
}

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Trang chào mừng API' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về thông tin chào mừng và danh sách endpoints',
    type: ApiWelcomeResponse 
  })
  getHello(): ApiWelcomeResponse {
    return {
      message: this.appService.getHello(),
      endpoints: {
        '/': 'Trang chào mừng hiện tại',
        '/health': 'Kiểm tra trạng thái API',
        '/info': 'Thông tin về API',
        '/api/auth': 'Endpoints xác thực',
        '/api/users': 'Quản lý người dùng',
        '/api/courses': 'Quản lý khóa học',
        '/api/categories': 'Quản lý danh mục',
        '/api/lessons': 'Quản lý bài học',
        '/api/enrollments': 'Quản lý đăng ký khóa học',
        '/api/questions': 'Quản lý câu hỏi',
      },
      currentYear: new Date().getFullYear().toString()
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns health check information',
    type: HealthCheckResponse 
  })
  healthCheck(): HealthCheckResponse {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns API information',
    type: InfoResponse 
  })
  getInfo(): InfoResponse {
    return {
      name: 'NyNus API',
      description: 'Backend API for NyNus application',
      environment: process.env.NODE_ENV || 'development'
    };
  }
} 