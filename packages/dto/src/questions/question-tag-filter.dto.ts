import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho việc lọc các QuestionTag
 */
export class QuestionTagFilterDto {
  @ApiPropertyOptional({
    description: 'Trang hiện tại (bắt đầu từ 1)',
    example: 1,
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang phải lớn hơn hoặc bằng 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng kết quả mỗi trang',
    example: 10,
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng kết quả mỗi trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng kết quả mỗi trang phải lớn hơn hoặc bằng 1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tên hoặc mô tả tag',
    example: 'đại số',
  })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @ApiPropertyOptional({
    description: 'ID câu hỏi để lọc các tag đang được sử dụng bởi câu hỏi',
    example: 'e7cbc460-2d32-4d9e-9aca-3abfad8e4aa8',
  })
  @IsOptional()
  @IsString({ message: 'ID câu hỏi phải là chuỗi' })
  questionId?: string;
} 