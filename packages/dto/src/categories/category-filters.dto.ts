import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryFiltersDto {
  @ApiProperty({ description: 'Tìm kiếm theo tên hoặc mô tả', required: false, example: 'lập trình' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Lọc theo ID danh mục cha', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4, { message: 'ID danh mục cha không hợp lệ' })
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Chỉ lấy các danh mục gốc (không có danh mục cha)', required: false, example: 'true' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  rootOnly?: boolean;

  @ApiProperty({ description: 'Bao gồm các danh mục con trong kết quả', required: false, example: 'true' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeChildren?: boolean;

  @ApiProperty({ description: 'Lọc theo trạng thái hiển thị', required: false, example: 'true' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isVisible?: boolean;

  @ApiProperty({ description: 'Số trang', required: false, example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng kết quả trên mỗi trang', required: false, example: 10, default: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: 'Sắp xếp kết quả theo trường và hướng (ví dụ: "name:asc", "createdAt:desc")', required: false, example: 'name:asc' })
  @IsString()
  @IsOptional()
  @IsIn(['name:asc', 'name:desc', 'createdAt:asc', 'createdAt:desc', 'order:asc', 'order:desc'], { message: 'Giá trị sắp xếp không hợp lệ' })
  sort?: string = 'order:asc';
} 