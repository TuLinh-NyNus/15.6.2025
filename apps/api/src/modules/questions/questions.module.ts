import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuestionsController } from './controllers/questions.controller';
import { QuestionsService } from './services/questions.service';
import { QuestionVersionService } from './services/question-version.service';
import { DatabaseModule } from '@project/database';
import { QuestionTagService } from './services/question-tag.service';
import { QuestionTagsController } from './controllers/question-tags.controller';
import { QuestionVersionController } from './controllers/question-version.controller';
import { QuestionSearchController } from './controllers/question-search.controller';
import { QuestionImportExportController } from './controllers/question-import-export.controller';
import { QuestionTagRepository } from './repositories/question-tag.repository';
import { LaTeXParserService } from '../exams/services/latex-parser.service';
import { MapIDService } from './services/map-id.service';
import { MapIDController } from './controllers/map-id.controller';
import { MapIDConfigService } from './services/map-id-config.service';
import { MapIDConfigController } from './controllers/map-id-config.controller';
import { QuestionStatsService } from './services/question-stats.service';
import { QuestionRepository } from '@project/database';
import { SimpleQuestionsController } from './controllers/simple-questions.controller';

@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
  ],
  controllers: [
    QuestionsController,
    QuestionTagsController,
    QuestionVersionController,
    QuestionSearchController,
    QuestionImportExportController,
    MapIDController,
    MapIDConfigController,
    SimpleQuestionsController
  ],
  providers: [
    QuestionsService, 
    QuestionVersionService,
    QuestionTagService,
    LaTeXParserService,
    MapIDService,
    MapIDConfigService,
    {
      provide: 'IQuestionTagRepository',
      useClass: QuestionTagRepository
    },
    {
      provide: 'IQuestionRepository',
      useClass: QuestionRepository
    },
    QuestionStatsService,
  ],
  exports: [
    QuestionsService, 
    QuestionVersionService,
    QuestionTagService,
    MapIDService,
    MapIDConfigService,
    QuestionStatsService,
  ]
})
export class QuestionsModule {} 
