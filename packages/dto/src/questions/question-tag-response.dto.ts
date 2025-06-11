import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO cho response của QuestionTag
 */
export class QuestionTagResponseDto {
  @ApiProperty({
    description: 'ID của tag',
    example: 'e7cbc460-2d32-4d9e-9aca-3abfad8e4aa8',
  })
  id: string;

  @ApiProperty({
    description: 'Tên của tag',
    example: 'Đại số',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả về tag',
    example: 'Các câu hỏi liên quan đến đại số',
  })
  description?: string;

  @ApiProperty({
    description: 'Thời điểm tạo',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật',
    type: Date,
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Số lượng câu hỏi sử dụng tag này',
    example: 42,
  })
  questionCount?: number;

  constructor(partial: Partial<QuestionTagResponseDto>) {
    Object.assign(this, partial);
  }
} 