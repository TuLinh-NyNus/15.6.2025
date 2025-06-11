import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({ description: 'Danh sách ID các khóa học cần thêm vào danh mục', required: false, type: [String] })
  @IsArray()
  @IsUUID(4, { each: true, message: 'ID khóa học không hợp lệ' })
  @IsOptional()
  addCourseIds?: string[];

  @ApiProperty({ description: 'Danh sách ID các khóa học cần xóa khỏi danh mục', required: false, type: [String] })
  @IsArray()
  @IsUUID(4, { each: true, message: 'ID khóa học không hợp lệ' })
  @IsOptional()
  removeCourseIds?: string[];
} 