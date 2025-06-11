import { 
  Exam, 
  ExamQuestion, 
  ExamAttempt, 
  ExamResult, 
  ExamStats, 
  DetailedExamStats,
  QuestionStats 
} from './types/exam.types';
import { apiClient } from './api-config';

const API_ENDPOINTS = {
  EXAMS: '/api/exams',
  QUESTIONS: '/api/questions',
  ATTEMPTS: '/api/attempts',
  RESULTS: '/api/results',
  STATS: '/api/stats'
};

/**
 * Fetch all exams with optional filtering and pagination
 */
export const fetchExams = async (params?: {
  page?: number;
  limit?: number;
  subject?: string;
  grade?: string;
  difficulty?: string;
  category?: string;
  search?: string;
}): Promise<{ data: Exam[]; total: number; page: number; limit: number }> => {
  return apiClient.get(API_ENDPOINTS.EXAMS, { params });
};

/**
 * Fetch a single exam by ID
 */
export const fetchExamById = async (id: string): Promise<Exam> => {
  return apiClient.get(`${API_ENDPOINTS.EXAMS}/${id}`);
};

/**
 * Create a new exam
 */
export const createExam = async (examData: Partial<Exam>): Promise<Exam> => {
  return apiClient.post(API_ENDPOINTS.EXAMS, examData);
};

/**
 * Update an existing exam
 */
export const updateExam = async (id: string, examData: Partial<Exam>): Promise<Exam> => {
  return apiClient.patch(`${API_ENDPOINTS.EXAMS}/${id}`, examData);
};

/**
 * Delete an exam
 */
export const deleteExam = async (id: string): Promise<void> => {
  return apiClient.delete(`${API_ENDPOINTS.EXAMS}/${id}`);
};

/**
 * Publish or unpublish an exam
 */
export const toggleExamPublishStatus = async (id: string, isPublished: boolean): Promise<Exam> => {
  return apiClient.patch(`${API_ENDPOINTS.EXAMS}/${id}/publish`, { isPublished });
};

/**
 * Fetch questions for a specific exam
 */
export const fetchQuestionsByExamId = async (examId: string): Promise<ExamQuestion[]> => {
  return apiClient.get(`${API_ENDPOINTS.EXAMS}/${examId}/questions`);
};

/**
 * Fetch a single question by ID
 */
export const fetchQuestionById = async (id: number): Promise<ExamQuestion> => {
  return apiClient.get(`${API_ENDPOINTS.QUESTIONS}/${id}`);
};

/**
 * Create a new question for an exam
 */
export const createQuestion = async (questionData: Partial<ExamQuestion>): Promise<ExamQuestion> => {
  return apiClient.post(API_ENDPOINTS.QUESTIONS, questionData);
};

/**
 * Update an existing question
 */
export const updateQuestion = async (id: number, questionData: Partial<ExamQuestion>): Promise<ExamQuestion> => {
  return apiClient.patch(`${API_ENDPOINTS.QUESTIONS}/${id}`, questionData);
};

/**
 * Delete a question
 */
export const deleteQuestion = async (id: number): Promise<void> => {
  return apiClient.delete(`${API_ENDPOINTS.QUESTIONS}/${id}`);
};

/**
 * Start a new exam attempt
 */
export const startExamAttempt = async (examId: string, userId: string): Promise<ExamAttempt> => {
  return apiClient.post(API_ENDPOINTS.ATTEMPTS, { examId, userId });
};

/**
 * Submit an exam attempt
 */
export const submitExamAttempt = async (
  attemptId: string, 
  answers: Record<string, string>
): Promise<ExamResult> => {
  return apiClient.post(`${API_ENDPOINTS.ATTEMPTS}/${attemptId}/submit`, { answers });
};

/**
 * Get attempt by ID
 */
export const getAttemptById = async (attemptId: string): Promise<ExamAttempt> => {
  return apiClient.get(`${API_ENDPOINTS.ATTEMPTS}/${attemptId}`);
};

/**
 * Get user's attempts for an exam
 */
export const getUserExamAttempts = async (userId: string, examId: string): Promise<ExamAttempt[]> => {
  return apiClient.get(API_ENDPOINTS.ATTEMPTS, { params: { userId, examId } });
};

/**
 * Get result by ID
 */
export const getResultById = async (resultId: string): Promise<ExamResult> => {
  return apiClient.get(`${API_ENDPOINTS.RESULTS}/${resultId}`);
};

/**
 * Get user's results for an exam
 */
export const getUserExamResults = async (userId: string, examId: string): Promise<ExamResult[]> => {
  return apiClient.get(API_ENDPOINTS.RESULTS, { params: { userId, examId } });
};

/**
 * Get exam statistics
 */
export const getExamStats = async (examId: string): Promise<ExamStats> => {
  return apiClient.get(`${API_ENDPOINTS.STATS}/exams/${examId}`);
};

/**
 * Get detailed exam statistics including question stats
 */
export const getDetailedExamStats = async (examId: string): Promise<DetailedExamStats> => {
  return apiClient.get(`${API_ENDPOINTS.STATS}/exams/${examId}/detailed`);
};

/**
 * Get statistics for a specific question
 */
export const getQuestionStats = async (questionId: number): Promise<QuestionStats> => {
  return apiClient.get(`${API_ENDPOINTS.STATS}/questions/${questionId}`);
}; 