export * from './prisma';

// Import và re-export từ @project/interfaces
import { 
  IUserRepository,
  ICourseRepository,
  IEnrollmentRepository,
  ICategoryRepository,
  ILessonRepository,
  IQuestionRepository,
  IQuestionVersionRepository,
  IQuestionImageRepository,
  IQuestionTagRepository
} from '@project/interfaces';

// Re-export interfaces
export {
  IUserRepository,
  ICourseRepository,
  IEnrollmentRepository,
  ICategoryRepository,
  ILessonRepository,
  IQuestionRepository,
  IQuestionVersionRepository,
  IQuestionImageRepository,
  IQuestionTagRepository
};

export * from './repositories/user';
export * from './repositories/user/user-repository.interface';
export * from './repositories/user/prisma-user.repository';
export * from './repositories/user-profile/user-profile-repository.interface';
export * from './repositories/user-profile/prisma-user-profile.repository';
export * from './repositories/course';
export * from './repositories/enrollment';
export * from './repositories/category';
export * from './repositories/lesson';
export * from './repositories/question/question-repository.interface';
export * from './repositories/question/prisma-question.repository';
export * from './types';

// Create a module to provide all repositories
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { PrismaUserRepository } from './repositories/user';
import { PrismaCourseRepository } from './repositories/course/prisma-course.repository';
import { PrismaEnrollmentRepository } from './repositories/enrollment';
import { PrismaCategoryRepository } from './repositories/category/prisma-category.repository';
import { PrismaLessonRepository } from './repositories/lesson';
import { PrismaQuestionRepository } from './repositories/question/prisma-question.repository';

// Export entities
export * from './entities';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'ICourseRepository',
      useClass: PrismaCourseRepository,
    },
    {
      provide: 'IEnrollmentRepository',
      useClass: PrismaEnrollmentRepository,
    },
    {
      provide: 'ICategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    {
      provide: 'ILessonRepository',
      useClass: PrismaLessonRepository,
    },
    {
      provide: 'IQuestionRepository',
      useClass: PrismaQuestionRepository,
    }
  ],
  exports: [
    PrismaModule,
    'IUserRepository',
    'ICourseRepository',
    'IEnrollmentRepository',
    'ICategoryRepository',
    'ILessonRepository',
    'IQuestionRepository'
  ],
})
export class DatabaseModule {} 