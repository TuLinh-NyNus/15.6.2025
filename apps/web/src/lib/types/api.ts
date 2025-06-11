/**
 * Định nghĩa các kiểu dữ liệu cho API
 */

/**
 * Interface cho các tùy chọn request
 */
export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | unknown[] | string | number | boolean | null;
}

/**
 * Interface cho lỗi API
 */
export interface ApiError {
  status: number;
  message: string;
  response?: {
    data: Record<string, unknown>;
  };
}

/**
 * Interface cho API Client
 */
export interface ApiClient {
  request<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>;
  post<T>(endpoint: string, body: Record<string, unknown> | unknown[], options?: Omit<RequestOptions, 'method'>): Promise<T>;
  put<T>(endpoint: string, body: Record<string, unknown> | unknown[], options?: Omit<RequestOptions, 'method'>): Promise<T>;
  patch<T>(endpoint: string, body: Record<string, unknown> | unknown[], options?: Omit<RequestOptions, 'method'>): Promise<T>;
  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T>;
}
