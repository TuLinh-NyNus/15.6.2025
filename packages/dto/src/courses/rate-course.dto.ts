import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class RateCourseDto {
  @ApiProperty({ description: 'Đánh giá cho khóa học (từ 1 đến 5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
} 