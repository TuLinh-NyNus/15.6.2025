import { logger } from '../logger';

interface TokenData {
  token: string;
  expiresAt: number;
}

/**
 * TokenCache service - Singleton pattern
 * Quản lý việc cache token để tránh gọi API xác thực nhiều lần
 */
export class TokenCache {
  private static instance: TokenCache;
  private cache: Map<string, TokenData> = new Map();
  
  private constructor() {
    logger.debug('TokenCache singleton đã được khởi tạo');
  }
  
  /**
   * Lấy instance của TokenCache (Singleton pattern)
   */
  public static getInstance(): TokenCache {
    if (!TokenCache.instance) {
      TokenCache.instance = new TokenCache();
    }
    return TokenCache.instance;
  }
  
  /**
   * Lấy token từ cache hoặc gọi hàm fetchFn để lấy token mới
   * @param key Khóa để lưu token trong cache
   * @param fetchFn Hàm để lấy token mới nếu không có trong cache hoặc đã hết hạn
   * @returns Promise<string> Token
   */
  async getToken(
    key: string, 
    fetchFn: () => Promise<{ token: string; expiresIn: number }>
  ): Promise<string> {
    const cached = this.cache.get(key);
    
    // Nếu có token trong cache và còn hạn
    if (cached && cached.expiresAt > Date.now()) {
      logger.debug(`Sử dụng token từ cache cho ${key}`, { 
        expiresIn: Math.floor((cached.expiresAt - Date.now()) / 1000) 
      });
      return cached.token;
    }
    
    // Nếu không có hoặc hết hạn, lấy token mới
    logger.info(`Lấy token mới cho ${key}`);
    try {
      const { token, expiresIn } = await fetchFn();
      
      // Cache token mới
      this.cache.set(key, {
        token,
        expiresAt: Date.now() + expiresIn * 1000 - 60000 // Trừ 1 phút để đảm bảo an toàn
      });
      
      logger.debug(`Token đã được cache cho ${key}`, { 
        expiresIn: expiresIn - 60 
      });
      
      return token;
    } catch (error) {
      logger.error(`Lỗi khi lấy token cho ${key}`, error);
      throw error;
    }
  }
  
  /**
   * Xóa token khỏi cache
   * @param key Khóa của token cần xóa
   */
  clearToken(key: string): void {
    this.cache.delete(key);
    logger.debug(`Đã xóa token cho ${key} khỏi cache`);
  }
  
  /**
   * Xóa tất cả token khỏi cache
   */
  clearAllTokens(): void {
    this.cache.clear();
    logger.debug('Đã xóa tất cả token khỏi cache');
  }
  
  /**
   * Kiểm tra xem token có trong cache không
   * @param key Khóa của token cần kiểm tra
   * @returns boolean
   */
  hasToken(key: string): boolean {
    const cached = this.cache.get(key);
    return !!(cached && cached.expiresAt > Date.now());
  }
}

// Export singleton instance
export const tokenCache = TokenCache.getInstance();
