/**
 * Các khóa truy vấn cho React Query
 * Các khóa này được sử dụng để xác định các truy vấn trong bộ nhớ cache
 */

export enum QueryKeys {
  // Auth
  AUTH_USER = 'auth-user',

  // Courses
  COURSES = 'courses',
  COURSE = 'course',
  FEATURED_COURSES = 'featured-courses',
  POPULAR_COURSES = 'popular-courses',

  // Lessons
  LESSONS = 'lessons',
  LESSON = 'lesson',

  // Questions
  QUESTIONS = 'questions',
  QUESTION = 'question',
  QUESTION_TAGS = 'question-tags',
  QUESTIONS_SEARCH = 'questions-search',
  QUESTION_BY_ID = 'question-by-id',
  QUESTIONS_BY_TAG = 'questions-by-tag',

  // Exams
  EXAMS = 'exams',
  EXAM = 'exam',
  EXAM_QUESTIONS = 'exam-questions',
  EXAM_ATTEMPTS = 'exam-attempts',
  EXAM_RESULTS = 'exam-results',

  // Categories
  CATEGORIES = 'categories',
  CATEGORY = 'category',

  // Users
  USERS = 'users',
  USER = 'user',
  USER_PROFILE = 'user-profile',
  CURRENT_USER_PROFILE = 'current-user-profile',
  USER_COURSES = 'user-courses',

  // Map ID
  MAP_ID = 'map-id',
  MAP_ID_STRUCTURE = 'map-id-structure',
}

/**
 * Tạo khóa truy vấn cho danh sách
 * @param key Khóa cơ sở
 * @param params Tham số truy vấn
 * @returns Khóa truy vấn
 */
export function createListQueryKey(key: QueryKeys, params?: Record<string, unknown>) {
  return params ? [key, 'list', params] : [key, 'list'];
}

/**
 * Tạo khóa truy vấn cho chi tiết
 * @param key Khóa cơ sở
 * @param id ID của phần tử
 * @returns Khóa truy vấn
 */
export function createDetailQueryKey(key: QueryKeys, id: string | number) {
  return [key, 'detail', id];
}

/**
 * Tạo khóa truy vấn chung
 * @param key Khóa cơ sở
 * @param params Tham số bổ sung
 * @returns Khóa truy vấn
 */
export function createQueryKey(key: QueryKeys, ...params: (string | number | boolean | Record<string, unknown> | undefined)[]) {
  return params.length > 0 ? [key, ...params.filter(param => param !== undefined)] : [key];
}
