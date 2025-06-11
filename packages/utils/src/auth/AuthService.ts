import { logger } from '../logger';
import { tokenCache } from './TokenCache';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * AuthService - Singleton pattern
 * Quản lý xác thực và token trong ứng dụng
 */
export class AuthService {
  private static instance: AuthService;
  private apiUrl: string;
  
  private constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:5000';
    logger.debug('AuthService singleton đã được khởi tạo', { apiUrl: this.apiUrl });
  }
  
  /**
   * Lấy instance của AuthService (Singleton pattern)
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Lấy token xác thực
   * @returns Promise<string> Access token
   */
  async getToken(): Promise<string> {
    return tokenCache.getToken('api_auth_token', async () => {
      // Kiểm tra xem có refresh token không
      const refreshToken = this.getRefreshTokenFromStorage();
      
      if (refreshToken) {
        try {
          // Thử refresh token
          logger.debug('Thử refresh token');
          const tokens = await this.refreshToken(refreshToken);
          return {
            token: tokens.accessToken,
            expiresIn: tokens.expiresIn
          };
        } catch (error) {
          logger.warn('Refresh token thất bại, sẽ đăng nhập lại', error);
          // Nếu refresh thất bại, xóa token và đăng nhập lại
          this.clearTokens();
        }
      }
      
      // Đăng nhập mới
      logger.info('Đăng nhập để lấy token mới');
      const tokens = await this.login();
      return {
        token: tokens.accessToken,
        expiresIn: tokens.expiresIn
      };
    });
  }
  
  /**
   * Đăng nhập để lấy token mới
   * @returns Promise<AuthTokens>
   */
  private async login(): Promise<AuthTokens> {
    try {
      // Lấy thông tin đăng nhập từ storage hoặc config
      const email = 'nynus-boo@nynus.edu.vn'; // Thay bằng cách lấy từ config
      const password = 'Abd8stbcs!'; // Thay bằng cách lấy từ config
      
      logger.debug(`Đang đăng nhập với email: ${email}`);
      
      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error(`Đăng nhập thất bại: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Lưu refresh token vào storage
      this.saveRefreshTokenToStorage(data.refreshToken);
      
      logger.info('Đăng nhập thành công');
      return data;
    } catch (error) {
      logger.error('Lỗi khi đăng nhập', error);
      throw error;
    }
  }
  
  /**
   * Refresh token
   * @param refreshToken Refresh token
   * @returns Promise<AuthTokens>
   */
  private async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error(`Refresh token thất bại: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Lưu refresh token mới vào storage
      this.saveRefreshTokenToStorage(data.refreshToken);
      
      logger.debug('Refresh token thành công');
      return data;
    } catch (error) {
      logger.error('Lỗi khi refresh token', error);
      throw error;
    }
  }
  
  /**
   * Lưu refresh token vào storage
   * @param refreshToken Refresh token
   */
  private saveRefreshTokenToStorage(refreshToken: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('refresh_token', refreshToken);
      } else if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('refresh_token', refreshToken);
      }
      // Nếu không có localStorage hoặc sessionStorage, có thể lưu vào cookie
    } catch (error) {
      logger.warn('Không thể lưu refresh token vào storage', error);
    }
  }
  
  /**
   * Lấy refresh token từ storage
   * @returns string | null
   */
  private getRefreshTokenFromStorage(): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('refresh_token');
      } else if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem('refresh_token');
      }
      return null;
    } catch (error) {
      logger.warn('Không thể lấy refresh token từ storage', error);
      return null;
    }
  }
  
  /**
   * Xóa tất cả token
   */
  clearTokens(): void {
    tokenCache.clearToken('api_auth_token');
    
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('refresh_token');
      } else if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('refresh_token');
      }
    } catch (error) {
      logger.warn('Không thể xóa refresh token từ storage', error);
    }
    
    logger.debug('Đã xóa tất cả token');
  }
  
  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      // Gọi API đăng xuất nếu cần
      const token = await this.getToken();
      
      await fetch(`${this.apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Xóa tất cả token
      this.clearTokens();
      
      logger.info('Đã đăng xuất thành công');
    } catch (error) {
      logger.error('Lỗi khi đăng xuất', error);
      // Vẫn xóa token ngay cả khi API thất bại
      this.clearTokens();
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
