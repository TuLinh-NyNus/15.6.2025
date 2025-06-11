'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiToken } from '@/contexts/api-token-context';
import logger from '@/lib/utils/logger';

interface ApiClientOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  queryKey?: string[];
  enabled?: boolean;
}

/**
 * Hook để gọi API với React Query
 * Tự động xử lý token và cache
 */
export function useApiClient<T = any>({
  endpoint,
  method = 'GET',
  body,
  headers = {},
  skipAuth = false,
  queryKey,
  enabled = true
}: ApiClientOptions) {
  const { apiToken, refreshApiToken } = useApiToken();
  const queryClient = useQueryClient();
  
  // Tạo queryKey mặc định nếu không được cung cấp
  const defaultQueryKey = [endpoint, method];
  const finalQueryKey = queryKey || defaultQueryKey;
  
  // Hàm gọi API
  const fetchApi = async (): Promise<T> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;
      
      // Tạo headers
      const requestHeaders = new Headers(headers);
      
      // Thêm token xác thực nếu cần
      if (!skipAuth && apiToken) {
        requestHeaders.set('Authorization', `Bearer ${apiToken}`);
        logger.debug(`API Client: Gọi API với token: ${apiToken.substring(0, 20)}...`);
      }
      
      // Đảm bảo Content-Type là application/json nếu không được set
      if (!requestHeaders.has('Content-Type') && method !== 'GET' && body) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      
      // Tạo request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined
      };
      
      // Log request
      logger.debug(`API Client: ${method} ${url}`, { 
        headers: Object.fromEntries(requestHeaders.entries()),
        body: body
      });
      
      // Thực hiện request
      const response = await fetch(url, requestOptions);
      
      // Log response status
      logger.debug(`API Client: Response ${response.status} ${response.statusText}`);
      
      // Xử lý lỗi
      if (!response.ok) {
        // Xử lý lỗi 401 - Unauthorized
        if (response.status === 401) {
          logger.warn('API Client: API trả về lỗi 401 Unauthorized, thử làm mới token');
          
          // Thử làm mới token
          const newToken = await refreshApiToken();
          
          if (newToken) {
            // Thử lại request với token mới
            logger.info('API Client: Thử lại request với token mới');
            
            // Tạo headers mới với token mới
            const newHeaders = new Headers(headers);
            newHeaders.set('Authorization', `Bearer ${newToken}`);
            
            // Tạo request options mới
            const newRequestOptions: RequestInit = {
              method,
              headers: newHeaders,
              body: body ? JSON.stringify(body) : undefined
            };
            
            // Thực hiện request lại
            const newResponse = await fetch(url, newRequestOptions);
            
            if (newResponse.ok) {
              return await newResponse.json();
            }
            
            throw new Error(`API error: ${newResponse.status} ${newResponse.statusText}`);
          }
        }
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      logger.error(`API Client: Error calling ${endpoint}`, error);
      throw error;
    }
  };
  
  // Sử dụng useQuery cho các request GET
  if (method === 'GET') {
    return useQuery<T>({
      queryKey: finalQueryKey,
      queryFn: fetchApi,
      enabled: enabled && (skipAuth || !!apiToken)
    });
  }
  
  // Sử dụng useMutation cho các request khác
  return useMutation<T, Error, void>({
    mutationFn: fetchApi,
    onSuccess: (data) => {
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: [endpoint.split('?')[0]] });
    }
  });
}
