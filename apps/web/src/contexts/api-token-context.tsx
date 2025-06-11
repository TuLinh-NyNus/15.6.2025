'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import logger from '@/lib/utils/logger';
import { useToast } from '@/components/ui/use-toast';

interface ApiTokenContextType {
  apiToken: string | null;
  isLoading: boolean;
  refreshApiToken: () => Promise<string | null>;
}

// Tạo context cho API Token
const ApiTokenContext = createContext<ApiTokenContextType | null>(null);

/**
 * Provider cho API Token
 * Quản lý việc lấy, lưu trữ và làm mới token API
 */
export function ApiTokenProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Hàm lấy token API từ backend
  const refreshApiToken = async (): Promise<string | null> => {
    try {
      logger.info('ApiTokenContext: Đang lấy token mới từ API backend');
      
      // Lấy thông tin đăng nhập từ config
      const email = 'nynus-boo@nynus.edu.vn';
      const password = 'Abd8stbcs!';
      
      logger.debug(`ApiTokenContext: Đang đăng nhập với email: ${email}`);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error(`Đăng nhập thất bại: ${response.status}`);
      }
      
      const data = await response.json();
      
      logger.info(`ApiTokenContext: Đã lấy token mới thành công, độ dài token: ${data.accessToken.length}`);
      logger.debug(`ApiTokenContext: Token value (first 20 chars): ${data.accessToken.substring(0, 20)}...`);
      
      // Lưu token vào cookie
      Cookies.set('api_auth_token', data.accessToken, { 
        expires: data.expiresIn / 86400, // Chuyển đổi từ giây sang ngày
        path: '/' 
      });
      
      // Lưu refresh token vào localStorage
      if (typeof window !== 'undefined' && data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      
      // Cập nhật state
      setApiToken(data.accessToken);
      
      return data.accessToken;
    } catch (error) {
      logger.error('ApiTokenContext: Lỗi khi lấy token API:', error);
      
      toast({
        title: "Lỗi xác thực",
        description: "Không thể lấy token xác thực. Vui lòng đăng nhập lại.",
        variant: "destructive",
        duration: 5000,
      });
      
      return null;
    }
  };

  // Khởi tạo: Lấy token từ cookie hoặc lấy mới
  useEffect(() => {
    const initToken = async () => {
      try {
        // Kiểm tra xem có token trong cookie không
        const cookieToken = Cookies.get('api_auth_token');
        
        if (cookieToken) {
          logger.debug('ApiTokenContext: Đã tìm thấy token trong cookie');
          setApiToken(cookieToken);
        } else {
          // Nếu không có token trong cookie và đã đăng nhập, lấy token mới
          if (session) {
            await refreshApiToken();
          }
        }
      } catch (error) {
        logger.error('ApiTokenContext: Lỗi khi khởi tạo token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status !== 'loading') {
      initToken();
    }
  }, [session, status]);

  // Thiết lập interval để làm mới token định kỳ (mỗi 10 phút)
  useEffect(() => {
    if (!apiToken) return;
    
    const intervalId = setInterval(() => {
      logger.debug('ApiTokenContext: Đang làm mới token tự động...');
      refreshApiToken().then(token => {
        if (token) {
          logger.info('ApiTokenContext: Token đã được làm mới tự động thành công');
        } else {
          logger.warn('ApiTokenContext: Không thể làm mới token tự động');
        }
      });
    }, 10 * 60 * 1000); // 10 phút
    
    return () => clearInterval(intervalId);
  }, [apiToken]);

  // Giá trị context
  const value = {
    apiToken,
    isLoading: status === 'loading' || isLoading,
    refreshApiToken
  };

  return <ApiTokenContext.Provider value={value}>{children}</ApiTokenContext.Provider>;
}

/**
 * Hook để sử dụng API Token
 * @returns ApiTokenContextType
 */
export function useApiToken() {
  const context = useContext(ApiTokenContext);
  if (!context) {
    throw new Error('useApiToken must be used within an ApiTokenProvider');
  }
  return context;
}
