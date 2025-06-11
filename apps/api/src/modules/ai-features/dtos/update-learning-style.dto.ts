import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateLearningStyleDto {
  @ApiProperty({
    description: 'Điểm số cho phong cách học tập trực quan (hình ảnh, biểu đồ)',
    example: 8,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  visualScore?: number;

  @ApiProperty({
    description: 'Điểm số cho phong cách học tập thính giác (audio, bài giảng)',
    example: 7,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  auditoryScore?: number;

  @ApiProperty({
    description: 'Điểm số cho phong cách học tập vận động (thực hành, làm bài tập)',
    example: 9,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  kinestheticScore?: number;

  @ApiProperty({
    description: 'Điểm số cho phong cách học tập đọc/viết (đọc tài liệu, ghi chú)',
    example: 6,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  readingWritingScore?: number;

  @ApiProperty({
    description: 'Điểm số cho phong cách học tập logic (cấu trúc, quy tắc)',
    example: 8,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  logicalScore?: number;

  @ApiProperty({
    description: 'Điểm số cho phong cách học tập xã hội (nhóm, thảo luận)',
    example: 5,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  socialScore?: number;

  @ApiProperty({
    description: 'Điểm số cho phong cách học tập độc lập (tự học)',
    example: 9,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  solitaryScore?: number;
} 