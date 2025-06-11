import { logger } from '../logger';
import { authService } from '../auth/AuthService';
import { tokenCache } from '../auth/TokenCache';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * API Client - Hàm tiện ích để gọi API
 * @param endpoint Đường dẫn API (không bao gồm base URL)
 * @param options Tùy chọn fetch
 * @returns Promise<T>
 */
export async function apiClient<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;

  // Tạo headers
  const headers = new Headers(options.headers);

  // Thêm token xác thực nếu cần
  if (!options.skipAuth) {
    try {
      // Sử dụng tokenCache để lấy token
      const token = await tokenCache.getToken('api_auth_token', async () => {
        const authToken = await authService.getToken();
        return {
          token: authToken,
          expiresIn: 600 // 10 phút
        };
      });

      headers.set('Authorization', `Bearer ${token}`);
      logger.debug(`Gọi API với token: ${token.substring(0, 20)}...`);
    } catch (error) {
      logger.error('Lỗi khi lấy token cho API call', error);
    }
  }

  // Đảm bảo Content-Type là application/json nếu không được set
  if (!headers.has('Content-Type') && options.method !== 'GET' && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Tạo request options
  const requestOptions: RequestInit = {
    ...options,
    headers
  };

  // Log request
  logger.debug(`API Request: ${options.method || 'GET'} ${url}`, {
    headers: Object.fromEntries(headers.entries()),
    body: options.body
  });

  try {
    // Thực hiện request
    const response = await fetch(url, requestOptions);

    // Log response status
    logger.debug(`API Response: ${response.status} ${response.statusText}`);

    // Xử lý lỗi
    if (!response.ok) {
      // Xử lý lỗi 401 - Unauthorized
      if (response.status === 401) {
        logger.warn('API trả về lỗi 401 Unauthorized, xóa token');
        authService.clearTokens();

        // Nếu đây là lần thứ hai gặp lỗi 401, không thử lại để tránh vòng lặp vô hạn
        if (options.headers && (options.headers as any)['x-retry-auth']) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Thử lại request với token mới
        logger.info('Thử lại request với token mới');
        return apiClient<T>(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            'x-retry-auth': 'true'
          }
        });
      }

      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    logger.error(`API Error: ${url}`, error);
    throw error;
  }
}
