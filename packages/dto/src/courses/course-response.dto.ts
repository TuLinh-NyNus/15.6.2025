import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { CourseStatus } from '@project/entities';

export class InstructorDto {
  @ApiProperty({ description: 'Instructor ID' })
  id: string;

  @ApiProperty({ description: 'Instructor name' })
  name: string;

  @ApiProperty({ description: 'Instructor email' })
  email: string;
}

export class CourseResponseDto {
  @ApiProperty({ description: 'Course ID' })
  id: string;

  @ApiProperty({ description: 'Course title' })
  title: string;

  @ApiProperty({ description: 'Full course description' })
  description: string;

  @ApiProperty({ description: 'Short description for course cards', required: false })
  shortDescription?: string;

  @ApiProperty({ description: 'Course duration in minutes', required: false })
  duration?: number;

  @ApiProperty({ description: 'Course price' })
  price: number;

  @ApiProperty({ description: 'Whether the course is free' })
  isFree: boolean;

  @ApiProperty({ 
    description: 'Course instructor', 
    oneOf: [
      { type: 'string' }, 
      { $ref: getSchemaPath(InstructorDto) }
    ]
  })
  instructor: string | InstructorDto;

  @ApiProperty({ description: 'Course categories', type: [String], required: false })
  categories?: string[];

  @ApiProperty({ description: 'Course thumbnail URL', required: false })
  thumbnail?: string;

  @ApiProperty({ description: 'Course intro video URL', required: false })
  introVideo?: string;

  @ApiProperty({ description: 'Course prerequisites', type: [String], required: false })
  prerequisites?: string[];

  @ApiProperty({ description: 'Course learning outcomes', type: [String], required: false })
  learningOutcomes?: string[];

  @ApiProperty({ description: 'Total students enrolled' })
  totalStudents: number;

  @ApiProperty({ description: 'Total lessons in the course' })
  totalLessons: number;

  @ApiProperty({ description: 'Course status', enum: CourseStatus })
  status: CourseStatus;

  @ApiProperty({ description: 'Course language', required: false })
  language?: string;

  @ApiProperty({ description: 'Average course rating' })
  averageRating: number;

  @ApiProperty({ description: 'Total number of ratings' })
  totalRatings: number;

  @ApiProperty({ description: 'Course creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Course last update date' })
  updatedAt: Date;
} 