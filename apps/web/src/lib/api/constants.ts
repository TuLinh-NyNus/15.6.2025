/**
 * Cấu hình và hằng số cho API
 */

/**
 * API Base URL
 * Lấy từ biến môi trường hoặc fallback về giá trị mặc định
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * API Endpoints
 * Định nghĩa tất cả các endpoints sử dụng trong ứng dụng
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Admin Questions
  ADMIN: {
    QUESTIONS: {
      BASE: '/questions',
      BY_ID: (id: string) => `/questions/${id}`,
      CREATE: '/questions',
      UPDATE: (id: string) => `/questions/${id}`,
      DELETE: (id: string) => `/questions/${id}`,
    },
    USERS: {
      BASE: '/users',
      BY_ID: (id: string) => `/users/${id}`,
    },
  },
  
  // Public API
  PUBLIC: {
    QUESTIONS: '/public/questions',
  },
};

/**
 * Xây dựng URL đầy đủ cho API endpoint
 * @param endpoint API endpoint (không bao gồm base URL)
 * @returns URL đầy đủ
 */
export function buildApiUrl(endpoint: string): string {
  // Đảm bảo endpoint bắt đầu bằng / nếu chưa có
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
} 