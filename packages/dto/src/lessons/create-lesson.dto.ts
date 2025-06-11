import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, IsNotEmpty, IsEnum, IsOptional, 
  IsNumber, IsUUID, IsBoolean, Min 
} from 'class-validator';
import { LessonType } from '@project/entities';

export class CreateLessonDto {
  @ApiProperty({ description: 'Tiêu đề bài học' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Mô tả ngắn về bài học', required: false })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({ description: 'Nội dung chi tiết của bài học' })
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @ApiProperty({ description: 'Thứ tự hiển thị trong khóa học', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
  
  @ApiProperty({ 
    description: 'Loại bài học', 
    enum: LessonType,
    default: LessonType.TEXT 
  })
  @IsEnum(LessonType)
  @IsOptional()
  type?: LessonType;
  
  @ApiProperty({ description: 'Tài nguyên đính kèm (URL)', required: false })
  @IsString()
  @IsOptional()
  resourceUrl?: string;
  
  @ApiProperty({ description: 'Thời lượng bài học (phút)', required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;
  
  @ApiProperty({ description: 'ID khóa học chứa bài học này' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
  
  @ApiProperty({ description: 'Đánh dấu là bài học miễn phí (preview)', default: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;
} 