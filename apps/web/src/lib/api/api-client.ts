import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Cấu hình mặc định cho axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Tạo instance axios với cấu hình mặc định
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Interceptor cho request
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có - ưu tiên authToken, fallback về token (cho tương thích ngược)
    const token = typeof window !== 'undefined' ?
      (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;

    // Thêm token vào header nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Đã thêm token vào header, độ dài token:', token.length);
    } else {
      console.warn('Không tìm thấy token trong localStorage');

      // Thử lấy token từ cookie
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const authTokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));

        if (authTokenCookie) {
          const cookieToken = authTokenCookie.split('=')[1];
          if (cookieToken) {
            config.headers.Authorization = `Bearer ${cookieToken}`;
            console.log('Đã thêm token từ cookie vào header, độ dài token:', cookieToken.length);

            // Lưu token vào localStorage để sử dụng sau này
            localStorage.setItem('authToken', cookieToken);
          }
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Biến để theo dõi trạng thái làm mới token
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

// Hàm xử lý hàng đợi các request bị lỗi
const processQueue = (token: string | null, error: any = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// Hàm để lấy token mới
const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.accessToken) {
        // Lưu token mới vào localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.accessToken);
          console.log('Token mới đã được lưu vào localStorage, độ dài:', data.accessToken.length);
        }
        return data.accessToken;
      }
    }

    console.error('Không thể lấy token mới:', await response.text());
    return null;
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error);
    return null;
  }
};

// Interceptor cho response
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về data trực tiếp
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Xử lý lỗi 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Đánh dấu request này đã được thử lại
      originalRequest._retry = true;

      // Nếu đang làm mới token, thêm request vào hàng đợi
      if (isRefreshing) {
        try {
          // Đợi token mới từ quá trình làm mới hiện tại
          const newToken = await new Promise<string | null>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });

          if (newToken) {
            // Thử lại request với token mới
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`
            };

            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Lỗi khi đợi token mới:', refreshError);
          return Promise.reject(error);
        }
      }

      // Bắt đầu quá trình làm mới token
      isRefreshing = true;

      try {
        // Lấy token mới
        refreshPromise = refreshToken();
        const newToken = await refreshPromise;

        // Xử lý hàng đợi các request bị lỗi
        processQueue(newToken);

        if (newToken) {
          // Thử lại request với token mới
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`
          };

          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Xử lý lỗi khi làm mới token
        processQueue(null, refreshError);
        console.error('Lỗi khi làm mới token:', refreshError);
      } finally {
        // Đánh dấu quá trình làm mới token đã kết thúc
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

// Các phương thức tiện ích
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T, T>(url, config),

  post: <T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.post<T, T>(url, data, config),

  put: <T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.put<T, T>(url, data, config),

  patch: <T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T, T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T, T>(url, config),
};

export default apiClient;
