'use client';

import { RequestOptions, ApiClient, ApiError } from '@/lib/types/api';
import logger from '@/lib/utils/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Log API URL để debug
logger.info('API Service initialized with URL:', API_URL);

const apiClient: ApiClient = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Tạo URL đầy đủ
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Cấu hình mặc định
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Thêm token vào header nếu đã đăng nhập
    const token = typeof window !== 'undefined' ? 
      (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Chuẩn bị options cho fetch
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
    };

    // Thêm body nếu không phải GET
    if (options.body && fetchOptions.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Xử lý lỗi 401 Unauthorized
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/auth/signin';
        }
        throw new Error('Phiên đăng nhập hết hạn');
      }

      // Xử lý các lỗi khác
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError: ApiError = {
          status: response.status,
          message: errorData.message || response.statusText,
          response: { data: errorData }
        };
        throw apiError;
      }

      // Kiểm tra nếu response rỗng
      if (response.status === 204) {
        return {} as T;
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('API request failed:', error);
      throw error;
    }
  },

  // Các phương thức tiện ích
  get: function<T>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post: function<T>(endpoint: string, body: Record<string, unknown> | unknown[], options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put: function<T>(endpoint: string, body: Record<string, unknown> | unknown[], options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  patch: function<T>(endpoint: string, body: Record<string, unknown> | unknown[], options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  },

  delete: function<T>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

export default apiClient;