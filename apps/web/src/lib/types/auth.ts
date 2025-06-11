/**
 * Định nghĩa các kiểu dữ liệu liên quan đến xác thực
 */

/**
 * Interface cho lỗi đăng nhập
 */
export interface AuthError extends Error {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Interface cho dữ liệu đăng nhập
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}
