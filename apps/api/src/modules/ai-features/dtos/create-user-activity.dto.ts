import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ActivityType {
  VIEW_COURSE = 'VIEW_COURSE',
  COMPLETE_LESSON = 'COMPLETE_LESSON',
  START_COURSE = 'START_COURSE',
  SEARCH = 'SEARCH',
  CLICK_RECOMMENDATION = 'CLICK_RECOMMENDATION',
  RATE_COURSE = 'RATE_COURSE',
  BOOKMARK = 'BOOKMARK',
  DOWNLOAD_RESOURCE = 'DOWNLOAD_RESOURCE',
  SHARE_CONTENT = 'SHARE_CONTENT',
  TAKE_QUIZ = 'TAKE_QUIZ',
}

export class CreateUserActivityDto {
  @ApiProperty({
    description: 'Loại hoạt động người dùng',
    enum: ActivityType,
    example: ActivityType.VIEW_COURSE,
  })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  activityType: ActivityType;

  @ApiProperty({
    description: 'ID đối tượng liên quan (course, lesson, quiz...)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Loại đối tượng liên quan',
    example: 'course',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: 'Metadata bổ sung về hoạt động',
    example: { searchQuery: 'javascript basics', duration: 300 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
} 
