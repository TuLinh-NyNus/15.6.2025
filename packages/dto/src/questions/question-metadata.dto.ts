import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class QuestionMetadataDto {
  @ApiProperty({ description: 'Tổng số câu hỏi' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Tổng số câu hỏi trạng thái ACTIVE' })
  @IsNumber()
  activeCount: number;

  @ApiProperty({ description: 'Tổng số câu hỏi trạng thái DRAFT' })
  @IsNumber()
  draftCount: number;

  @ApiProperty({ description: 'Tổng số câu hỏi trạng thái PENDING' })
  @IsNumber()
  pendingCount: number;

  @ApiProperty({ description: 'Tổng số câu hỏi trạng thái ARCHIVED' })
  @IsNumber()
  archivedCount: number;

  @ApiProperty({ description: 'Tổng số câu hỏi trạng thái DELETED' })
  @IsNumber()
  deletedCount: number;

  @ApiProperty({ description: 'Thông tin thống kê theo loại câu hỏi', required: false })
  @IsOptional()
  typeStats?: Record<string, number>;

  @ApiProperty({ description: 'Thông tin thống kê theo độ khó', required: false })
  @IsOptional()
  difficultyStats?: Record<string, number>;

  @ApiProperty({ description: 'Thông tin thống kê theo tags', required: false })
  @IsOptional()
  tagStats?: Record<string, number>;

  @ApiProperty({ description: 'Thông tin thống kê theo người tạo', required: false })
  @IsOptional()
  creatorStats?: { id: string; name: string; count: number }[];
} 