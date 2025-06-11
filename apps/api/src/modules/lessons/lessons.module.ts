import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { DatabaseModule, PrismaLessonRepository, PrismaCourseRepository, PrismaEnrollmentRepository } from '@project/database';

@Module({
  imports: [DatabaseModule],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    {
      provide: 'ILessonRepository',
      useClass: PrismaLessonRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: PrismaCourseRepository,
    },
    {
      provide: 'IEnrollmentRepository',
      useClass: PrismaEnrollmentRepository,
    },
  ],
  exports: [LessonsService],
})
export class LessonsModule {} 