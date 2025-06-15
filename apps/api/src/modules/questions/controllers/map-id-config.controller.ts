import { 
  Body, 
  Controller, 
  Get, 
  HttpException, 
  HttpStatus, 
  Logger, 
  Post, 
  Put
} from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiTags 
} from '@nestjs/swagger';
import { MapIDConfigService } from '../services/map-id-config.service';
import {
  ExportMapIDConfigResponseDto,
  ImportMapIDConfigDto,
  MapIDConfigResponseDto,
  UpdateMapIDConfigDto
} from '../dtos/map-id-config.dto';
import { getErrorMessage } from '../../../utils/error-handler';

/**
 * Controller quản lý các endpoints liên quan đến cấu hình MapID
 */
@ApiTags('MapID Config')
@Controller('map-id-config')
export class MapIDConfigController {
  private readonly logger = new Logger(MapIDConfigController.name);

  constructor(private readonly mapIdConfigService: MapIDConfigService) {}

  /**
   * Lấy cấu hình MapID hiện tại
   */
  @Get()
  @ApiOperation({ summary: 'Lấy cấu hình MapID hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Cấu hình MapID hiện tại',
    type: MapIDConfigResponseDto,
  })
  async getMapIDConfig(): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log('Yêu cầu lấy cấu hình MapID');
      const config = await this.mapIdConfigService.getMapIDConfig();
      return config;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy cấu hình MapID: ${getErrorMessage(error)}`);
      throw new HttpException(
        'Không thể lấy cấu hình MapID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật cấu hình MapID
   * @param updateDto DTO chứa thông tin cập nhật cấu hình
   */
  @Put()
  @ApiOperation({ summary: 'Cập nhật cấu hình MapID' })
  @ApiResponse({
    status: 200,
    description: 'Cấu hình MapID sau khi cập nhật',
    type: MapIDConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu cập nhật không hợp lệ',
  })
  async updateMapIDConfig(
    @Body() updateDto: UpdateMapIDConfigDto,
  ): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log(`Yêu cầu cập nhật cấu hình MapID: ${JSON.stringify(updateDto)}`);
      const updatedConfig = await this.mapIdConfigService.updateMapIDConfig(updateDto);
      return updatedConfig;
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật cấu hình MapID: ${getErrorMessage(error)}`);
      throw new HttpException(
        `Không thể cập nhật cấu hình MapID: ${getErrorMessage(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Import cấu hình MapID từ chuỗi JSON
   * @param importDto DTO chứa chuỗi JSON cấu hình
   */
  @Post('import')
  @ApiOperation({ summary: 'Import cấu hình MapID từ chuỗi JSON' })
  @ApiResponse({
    status: 201,
    description: 'Cấu hình MapID sau khi import',
    type: MapIDConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu import không hợp lệ',
  })
  async importMapIDConfig(
    @Body() importDto: ImportMapIDConfigDto,
  ): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log('Yêu cầu import cấu hình MapID');
      const config = await this.mapIdConfigService.importMapIDConfig(importDto.jsonConfig);
      return config;
    } catch (error) {
      this.logger.error(`Lỗi khi import cấu hình MapID: ${getErrorMessage(error)}`);
      throw new HttpException(
        `Không thể import cấu hình MapID: ${getErrorMessage(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Export cấu hình MapID hiện tại
   */
  @Get('export')
  @ApiOperation({ summary: 'Export cấu hình MapID hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Chuỗi JSON cấu hình MapID',
    type: ExportMapIDConfigResponseDto,
  })
  async exportMapIDConfig(): Promise<ExportMapIDConfigResponseDto> {
    try {
      this.logger.log('Yêu cầu export cấu hình MapID');
      const exportResult = await this.mapIdConfigService.exportMapIDConfig();
      return exportResult;
    } catch (error) {
      this.logger.error(`Lỗi khi export cấu hình MapID: ${getErrorMessage(error)}`);
      throw new HttpException(
        'Không thể export cấu hình MapID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reset cấu hình MapID về mặc định
   */
  @Post('reset')
  @ApiOperation({ summary: 'Reset cấu hình MapID về mặc định' })
  @ApiResponse({
    status: 200,
    description: 'Cấu hình MapID mặc định',
    type: MapIDConfigResponseDto,
  })
  async resetMapIDConfig(): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log('Yêu cầu reset cấu hình MapID về mặc định');
      const defaultConfig = await this.mapIdConfigService.resetMapIDConfig();
      return defaultConfig;
    } catch (error) {
      this.logger.error(`Lỗi khi reset cấu hình MapID: ${getErrorMessage(error)}`);
      throw new HttpException(
        'Không thể reset cấu hình MapID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 
