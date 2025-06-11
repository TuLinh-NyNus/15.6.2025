/**
 * Module đơn giản để cache token API
 * Giúp giảm số lượng request lấy token không cần thiết
 */
import logger from '@/lib/utils/logger';

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Thời điểm hết hạn (timestamp)
}

class TokenCache {
  private static instance: TokenCache;
  private tokenData: TokenData | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 phút (mặc định)

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): TokenCache {
    if (!TokenCache.instance) {
      TokenCache.instance = new TokenCache();
    }
    return TokenCache.instance;
  }

  /**
   * Lưu token vào cache
   * @param accessToken Token truy cập
   * @param refreshToken Token làm mới (nếu có)
   * @param expiresIn Thời gian hết hạn (giây)
   */
  public setToken(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    // Tính thời điểm hết hạn
    const expiresAt = Date.now() + (expiresIn ? expiresIn * 1000 : this.CACHE_DURATION);

    this.tokenData = {
      accessToken,
      refreshToken,
      expiresAt
    };

    logger.debug(`[TokenCache] Token đã được cache, hết hạn sau ${Math.round((expiresAt - Date.now()) / 1000)} giây`);
  }

  /**
   * Lấy token từ cache
   * @returns Token nếu còn hiệu lực, null nếu không có hoặc đã hết hạn
   */
  public getToken(): string | null {
    if (!this.tokenData) {
      logger.debug('[TokenCache] Không có token trong cache');
      return null;
    }

    // Kiểm tra token có còn hiệu lực không
    if (Date.now() >= this.tokenData.expiresAt) {
      logger.debug('[TokenCache] Token đã hết hạn');
      this.tokenData = null;
      return null;
    }

    logger.debug(`[TokenCache] Sử dụng token từ cache, còn ${Math.round((this.tokenData.expiresAt - Date.now()) / 1000)} giây`);
    return this.tokenData.accessToken;
  }

  /**
   * Xóa token khỏi cache
   */
  public clearToken(): void {
    this.tokenData = null;
    logger.debug('[TokenCache] Token đã bị xóa khỏi cache');
  }

  /**
   * Kiểm tra token có tồn tại và còn hiệu lực không
   */
  public hasValidToken(): boolean {
    return !!this.getToken();
  }
}

export default TokenCache;
