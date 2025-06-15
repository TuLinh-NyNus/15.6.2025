import { IsString, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO để tạo question tag mới
 */
export class CreateQuestionTagDto {
  @ApiProperty({ description: 'Tên của tag' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả của tag' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Màu sắc của tag' })
  @IsOptional()
  @IsString()
  color?: string;
}

/**
 * DTO để cập nhật question tag
 */
export class UpdateQuestionTagDto {
  @ApiPropertyOptional({ description: 'Tên của tag' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Mô tả của tag' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Màu sắc của tag' })
  @IsOptional()
  @IsString()
  color?: string;
}

/**
 * DTO để lọc question tags
 */
export class QuestionTagFilterDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên tag' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Số trang' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng items per page' })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sắp xếp theo trường' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'ID câu hỏi để lọc tags' })
  @IsOptional()
  @IsString()
  questionId?: string;
}

/**
 * DTO để trả về thông tin question tag
 */
export class QuestionTagResponseDto {
  @ApiProperty({ description: 'ID của tag' })
  id: string;

  @ApiProperty({ description: 'Tên của tag' })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả của tag' })
  description?: string;

  @ApiPropertyOptional({ description: 'Màu sắc của tag' })
  color?: string;

  @ApiProperty({ description: 'Số lượng câu hỏi sử dụng tag này' })
  questionCount: number;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  constructor(data?: Partial<QuestionTagResponseDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
