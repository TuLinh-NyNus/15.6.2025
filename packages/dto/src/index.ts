// Export auth DTOs explicitly
export { RegisterDto } from './auth/register.dto';
export { LoginDto } from './auth/login.dto';
export { TokensDto } from './auth/tokens.dto';

// Export user DTOs explicitly
export { CreateUserDto } from './users/create-user.dto';
export { UpdateUserDto } from './users/update-user.dto';
export { UserResponseDto } from './users/user-response.dto';

// Export category DTOs explicitly
export { CreateCategoryDto } from './categories/create-category.dto';
export { UpdateCategoryDto } from './categories/update-category.dto';
export { CategoryResponseDto } from './categories/category-response.dto';
export { CategoryFiltersDto } from './categories/category-filters.dto';

// Export course DTOs explicitly
export { CreateCourseDto } from './courses/create-course.dto';
export { UpdateCourseDto } from './courses/update-course.dto';
export { CourseResponseDto } from './courses/course-response.dto';
export { CourseFiltersDto } from './courses/course-filters.dto';
export { RateCourseDto } from './courses/rate-course.dto';

// Export enrollment DTOs explicitly
export { CreateEnrollmentDto } from './enrollments/create-enrollment.dto';
export { EnrollmentResponseDto } from './enrollments/enrollment-response.dto';
export { EnrollmentFiltersDto } from './enrollments/enrollment-filters.dto';

// Export lesson DTOs explicitly
export { CreateLessonDto } from './lessons/create-lesson.dto';
export { UpdateLessonDto } from './lessons/update-lesson.dto';
export { LessonResponseDto } from './lessons/lesson-response.dto';
export { LessonFiltersDto } from './lessons/lesson-filters.dto';

// Export exam DTOs explicitly
export { CreateExamDto } from './exams/create-exam.dto';
export { UpdateExamDto } from './exams/update-exam.dto';
export { ExamResponseDto } from './exams/exam-response.dto';
export { ExamFilterDto } from './exams/exam-filter.dto';
export { CreateExamResultDto, ExamResultResponseDto } from './exams/exam-result.dto';
export { ExamStatsDto } from './exams/exam-stats.dto';
export { ExamStatsParamsDto } from './exams/exam-stats.dto';
export { DetailedExamStatsDto } from './exams/exam-stats.dto';
export { QuestionStatsDto } from './exams/exam-stats.dto';
export { QuestionOptionDto } from './exams/exam-question.dto';

// Export question DTOs explicitly
export { CreateQuestionDto } from './questions/create-question.dto';
export { UpdateQuestionDto } from './questions/update-question.dto';
export { QuestionResponseDto } from './questions/question-response.dto';
export { QuestionFilterDto } from './questions/question-filter.dto';
export { QuestionSearchDto } from './questions/question-search.dto';
export { ExamQuestionSearchDto } from './questions/exam-question-search.dto';
export { ExamQuestionFilterDto } from './questions/exam-question-filter.dto';
export { QuestionImportDto, QuestionExportDto, BatchImportDto, QuestionImportResultDto } from './questions/question-import-export.dto';
export { CreateQuestionTagDto, UpdateQuestionTagDto, QuestionTagFilterDto, QuestionTagResponseDto } from './questions/question-tag.dto';

// Re-export with aliases for backward compatibility
export { QuestionResponseDto as ExamQuestionResponseDto } from './questions/question-response.dto';
export { CreateQuestionDto as CreateExamQuestionDto } from './questions/create-question.dto';
export { UpdateQuestionDto as UpdateExamQuestionDto } from './questions/update-question.dto';
