import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { DatabaseModule } from '@project/database';
import { CourseOwnershipGuard } from '../auth/guards/ownership.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [CoursesController],
  providers: [CoursesService, CourseOwnershipGuard],
  exports: [CoursesService],
})
export class CoursesModule {} 