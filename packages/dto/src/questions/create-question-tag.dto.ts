import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO cho việc tạo QuestionTag mới
 */
export class CreateQuestionTagDto {
  @ApiProperty({
    description: 'Tên của tag',
    example: 'Đại số',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Tên tag không được để trống' })
  @IsString({ message: 'Tên tag phải là chuỗi' })
  @MinLength(2, { message: 'Tên tag phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên tag không được vượt quá 100 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả về tag',
    example: 'Các câu hỏi liên quan đến đại số',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
  description?: string;
} 