'use client';

import { getSession } from 'next-auth/react';

import type { Session } from 'next-auth';

import logger from '@/lib/utils/logger';

// Mở rộng Session type để thêm accessToken
interface CustomSession extends Session {
  accessToken?: string;
}

// Cache cho session để tránh gọi getSession() nhiều lần
let sessionCache: {
  session: CustomSession | null;
  timestamp: number;
} | null = null;

// Thời gian cache hết hạn (5 giây)
const SESSION_CACHE_EXPIRY = 5000; // ms

/**
 * Lấy session với caching để tránh gọi nhiều lần
 */
async function getCachedSession(): Promise<CustomSession | null> {
  // Nếu không ở môi trường browser, trả về null
  if (typeof window === 'undefined') {
    return null;
  }

  // Kiểm tra xem có cache và cache còn hạn không
  const now = Date.now();
  if (sessionCache && now - sessionCache.timestamp < SESSION_CACHE_EXPIRY) {
    logger.debug('Sử dụng session từ cache');
    return sessionCache.session;
  }

  try {
    // Không có cache hoặc cache hết hạn, lấy session mới
    logger.debug('Lấy session mới từ NextAuth');
    const session = await getSession() as CustomSession | null;

    // Lưu vào cache
    sessionCache = {
      session,
      timestamp: now
    };

    return session;
  } catch (error) {
    logger.error('Lỗi khi lấy session:', error);
    return null;
  }
}

/**
 * Utility function để thực hiện API call với token
 * Hỗ trợ cả trường hợp server-side và client-side
 * Sử dụng NextAuth session token để xác thực
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    let token = '';
    let redirectAttempted = false;

    // Kiểm tra xem có đang ở môi trường trình duyệt không
    if (typeof window !== 'undefined') {
      try {
        // Lấy session từ NextAuth với caching - ưu tiên sử dụng cách này
        const session = await getCachedSession();

        // Lấy token từ session nếu có
        if (session?.accessToken) {
          logger.debug('Sử dụng token từ NextAuth session');
          token = session.accessToken;
        }
        // Chỉ fallback về localStorage nếu chưa có NextAuth session
        else {
          logger.debug('Không có NextAuth session, fallback về localStorage');
          const localToken = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
          if (localToken) {
            token = localToken;
            logger.debug('Sử dụng token từ localStorage');
          } else {
            logger.debug('Không tìm thấy token nào');
          }
        }
      } catch (sessionError) {
        logger.error('Error getting session:', sessionError);
        // Fallback về localStorage nếu có lỗi
        const localToken = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
        if (localToken) {
          token = localToken;
          logger.debug('Sử dụng token từ localStorage sau lỗi session');
        }
      }
    }

    // Merge headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    // Thực hiện request
    const response = await fetch(url, {
      ...options,
      headers,
      // Thêm cache: 'no-store' để tránh cache trên trình duyệt
      cache: 'no-store',
    });

    // Nếu response status là 401 Unauthorized hoặc 403 Forbidden
    if ((response.status === 401 || response.status === 403) && !redirectAttempted) {
      logger.error('Lỗi xác thực:', response.status);
      redirectAttempted = true;

      // Nếu đang ở client-side, chỉ reset cache session mà không chuyển hướng
      if (typeof window !== 'undefined') {
        // Reset cache session để buộc lấy session mới ở lần sau
        sessionCache = null;

        // Lấy đường dẫn hiện tại
        const currentPath = window.location.pathname;

        // Xác định URL đăng nhập dựa vào đường dẫn hiện tại
        let loginUrl = '/auth/signin'; // Mặc định cho website chung

        // Nếu truy cập trang admin, chuyển về trang đăng nhập admin
        if (currentPath.includes('/3141592654') ||
            currentPath.includes('/admin')) {
          loginUrl = '/3141592654'; // Trang đăng nhập admin
        }

        // Tránh redirect loop - chỉ redirect nếu không đang ở trang đăng nhập
        if (currentPath !== loginUrl &&
            currentPath !== '/auth/signin' &&
            currentPath !== '/3141592654') {
          // Lưu URL hiện tại vào localStorage để redirect sau khi đăng nhập
          localStorage.setItem('redirectAfterLogin', currentPath);

          // Kiểm tra nếu không phải là API call (không bắt đầu bằng /api)
          if (!currentPath.startsWith('/api')) {
            // Nếu đường dẫn chứa 'inputques', không chuyển hướng
            if (currentPath.includes('inputques')) {
              logger.debug(`Không chuyển hướng từ trang ${currentPath} để tránh vòng lặp`);
            } else {
              logger.debug(`Chuyển hướng đến ${loginUrl} từ ${currentPath}`);
              window.location.href = loginUrl;
            }
          } else {
            logger.debug('Không chuyển hướng vì đây là API call');
          }
        } else {
          logger.debug('Không chuyển hướng vì đã ở trang đăng nhập');
        }
      }

      // Trả về response lỗi
      return response;
    }

    return response;
  } catch (error) {
    logger.error('API call error:', error);
    // Trả về lỗi để xử lý ở cấp cao hơn
    throw error;
  }
}