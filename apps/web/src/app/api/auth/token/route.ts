import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import logger from '@/lib/utils/logger';

/**
 * API route để lấy token mới từ API backend
 * @param request NextRequest
 * @returns NextResponse với token mới
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('API Token: Đang lấy token');

    // Lấy token từ cookie
    const cookieStore = cookies();
    const apiAuthToken = cookieStore.get('api_auth_token')?.value;

    // Nếu có token trong cookie, trả về token đó
    if (apiAuthToken) {
      logger.debug('API Token: Đã tìm thấy token trong cookie', {
        tokenLength: apiAuthToken.length
      });

      return NextResponse.json({
        success: true,
        accessToken: apiAuthToken,
        source: 'cookie'
      });
    }

    // Nếu không có token trong cookie, thử lấy từ NextAuth
    const nextAuthToken = await getToken({ req: request });

    if (nextAuthToken) {
      logger.debug('API Token: Đã tìm thấy token từ NextAuth', {
        tokenInfo: {
          sub: nextAuthToken.sub,
          role: nextAuthToken.role
        }
      });
    }

    // URL của API backend
    const apiUrl = process.env.API_URL || 'http://localhost:5000';

    try {
      // Lấy thông tin đăng nhập từ biến môi trường
      const adminEmail = process.env.ADMIN_EMAIL || 'nynus-boo@nynus.edu.vn';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Abd8stbcs!';

      logger.debug('Đang đăng nhập với email:', adminEmail);

      // Gọi API login để lấy token mới
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword
        }),
        // Thêm các tùy chọn để tránh lỗi kết nối
        cache: 'no-store',
      });

      if (!response.ok) {
        logger.warn('API trả về lỗi khi lấy token:', response.status, response.statusText);

        try {
          // Thử đọc thông tin lỗi chi tiết từ response
          const errorData = await response.json();
          logger.warn('Chi tiết lỗi từ API:', errorData);

          return NextResponse.json({
            success: false,
            message: 'Không thể lấy token từ API',
            error: errorData
          }, { status: response.status });
        } catch (parseError) {
          // Nếu không đọc được JSON, trả về thông báo lỗi chung
          logger.error('Không thể đọc chi tiết lỗi từ API:', parseError);

          return NextResponse.json({
            success: false,
            message: 'Không thể lấy token từ API',
            statusText: response.statusText
          }, { status: response.status });
        }
      }

      // Lấy dữ liệu từ API
      const data = await response.json();

      // Kiểm tra xem có accessToken không
      if (!data.accessToken) {
        logger.error('API trả về dữ liệu không có accessToken:', data);
        return NextResponse.json({
          success: false,
          message: 'API không trả về accessToken',
          data: data
        }, { status: 500 });
      }

      logger.info('API Token: Đã lấy token mới thành công', {
        tokenLength: data.accessToken.length,
        expiresIn: data.expiresIn
      });

      logger.debug('API Token: Token value (first 20 chars):', data.accessToken.substring(0, 20) + '...');

      // Log chi tiết về dữ liệu trả về từ API
      logger.debug('API Token: API response data structure:', Object.keys(data));
      if (data.user) {
        logger.debug('API Token: User info:', {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role
        });
      }

      // Tạo cookie để lưu token
      const apiResponse = NextResponse.json({
        success: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null,
        user: data.user || null
      });

      // Thêm cookie để lưu token (sẽ được sử dụng bởi client-side script)
      apiResponse.cookies.set('auth_token', data.accessToken, {
        httpOnly: false, // Cho phép JavaScript truy cập
        secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng HTTPS trong production
        maxAge: 60 * 15, // 15 phút
        path: '/',
        sameSite: 'lax',
      });

      // Thêm cookie thứ hai để lưu token (sẽ được sử dụng bởi API route)
      apiResponse.cookies.set('api_auth_token', data.accessToken, {
        httpOnly: true, // JavaScript không thể truy cập
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 phút
        path: '/',
        sameSite: 'lax',
      });

      if (data.refreshToken) {
        apiResponse.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true, // JavaScript không thể truy cập
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 ngày
          path: '/',
          sameSite: 'lax',
        });
      }

      logger.debug('API Token: Đã thiết lập cookie auth_token và api_auth_token');

      return apiResponse;
    } catch (fetchError) {
      logger.error('API Token: Lỗi khi gọi API lấy token:', fetchError);
      return NextResponse.json({
        success: false,
        message: 'Lỗi khi kết nối đến API',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('API Token: Lỗi khi xử lý yêu cầu lấy token:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi lấy token',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
