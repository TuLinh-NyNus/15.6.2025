import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { QuestionDifficulty, QuestionStatus, QuestionType } from '@project/entities';
import { Type } from 'class-transformer';

export class QuestionFilterDto {
  @ApiProperty({ description: 'Trang hiện tại', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: 'Số lượng kết quả trên mỗi trang', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ description: 'Tìm kiếm theo từ khóa', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Tham số cache-buster', required: false })
  @IsOptional()
  @IsString()
  _t?: string;

  @ApiProperty({ description: 'Lọc theo lớp (tham số cũ)', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({
    description: 'Lọc theo loại câu hỏi',
    enum: QuestionType,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsEnum(QuestionType, { each: true })
  @IsArray()
  types?: QuestionType[];

  @ApiProperty({
    description: 'Lọc theo trạng thái câu hỏi',
    enum: QuestionStatus,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsEnum(QuestionStatus, { each: true })
  @IsArray()
  statuses?: QuestionStatus[];

  @ApiProperty({
    description: 'Lọc theo độ khó',
    enum: QuestionDifficulty,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsEnum(QuestionDifficulty, { each: true })
  @IsArray()
  difficulties?: QuestionDifficulty[];

  @ApiProperty({ description: 'Lọc theo người tạo', required: false })
  @IsOptional()
  @IsUUID(4)
  creatorId?: string;

  @ApiProperty({ description: 'Lọc theo danh sách nhãn', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Thêm các trường lọc theo từng vị trí tham số trong QuestionID
  @ApiProperty({ description: 'Lọc theo tham số lớp (vị trí 1) trong QuestionID', required: false })
  @IsOptional()
  @IsString()
  gradeParam?: string;

  @ApiProperty({ description: 'Lọc theo tham số môn học (vị trí 2) trong QuestionID', required: false })
  @IsOptional()
  @IsString()
  subjectParam?: string;

  @ApiProperty({ description: 'Lọc theo tham số chương (vị trí 3) trong QuestionID', required: false })
  @IsOptional()
  @IsString()
  chapterParam?: string;

  @ApiProperty({ description: 'Lọc theo tham số mức độ (vị trí 4) trong QuestionID', required: false })
  @IsOptional()
  @IsString()
  levelParam?: string;

  @ApiProperty({ description: 'Lọc theo tham số bài (vị trí 5) trong QuestionID', required: false })
  @IsOptional()
  @IsString()
  lessonParam?: string;

  @ApiProperty({ description: 'Lọc theo tham số dạng (vị trí 6) trong QuestionID', required: false })
  @IsOptional()
  @IsString()
  formParam?: string;

  @ApiProperty({ description: 'Lọc theo số lần sử dụng câu hỏi', required: false })
  @IsOptional()
  @IsString()
  usageCount?: string;
}