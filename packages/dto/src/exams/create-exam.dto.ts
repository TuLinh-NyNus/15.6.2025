import { 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  IsOptional, 
  Min, 
  MaxLength, 
  ValidateNested,
  IsObject,
  ArrayMinSize
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Difficulty, ExamCategory, ExamForm, ExamType } from '@project/entities';

export class ExamDescriptionDto {
  @ApiProperty({ description: 'Năm học (VD: "2023-2024")', required: false })
  @IsOptional()
  @IsString()
  schoolYear?: string;

  @ApiProperty({ description: 'Tên trường', required: false })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiProperty({ description: 'Tỉnh/thành phố', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ description: 'Tên kỳ thi', required: false })
  @IsOptional()
  @IsString()
  examName?: string;

  @ApiProperty({ description: 'Ngày thi', required: false })
  @IsOptional()
  @IsString()
  examDate?: string;

  @ApiProperty({ description: 'Thời gian thi', required: false })
  @IsOptional()
  @IsString()
  examTime?: string;

  @ApiProperty({ description: 'Lớp thi', required: false })
  @IsOptional()
  @IsString()
  examClass?: string;

  @ApiProperty({ description: 'Hướng dẫn làm bài', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ description: 'Thông tin bổ sung', required: false, type: Object })
  @IsOptional()
  @IsObject()
  additionalInfo?: Record<string, unknown>;
}

export class CreateExamDto {
  @ApiProperty({ description: 'Tiêu đề bài thi' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Thông tin mô tả về bài thi', required: false, type: ExamDescriptionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExamDescriptionDto)
  description?: ExamDescriptionDto;

  @ApiProperty({ description: 'Danh sách ID của các câu hỏi', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  questions: number[];

  @ApiProperty({ description: 'Thời gian làm bài (phút)' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Độ khó', enum: Difficulty })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({ description: 'Môn học' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Khối lớp' })
  @IsNumber()
  @Min(1)
  grade: number;

  @ApiProperty({ description: 'Hình thức bài thi', enum: ExamForm, default: ExamForm.TRAC_NGHIEM })
  @IsEnum(ExamForm)
  @IsOptional()
  form?: ExamForm;

  @ApiProperty({ description: 'ID của người tạo' })
  @IsString()
  createdBy: string;

  @ApiProperty({ description: 'Thẻ phân loại', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Loại bài thi', enum: ExamCategory })
  @IsEnum(ExamCategory)
  examCategory: ExamCategory;

  @ApiProperty({ description: 'Trạng thái bài thi', enum: ExamType, default: ExamType.DRAFT })
  @IsEnum(ExamType)
  @IsOptional()
  type?: ExamType;
} 