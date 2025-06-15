import { Module } from '@nestjs/common';
import { ExamsController } from './controllers/exams.controller';
import { ExamQuestionsController } from './controllers/exam-questions.controller';
import { ExamResultsController } from './controllers/exam-results.controller';
import { ExamStatsController } from './controllers/exam-stats.controller';
import { ExamQuestionController } from './controllers/question.controller';
import { ExamAttemptController } from './controllers/exam-attempt.controller';
import { LaTeXParserController } from './controllers/latex-parser.controller';
import { LaTeXRendererController } from './controllers/latex-renderer.controller';
import { ExamService } from './services/exam.service';
import { QuestionService } from './services/question.service';
import { AttemptService } from './services/attempt.service';
import { LaTeXParserService } from './services/latex-parser.service';
import { LaTeXRendererService } from './services/latex-renderer.service';
import { DatabaseModule } from '@project/database';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ExamsController,
    ExamQuestionsController,
    ExamResultsController,
    ExamStatsController,
    ExamQuestionController,
    ExamAttemptController,
    LaTeXParserController,
    LaTeXRendererController
  ],
  providers: [
    ExamService,
    QuestionService,
    AttemptService,
    LaTeXParserService,
    LaTeXRendererService,
    // Các service khác sẽ được thêm sau khi triển khai
  ],
  exports: [
    ExamService,
    QuestionService,
    AttemptService,
    LaTeXParserService,
    LaTeXRendererService,
  ]
})
export class ExamsModule {} 
