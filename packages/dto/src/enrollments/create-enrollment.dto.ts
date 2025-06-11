import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { EnrollmentStatus } from '@project/entities';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'ID của khóa học muốn đăng ký' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Trạng thái đăng ký', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE, required: false })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;
} 