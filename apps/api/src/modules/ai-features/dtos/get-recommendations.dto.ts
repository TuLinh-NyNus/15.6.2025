import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum RecommendationType {
  PERSONALIZED = 'PERSONALIZED',
  SIMILAR_COURSES = 'SIMILAR_COURSES',
  TRENDING = 'TRENDING',
  NEW_RELEASES = 'NEW_RELEASES',
  BASED_ON_INTERESTS = 'BASED_ON_INTERESTS',
  CONTINUE_LEARNING = 'CONTINUE_LEARNING',
}

export class GetRecommendationsDto {
  @ApiProperty({
    description: 'Loại gợi ý muốn lấy',
    enum: RecommendationType,
    default: RecommendationType.PERSONALIZED,
    required: false,
  })
  @IsEnum(RecommendationType)
  @IsOptional()
  type?: RecommendationType = RecommendationType.PERSONALIZED;

  @ApiProperty({
    description: 'ID khóa học để lấy các khóa học tương tự',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiProperty({
    description: 'ID danh mục để lọc kết quả',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: 'Số lượng kết quả tối đa',
    default: 10,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Số trang để phân trang kết quả',
    default: 1,
    minimum: 1,
    required: false,
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Ngôn ngữ ưu tiên cho nội dung gợi ý',
    example: 'vi',
    required: false,
  })
  @IsString()
  @IsOptional()
  language?: string;
} 
