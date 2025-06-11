// Export exam-related enums
export * from './exam-enums';

// Export exam-related entities
export * from './exam.entity';
export * from './exam-result.entity';
export * from './exam-question.entity';

// Export question-related enums individually to avoid naming conflicts
export { QuestionStatus, QuestionImageType, QuestionDifficulty } from './question-enums';
// Re-export QuestionType với tên khác để tránh xung đột với exam-enums
export { QuestionType as QuestionTypeEnum } from './question-enums';

// Export question-related entities
export * from './question.entity';
export * from './question-version.entity';
export { QuestionImage } from './question-image.entity';
export * from './question-tag.entity';