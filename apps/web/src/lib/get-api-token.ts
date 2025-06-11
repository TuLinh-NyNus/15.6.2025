import { cookies } from 'next/headers';
import TokenCache from './token-cache';
import logger from '@/lib/utils/logger';

/**
 * Hàm tiện ích để lấy token API
 * Thứ tự ưu tiên:
 * 1. Token từ cache (nếu còn hiệu lực)
 * 2. Token từ cookie api_auth_token (nếu có)
 * 3. Lấy token mới từ API auth
 *
 * @param origin URL gốc của ứng dụng (ví dụ: http://localhost:3000)
 * @returns Token API
 */
export async function getApiToken(origin: string): Promise<string> {
  const tokenCache = TokenCache.getInstance();

  // 1. Kiểm tra token trong cache
  const cachedToken = tokenCache.getToken();
  if (cachedToken) {
    logger.debug('Sử dụng token từ cache');
    return cachedToken;
  }

  // 2. Kiểm tra token trong cookie
  const cookieStore = cookies();
  const apiCookieToken = cookieStore.get('api_auth_token')?.value;

  if (apiCookieToken && apiCookieToken.length > 100) { // Kiểm tra độ dài cơ bản để đảm bảo đây là token JWT hợp lệ
    logger.debug('Sử dụng token từ cookie api_auth_token');

    // Lưu token vào cache
    tokenCache.setToken(apiCookieToken);

    return apiCookieToken;
  }

  // 3. Lấy token mới từ API auth
  logger.info('Lấy token mới từ API auth');

  try {
    // Thử đăng nhập trực tiếp để lấy token mới
    const loginResponse = await fetch(`${origin}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'nynus-boo@nynus.edu.vn',
        password: process.env.ADMIN_PASSWORD || 'Abd8stbcs!'
      }),
      cache: 'no-store',
      credentials: 'include',
    });

    if (!loginResponse.ok) {
      logger.error('Không thể đăng nhập để lấy token mới:', loginResponse.status, loginResponse.statusText);

      // Thử phương pháp thứ hai: lấy token từ API token
      const tokenResponse = await fetch(`${origin}/api/auth/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'include',
      });

      if (!tokenResponse.ok) {
        logger.error('Không thể lấy token mới:', tokenResponse.status, tokenResponse.statusText);
        throw new Error(`Không thể lấy token mới: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      if (!tokenData.accessToken) {
        logger.error('Không có accessToken trong phản hồi:', tokenData);
        throw new Error('Không nhận được token từ API');
      }

      // Lưu token vào cache
      tokenCache.setToken(tokenData.accessToken, tokenData.refreshToken, tokenData.expiresIn);

      logger.info('Đã lấy token mới thành công từ API token, độ dài:', tokenData.accessToken.length);

      return tokenData.accessToken;
    }

    // Xử lý phản hồi đăng nhập thành công
    const loginData = await loginResponse.json();

    if (!loginData.accessToken) {
      logger.error('Không có accessToken trong phản hồi đăng nhập:', loginData);
      throw new Error('Không nhận được token từ API đăng nhập');
    }

    // Lưu token vào cache
    tokenCache.setToken(loginData.accessToken, loginData.refreshToken, loginData.expiresIn);

    logger.info('Đã đăng nhập và lấy token mới thành công, độ dài:', loginData.accessToken.length);

    return loginData.accessToken;
  } catch (error) {
    logger.error('Lỗi khi lấy token mới:', error);
    throw error;
  }
}
