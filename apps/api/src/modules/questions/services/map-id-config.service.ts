import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UpdateMapIDConfigDto, MapIDConfigResponseDto, ExportMapIDConfigResponseDto } from '../dtos/map-id-config.dto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service quản lý cấu hình MapID
 * Lưu trữ cấu hình dưới dạng file JSON thay vì sử dụng database
 */
@Injectable()
export class MapIDConfigService {
  private readonly logger = new Logger(MapIDConfigService.name);
  private readonly configPath: string;
  private readonly DEFAULT_CONFIG: MapIDConfigResponseDto = {
    grade: {
      '0': 'Lớp 10',
      '1': 'Lớp 11',
      '2': 'Lớp 12',
    },
    subject: {
      'P': '10-NGÂN HÀNG CHÍNH',
    },
    chapter: {
      '1': 'Mệnh đề và tập hợp',
    },
    lesson: {
      '1': 'Mệnh đề',
    },
    form: {
      '1': 'Xác định mệnh đề, mệnh đề chứa biến',
    },
    level: {
      'N': 'Nhận biết',
      'H': 'Thông Hiểu',
      'V': 'VD',
      'C': 'VD Cao',
      'T': 'VIP',
      'M': 'Note',
    },
  };
  
  constructor(
    private readonly configService: ConfigService,
  ) {
    // Xác định đường dẫn lưu file cấu hình
    const storagePath = this.configService.get<string>('STORAGE_PATH', 'storage');
    this.configPath = path.join(process.cwd(), storagePath, 'map-id-config.json');
    
    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Tạo file cấu hình mặc định nếu chưa tồn tại
    if (!fs.existsSync(this.configPath)) {
      this.saveConfig(this.DEFAULT_CONFIG);
    }
  }

  /**
   * Lưu cấu hình vào file
   * @param config Cấu hình cần lưu
   */
  private saveConfig(config: MapIDConfigResponseDto): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
      this.logger.error(`Lỗi khi lưu cấu hình: ${error.message}`);
      throw new Error(`Không thể lưu cấu hình: ${error.message}`);
    }
  }

  /**
   * Đọc cấu hình từ file
   * @returns Cấu hình MapID
   */
  private readConfig(): MapIDConfigResponseDto {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.saveConfig(this.DEFAULT_CONFIG);
        return this.DEFAULT_CONFIG;
      }
      
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      this.logger.error(`Lỗi khi đọc cấu hình: ${error.message}`);
      throw new Error(`Không thể đọc cấu hình: ${error.message}`);
    }
  }

  /**
   * Lấy cấu hình MapID hiện tại
   * @returns Cấu hình MapID
   */
  async getMapIDConfig(): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log('Lấy cấu hình MapID');
      return this.readConfig();
    } catch (error) {
      this.logger.error(`Lỗi khi lấy cấu hình MapID: ${error.message}`);
      throw new Error(`Không thể lấy cấu hình MapID: ${error.message}`);
    }
  }

  /**
   * Cập nhật cấu hình MapID
   * @param updateDto DTO chứa thông tin cập nhật
   * @returns Cấu hình MapID đã cập nhật
   */
  async updateMapIDConfig(updateDto: UpdateMapIDConfigDto): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log('Cập nhật cấu hình MapID');
      
      // Lấy cấu hình hiện tại
      const currentConfig = this.readConfig();
      
      // Cập nhật cấu hình với dữ liệu mới
      const updatedConfig = {
        grade: updateDto.grade !== undefined ? updateDto.grade : currentConfig.grade,
        subject: updateDto.subject !== undefined ? updateDto.subject : currentConfig.subject,
        chapter: updateDto.chapter !== undefined ? updateDto.chapter : currentConfig.chapter,
        lesson: updateDto.lesson !== undefined ? updateDto.lesson : currentConfig.lesson,
        form: updateDto.form !== undefined ? updateDto.form : currentConfig.form,
        level: updateDto.level !== undefined ? updateDto.level : currentConfig.level,
      };
      
      // Lưu cấu hình vào file
      this.saveConfig(updatedConfig);
      
      return updatedConfig;
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật cấu hình MapID: ${error.message}`);
      throw new Error(`Không thể cập nhật cấu hình MapID: ${error.message}`);
    }
  }

  /**
   * Import cấu hình MapID từ JSON
   * @param jsonConfig Chuỗi JSON chứa cấu hình
   * @returns Cấu hình MapID đã import
   */
  async importMapIDConfig(jsonConfig: string): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log('Import cấu hình MapID từ JSON');
      
      // Parse chuỗi JSON
      let configData;
      try {
        configData = JSON.parse(jsonConfig);
      } catch (error) {
        throw new Error('JSON không hợp lệ');
      }
      
      // Kiểm tra cấu trúc dữ liệu
      const requiredFields = ['grade', 'subject', 'chapter', 'lesson', 'form', 'level'];
      const missingFields = requiredFields.filter(field => !configData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      }
      
      // Cập nhật cấu hình
      return this.updateMapIDConfig(configData);
    } catch (error) {
      this.logger.error(`Lỗi khi import cấu hình MapID: ${error.message}`);
      throw new Error(`Không thể import cấu hình MapID: ${error.message}`);
    }
  }

  /**
   * Export cấu hình MapID thành JSON
   * @returns Chuỗi JSON chứa cấu hình
   */
  async exportMapIDConfig(): Promise<ExportMapIDConfigResponseDto> {
    try {
      this.logger.log('Export cấu hình MapID thành JSON');
      
      // Lấy cấu hình hiện tại
      const config = await this.getMapIDConfig();
      
      // Chuyển thành chuỗi JSON
      const jsonConfig = JSON.stringify(config, null, 2);
      
      return { jsonConfig };
    } catch (error) {
      this.logger.error(`Lỗi khi export cấu hình MapID: ${error.message}`);
      throw new Error(`Không thể export cấu hình MapID: ${error.message}`);
    }
  }

  /**
   * Reset cấu hình MapID về mặc định
   * @returns Cấu hình MapID mặc định
   */
  async resetMapIDConfig(): Promise<MapIDConfigResponseDto> {
    try {
      this.logger.log('Reset cấu hình MapID về mặc định');
      
      // Lưu cấu hình mặc định
      this.saveConfig(this.DEFAULT_CONFIG);
      
      return this.DEFAULT_CONFIG;
    } catch (error) {
      this.logger.error(`Lỗi khi reset cấu hình MapID: ${error.message}`);
      throw new Error(`Không thể reset cấu hình MapID: ${error.message}`);
    }
  }
} 