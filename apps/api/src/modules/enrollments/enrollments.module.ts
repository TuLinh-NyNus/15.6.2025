import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaEnrollmentRepository, PrismaCourseRepository } from '@project/database';
import { DatabaseModule } from '@project/database';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
    CoursesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentsService,
    {
      provide: 'IEnrollmentRepository',
      useClass: PrismaEnrollmentRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: PrismaCourseRepository,
    },
  ],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {} 