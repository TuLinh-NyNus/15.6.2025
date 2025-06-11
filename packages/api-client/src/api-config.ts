import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  enableCache?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface TokenData {
  token: string;
  refreshToken?: string;
}

export class ApiClient {
  private axios: AxiosInstance;
  private baseConfig: ApiClientConfig;
  private cache: Map<string, CacheItem<unknown>>;

  constructor(config: ApiClientConfig) {
    this.baseConfig = config;
    this.cache = new Map();
    
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      },
      withCredentials: config.withCredentials !== undefined ? config.withCredentials : true
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const tokenData = localStorage.getItem('auth_token');
        
        if (tokenData) {
          try {
            const parsedData = JSON.parse(tokenData) as unknown;
            if (
              parsedData && 
              typeof parsedData === 'object' && 
              'token' in parsedData && 
              typeof parsedData.token === 'string' && 
              config.headers
            ) {
              config.headers.Authorization = `Bearer ${(parsedData as TokenData).token}`;
            }
          } catch (e) {
            console.error('Error parsing token data:', e);
          }
        }
        
        return config;
      },
      (error: unknown) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: unknown) => {
        const axiosError = error as AxiosError;
        
        // Handle 401 Unauthorized - refresh token if possible
        if (axiosError.response?.status === 401) {
          try {
            // Attempt to refresh the token
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const tokenRefreshInstance = axios.create();
              const response = await tokenRefreshInstance.post<{token: string}>(`${this.baseConfig.baseURL}/api/auth/refresh`, {
                refreshToken
              });
              
              const { token } = response.data;
              localStorage.setItem('authToken', token);
              
              // Retry the original request with the new token
              if (axiosError.config && axiosError.config.headers) {
                axiosError.config.headers['Authorization'] = `Bearer ${token}`;
              }
              return this.axios(axiosError.config);
            }
          } catch (refreshError) {
            // If refresh fails, redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/auth/login';
            }
          }
        }
        
        return Promise.reject(axiosError);
      }
    );
  }

  // Cache management methods
  private getCacheKey(config: AxiosRequestConfig): string {
    const { url, method, params, data } = config;
    return `${method || 'GET'}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`;
  }

  private getFromCache<T>(cacheKey: string): T | null {
    const cachedItem = this.cache.get(cacheKey) as CacheItem<T> | undefined;
    
    if (!cachedItem) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() > cachedItem.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cachedItem.data;
  }

  private saveToCache<T>(cacheKey: string, data: T): void {
    const now = Date.now();
    const ttl = this.baseConfig.cacheTTL || 5 * 60 * 1000; // Default: 5 minutes
    
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public clearCacheItem(url: string, method = 'GET', params?: unknown): void {
    const safeParams = params as Record<string, unknown> | undefined;
    const cacheKey = this.getCacheKey({ url, method, params: safeParams });
    this.cache.delete(cacheKey);
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      // Only use cache for GET requests if enabled
      if (this.baseConfig.enableCache && (config.method === 'GET' || !config.method)) {
        const cacheKey = this.getCacheKey(config);
        const cachedData = this.getFromCache<T>(cacheKey);
        
        if (cachedData) {
          return cachedData;
        }
        
        const response = await this.axios.request<T>(config);
        this.saveToCache(cacheKey, response.data);
        return response.data;
      }
      
      const response = await this.axios.request<T>(config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // GET request
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST request
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT request
  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // PATCH request
  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  // DELETE request
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  private transformParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!params) return undefined;
    
    // Create a shallow copy to prevent mutation of the original object
    return { ...params };
  }

  private handleError(error: unknown): never {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // The request was made and the server responded with an error status
      const status = axiosError.response.status;
      const data = axiosError.response.data as Record<string, unknown>;
      
      // Format error message based on response
      let message = 'An error occurred';
      
      if (data.message) {
        if (Array.isArray(data.message)) {
          message = (data.message as string[]).join(', ');
        } else if (typeof data.message === 'string') {
          message = data.message;
        } else {
          message = String(data.message);
        }
      }
        
      throw new Error(`API Error (${status}): ${message}`);
    } else if (axiosError.request) {
      // The request was made but no response was received
      throw new Error('No response received from server. Please check your connection.');
    } else {
      // Safe access to message property
      const errorMessage = axiosError && typeof axiosError === 'object' && 'message' in axiosError 
        ? String(axiosError.message) 
        : 'Unknown error occurred';
      
      throw new Error(`Request Error: ${errorMessage}`);
    }
  }
}

// Create default API client instance
const apiConfig: ApiClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
  enableCache: true,
  cacheTTL: 5 * 60 * 1000 // 5 minutes
};

export const apiClient = new ApiClient(apiConfig); 