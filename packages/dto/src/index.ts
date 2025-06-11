export * from './auth';
export * from './users';
export * from './courses';
export * from './enrollments';
export * from './lessons';
export * from './categories';
export * from './exams';
export * from './questions';

// Re-export with aliases for backward compatibility
import { QuestionResponseDto } from './questions';
import { CreateQuestionDto } from './questions';
import { UpdateQuestionDto } from './questions';

// Re-export with aliases for backward compatibility
export {
  QuestionResponseDto as ExamQuestionResponseDto,
  CreateQuestionDto as CreateExamQuestionDto,
  UpdateQuestionDto as UpdateExamQuestionDto
};

// Export Exam Question DTOs directly
export { ExamQuestionSearchDto } from './questions/exam-question-search.dto';
export { ExamQuestionFilterDto } from './questions/exam-question-filter.dto';
export { QuestionFilterDto } from './questions/question-filter.dto';
export { QuestionSearchDto } from './questions/question-search.dto';

// Re-export with explicit names for clarity
export { CategoryFiltersDto } from './categories/category-filters.dto';
export { CourseFiltersDto } from './courses/course-filters.dto';
export { EnrollmentFiltersDto } from './enrollments/enrollment-filters.dto';
export { LessonFiltersDto } from './lessons/lesson-filters.dto';
export { CreateLessonDto } from './lessons/create-lesson.dto';
export { UpdateLessonDto } from './lessons/update-lesson.dto';
