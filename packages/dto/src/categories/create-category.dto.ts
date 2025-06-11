import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean, IsUrl, MinLength, MaxLength, IsArray } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Tên danh mục', example: 'Lập trình Web' })
  @IsString()
  @MinLength(2, { message: 'Tên danh mục phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên danh mục không được vượt quá 100 ký tự' })
  name!: string;

  @ApiProperty({ description: 'Mô tả về danh mục', required: false, example: 'Các khóa học về lập trình web' })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
  description?: string;

  @ApiProperty({ description: 'ID của danh mục cha (nếu có)', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4, { message: 'ID danh mục cha không hợp lệ' })
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Thứ tự hiển thị của danh mục', required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ description: 'Đường dẫn slug của danh mục', required: false, example: 'lap-trinh-web' })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Slug phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Slug không được vượt quá 100 ký tự' })
  slug?: string;

  @ApiProperty({ description: 'URL hình ảnh đại diện của danh mục', required: false, example: 'https://example.com/image.jpg' })
  @IsUrl({}, { message: 'URL hình ảnh không hợp lệ' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Có hiển thị danh mục không', default: true, example: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({ description: 'Danh sách ID các khóa học thuộc danh mục này', required: false, type: [String], example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsArray()
  @IsUUID(4, { each: true, message: 'ID khóa học không hợp lệ' })
  @IsOptional()
  courseIds?: string[];
} 