import { Module } from '@nestjs/common';
import { 
  UserActivityController,
  RecommendationController,
  LearningPathController
} from './controllers';

@Module({
  imports: [
    // Sẽ import các modules cần thiết ở đây
  ],
  controllers: [
    UserActivityController,
    RecommendationController,
    LearningPathController
  ],
  providers: [
    // Sẽ thêm các services sau
  ],
  exports: [
    // Sẽ xuất các providers cần thiết sau
  ]
})
export class AiFeaturesModule {} 