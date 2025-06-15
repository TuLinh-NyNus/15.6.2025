import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import logger from '@/lib/utils/logger';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Hàm xử lý GET request tới /api/admin/questions/get-subcount
export async function GET(request: NextRequest) {
  // Đảm bảo không cache kết quả
  const headers = new Headers();
  headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.append('Pragma', 'no-cache');
  headers.append('Expires', '0');
  headers.append('Surrogate-Control', 'no-store');

  try {
    // Lấy token từ NextAuth
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Kiểm tra quyền admin
    if (!token || token.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Không có quyền truy cập'
      }, {
        status: 403,
        headers
      });
    }

    // Lấy ID câu hỏi từ query params
    const url = new URL(request.url);
    const questionId = url.searchParams.get('id');

    if (!questionId) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu ID câu hỏi'
      }, {
        status: 400,
        headers
      });
    }

    logger.debug('Lấy subcount cho câu hỏi với ID:', questionId);

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Lấy token API từ cache, cookie hoặc API auth
    try {
      // Import hàm getApiToken
      const { getApiToken } = await import('@/lib/get-api-token');

      // Lấy token
      let accessToken = '';
      try {
        accessToken = await getApiToken(request.nextUrl.origin);
        logger.info('Đã lấy token thành công, độ dài:', accessToken.length);
      } catch (tokenError) {
        logger.error('Lỗi khi lấy token:', tokenError);

        // Nếu không lấy được token, trả về lỗi
        return NextResponse.json({
          success: false,
          message: 'Không thể lấy token xác thực'
        }, { status: 401, headers });
      }

      // Gọi đến API questions/{id} của backend với token
      const response = await fetch(`${apiUrl}/questions/${questionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      logger.debug('API response status:', response.status, response.statusText);

      // Nếu không thành công (401), thử lấy token mới và gọi lại API
      if (response.status === 401) {
        logger.warn('API trả về lỗi xác thực 401, thử lấy token mới và gọi lại API');

        try {
          // Import hàm getApiToken
          const { getApiToken } = await import('@/lib/get-api-token');

          // Xóa token cũ khỏi cache để buộc lấy token mới
          const TokenCache = (await import('@/lib/token-cache')).default;
          TokenCache.getInstance().clearToken();

          // Lấy token mới
          const newToken = await getApiToken(request.nextUrl.origin);
          logger.info('Đã lấy token mới thành công, độ dài:', newToken.length);

          // Gọi lại API với token mới
          const retryResponse = await fetch(`${apiUrl}/questions/${questionId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`,
              'Accept': 'application/json',
            },
            cache: 'no-store',
          });

          if (retryResponse.ok) {
            logger.info('Gọi lại API với token mới thành công');
            const retryData = await retryResponse.json();

            // Trả về kết quả với định dạng cấu trúc phù hợp cho frontend
            return NextResponse.json({
              success: true,
              subcount: retryData.subcount || null
            }, { headers });
          } else {
            logger.error('Gọi lại API với token mới vẫn thất bại:', retryResponse.status, retryResponse.statusText);
          }
        } catch (retryError) {
          logger.error('Lỗi khi thử lấy token mới và gọi lại API:', retryError);
        }

        // Nếu tất cả các cách thử đều thất bại, trả về lỗi xác thực
        return NextResponse.json({
          success: false,
          message: 'Lỗi xác thực khi kết nối đến API. Vui lòng đăng nhập lại.'
        }, { status: 401 });
      }

      // Lấy dữ liệu từ API
      const data = await response.json();

      // Logging thông tin dữ liệu để debug
      logger.debug('Phản hồi từ API:', {
        status: response.status,
        hasData: data ? 'yes' : 'no',
        subcount: data.subcount || 'không có subcount',
        rawData: JSON.stringify(data).substring(0, 200) // Log 200 ký tự đầu tiên của response
      });

      // Trả về kết quả với định dạng cấu trúc phù hợp cho frontend
      return NextResponse.json({
        success: true,
        subcount: data.subcount || null,
        message: 'Lấy subcount thành công',
        rawResponse: response.status
      }, { headers });
    } catch (fetchError) {
      logger.error('Lỗi khi gọi API:', fetchError);

      return NextResponse.json({
        success: false,
        message: 'Lỗi khi kết nối đến API',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu admin/questions/get-subcount:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi truy vấn dữ liệu câu hỏi'
    }, { status: 500 });
  }
}
