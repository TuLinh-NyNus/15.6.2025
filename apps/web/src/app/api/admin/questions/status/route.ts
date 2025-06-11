import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import logger from '@/lib/utils/logger';

// Hàm xử lý GET request tới /api/admin/questions/status
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

    // Log thông tin token để debug
    logger.debug('Token info:', {
      hasToken: !!token,
      role: token?.role,
      hasAccessToken: !!token?.accessToken,
      accessTokenLength: token?.accessToken ? (token.accessToken as string).length : 0
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

    // Lấy URL hiện tại và query params
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Tạo URL params mới để gửi đến API backend
    const apiParams = new URLSearchParams();
    
    // Chuyển đổi các tham số từ frontend sang định dạng phù hợp cho backend
    
    // Xử lý tham số page và limit
    if (searchParams.has('page')) {
      apiParams.append('page', searchParams.get('page') || '1');
    }
    
    if (searchParams.has('limit')) {
      apiParams.append('limit', searchParams.get('limit') || '10');
    }
    
    // Xử lý tham số search
    if (searchParams.has('search')) {
      apiParams.append('search', searchParams.get('search') || '');
    }
    
    // Xử lý các tham số lọc theo MapID
    if (searchParams.has('gradeParam')) {
      const gradeParam = searchParams.get('gradeParam');
      if (gradeParam && gradeParam !== 'all') {
        apiParams.append('gradeParam', gradeParam.charAt(0));
      }
    }
    
    if (searchParams.has('subjectParam')) {
      const subjectParam = searchParams.get('subjectParam');
      if (subjectParam && subjectParam !== 'all') {
        apiParams.append('subjectParam', subjectParam.charAt(0));
      }
    }
    
    if (searchParams.has('chapterParam')) {
      const chapterParam = searchParams.get('chapterParam');
      if (chapterParam && chapterParam !== 'all') {
        apiParams.append('chapterParam', chapterParam.charAt(0));
      }
    }
    
    if (searchParams.has('levelParam')) {
      const levelParam = searchParams.get('levelParam');
      if (levelParam && levelParam !== 'all') {
        apiParams.append('levelParam', levelParam);
      }
    }
    
    if (searchParams.has('lessonParam')) {
      const lessonParam = searchParams.get('lessonParam');
      if (lessonParam && lessonParam !== 'all') {
        apiParams.append('lessonParam', lessonParam.charAt(0));
      }
    }
    
    if (searchParams.has('formParam')) {
      const formParam = searchParams.get('formParam');
      if (formParam && formParam !== 'all') {
        apiParams.append('formParam', formParam);
      }
    }
    
    // Xử lý tham số types
    if (searchParams.has('types')) {
      const types = searchParams.getAll('types');
      if (types && types.length > 0) {
        types.forEach(type => {
          apiParams.append('types', type);
        });
      }
    }
    
    // Xử lý tham số difficulties
    if (searchParams.has('difficulties')) {
      const difficulties = searchParams.getAll('difficulties');
      if (difficulties && difficulties.length > 0) {
        difficulties.forEach(difficulty => {
          apiParams.append('difficulties', difficulty);
        });
      }
    }
    
    // Log chi tiết các tham số lọc để debug
    logger.debug('Chi tiết các tham số lọc gửi đến API backend:', {
      gradeParam: apiParams.get('gradeParam'),
      subjectParam: apiParams.get('subjectParam'),
      chapterParam: apiParams.get('chapterParam'),
      levelParam: apiParams.get('levelParam'),
      lessonParam: apiParams.get('lessonParam'),
      formParam: apiParams.get('formParam'),
      types: apiParams.getAll('types'),
      difficulties: apiParams.getAll('difficulties'),
      allParams: Object.fromEntries(apiParams.entries())
    });

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu đến:', `${apiUrl}/questions-search/by-metadata?${apiParams.toString()}`);

    // Lấy token API từ cache, cookie hoặc API auth
    try {
      // Import hàm getApiToken
      const { getApiToken } = await import('@/lib/get-api-token');

      // Lấy token
      let accessToken = '';
      try {
        accessToken = await getApiToken(request.nextUrl.origin);
        logger.info('Đã lấy token thành công, độ dài:', accessToken.length);
        logger.debug('Token (first 20 chars):', accessToken.substring(0, 20) + '...');
      } catch (tokenError) {
        logger.error('Lỗi khi lấy token:', tokenError);

        // Nếu không lấy được token, trả về lỗi
        return NextResponse.json({
          success: false,
          message: 'Không thể lấy token xác thực'
        }, { status: 401, headers });
      }

      // Gọi đến API questions-search/by-metadata của backend với token
      logger.debug('Gọi API với Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`);

      const response = await fetch(`${apiUrl}/questions-search/by-metadata?${apiParams.toString()}`, {
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
          const retryResponse = await fetch(`${apiUrl}/questions-search/by-metadata?${apiParams.toString()}`, {
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
              items: retryData.questions || [],
              total: retryData.total || 0,
              page: retryData.page || 1,
              limit: retryData.limit || 10
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
        success: data.success,
        hasData: data.questions ? 'yes' : 'no',
        totalQuestions: data.questions?.length || 0,
        total: data.total || 0,
        // Thêm log cấu trúc dữ liệu
        dataStructure: Object.keys(data),
        // Log câu hỏi đầu tiên nếu có
        firstQuestion: data.questions?.length > 0 ?
          { id: data.questions[0]._id, content: data.questions[0].content && data.questions[0].content.substring(0, 100) } :
          'no questions'
      });

      // Trả về kết quả với định dạng cấu trúc phù hợp cho frontend
      return NextResponse.json({
        items: data.questions || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10
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
    logger.error('Lỗi khi xử lý yêu cầu admin/questions/status:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi truy vấn dữ liệu câu hỏi'
    }, { status: 500 });
  }
}
