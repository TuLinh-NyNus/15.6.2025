import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

/**
 * DTO cho việc cập nhật toàn bộ cấu hình MapID
 */
export class UpdateMapIDConfigDto {
  @ApiProperty({
    description: 'Cấu hình cho Lớp',
    type: Object,
    required: false,
    example: {
      '0': 'Lớp 10',
      '1': 'Lớp 11',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Cấu hình Lớp phải là một object' })
  grade?: Record<string, string>;

  @ApiProperty({
    description: 'Cấu hình cho Môn',
    type: Object,
    required: false,
    example: {
      'P': '10-NGÂN HÀNG CHÍNH',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Cấu hình Môn phải là một object' })
  subject?: Record<string, string>;

  @ApiProperty({
    description: 'Cấu hình cho Chương',
    type: Object,
    required: false,
    example: {
      '1': 'Mệnh đề và tập hợp',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Cấu hình Chương phải là một object' })
  chapter?: Record<string, string>;

  @ApiProperty({
    description: 'Cấu hình cho Bài',
    type: Object,
    required: false,
    example: {
      '1': 'Mệnh đề',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Cấu hình Bài phải là một object' })
  lesson?: Record<string, string>;

  @ApiProperty({
    description: 'Cấu hình cho Dạng',
    type: Object,
    required: false,
    example: {
      '1': 'Xác định mệnh đề, mệnh đề chứa biến',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Cấu hình Dạng phải là một object' })
  form?: Record<string, string>;

  @ApiProperty({
    description: 'Cấu hình cho Mức độ',
    type: Object,
    required: false,
    example: {
      'N': 'Nhận biết',
      'H': 'Thông Hiểu',
      'V': 'VD',
      'C': 'VD Cao',
      'T': 'VIP',
      'M': 'Note',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Cấu hình Mức độ phải là một object' })
  level?: Record<string, string>;
}

/**
 * DTO cho việc import cấu hình MapID từ JSON
 */
export class ImportMapIDConfigDto {
  @ApiProperty({
    description: 'Chuỗi JSON chứa cấu hình MapID',
    example: '{"grade":{"0":"Lớp 10","1":"Lớp 11"},"subject":{"P":"10-NGÂN HÀNG CHÍNH"}}',
  })
  jsonConfig: string;
}

/**
 * DTO cho response khi export cấu hình MapID
 */
export class ExportMapIDConfigResponseDto {
  @ApiProperty({
    description: 'Chuỗi JSON chứa cấu hình MapID',
    example: '{"grade":{"0":"Lớp 10","1":"Lớp 11"},"subject":{"P":"10-NGÂN HÀNG CHÍNH"}}',
  })
  jsonConfig: string;
}

/**
 * DTO cho response khi lấy cấu hình MapID
 */
export class MapIDConfigResponseDto {
  @ApiProperty({
    description: 'Cấu trúc Lớp',
    example: {
      '0': 'Lớp 10',
      '1': 'Lớp 11',
      '2': 'Lớp 12',
    },
  })
  grade: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Môn',
    example: {
      'P': '10-NGÂN HÀNG CHÍNH',
    },
  })
  subject: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Chương',
    example: {
      '1': 'Mệnh đề và tập hợp',
    },
  })
  chapter: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Bài',
    example: {
      '1': 'Mệnh đề',
    },
  })
  lesson: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Dạng',
    example: {
      '1': 'Xác định mệnh đề, mệnh đề chứa biến',
    },
  })
  form: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Mức độ',
    example: {
      'N': 'Nhận biết',
      'H': 'Thông Hiểu',
      'V': 'VD',
      'C': 'VD Cao',
      'T': 'VIP',
      'M': 'Note',
    },
  })
  level: Record<string, string>;
} 