import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export enum LearningPathType {
  CAREER = 'CAREER',
  SKILL = 'SKILL',
  ACADEMIC = 'ACADEMIC',
  HOBBY = 'HOBBY',
  CERTIFICATION = 'CERTIFICATION',
}

export class CreateLearningPathDto {
  @ApiProperty({
    description: 'Tên lộ trình học tập',
    example: 'Lộ trình phát triển Full-stack Web Developer',
    minLength: 5,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Mô tả về lộ trình học tập',
    example: 'Lộ trình học tập này giúp bạn trở thành một Full-stack Web Developer trong vòng 6 tháng',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Loại lộ trình học tập',
    enum: LearningPathType,
    example: LearningPathType.CAREER,
  })
  @IsEnum(LearningPathType)
  @IsNotEmpty()
  type: LearningPathType;

  @ApiProperty({
    description: 'Danh sách ID các khóa học trong lộ trình',
    example: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'],
    type: [String],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  courseIds: string[];

  @ApiProperty({
    description: 'Ước tính thời gian hoàn thành (ngày)',
    example: 180,
    required: false,
  })
  @IsOptional()
  estimatedDays?: number;

  @ApiProperty({
    description: 'Tags cho lộ trình học tập',
    example: ['javascript', 'web-development', 'react', 'node.js'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
} 