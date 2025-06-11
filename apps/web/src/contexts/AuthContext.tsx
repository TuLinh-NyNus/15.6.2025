import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import logger from '@/lib/utils/logger';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  apiToken: string | null;
  loading: boolean;
  refreshApiToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  apiToken: null,
  loading: true,
  refreshApiToken: async () => null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy token API từ backend
  const refreshApiToken = async (): Promise<string | null> => {
    try {
      logger.info('Đang lấy token mới từ API backend');
      
      // Lấy thông tin đăng nhập từ config
      const email = 'nynus-boo@nynus.edu.vn';
      const password = 'Abd8stbcs!';
      
      logger.debug(`Đang đăng nhập với email: ${email}`);
      
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
      
      logger.info(`Đã lấy token mới thành công, độ dài token: ${data.accessToken.length}`);
      logger.debug(`Token value (first 20 chars): ${data.accessToken.substring(0, 20)}...`);
      logger.debug(`API response data structure: ${Object.keys(data)}`);
      
      // Lưu token vào cookie
      Cookies.set('api_auth_token', data.accessToken, { 
        expires: data.expiresIn / 86400, // Chuyển đổi từ giây sang ngày
        path: '/' 
      });
      
      // Lưu refresh token vào localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      
      logger.debug('Đã thiết lập cookie auth_token và api_auth_token');
      
      // Cập nhật state
      setApiToken(data.accessToken);
      
      return data.accessToken;
    } catch (error) {
      logger.error('Lỗi khi lấy token API:', error);
      return null;
    }
  };

  // Khởi tạo: Lấy token từ cookie hoặc lấy mới
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Kiểm tra xem có token trong cookie không
        const cookieToken = Cookies.get('api_auth_token');
        
        if (cookieToken) {
          logger.debug('Đã tìm thấy token trong cookie');
          setApiToken(cookieToken);
        } else {
          // Nếu không có token trong cookie và đã đăng nhập, lấy token mới
          if (session) {
            await refreshApiToken();
          }
        }
      } catch (error) {
        logger.error('Lỗi khi khởi tạo auth context:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      initAuth();
    }
  }, [session, status]);

  // Giá trị context
  const value = {
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'admin',
    apiToken,
    loading: status === 'loading' || loading,
    refreshApiToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
