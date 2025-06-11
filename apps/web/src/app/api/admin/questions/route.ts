import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import logger from '@/lib/utils/logger';

// Hàm xử lý GET request tới /api/admin/questions
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
    const queryParams = url.searchParams.toString();

    // Log chi tiết các tham số lọc để debug
    logger.debug('Chi tiết các tham số lọc:', {
      gradeParam: url.searchParams.get('gradeParam'),
      subjectParam: url.searchParams.get('subjectParam'),
      chapterParam: url.searchParams.get('chapterParam'),
      levelParam: url.searchParams.get('levelParam'),
      lessonParam: url.searchParams.get('lessonParam'),
      formParam: url.searchParams.get('formParam'),
      usageCount: url.searchParams.get('usageCount'),
      allParams: Object.fromEntries(url.searchParams.entries())
    });

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu đến:', `${apiUrl}/questions?${queryParams}`);

    // Trong môi trường phát triển, lấy dữ liệu từ API backend
    logger.info('Lấy dữ liệu từ API backend');

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

      // Gọi đến API questions của backend với token
      logger.debug('Gọi API với Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`);

      const response = await fetch(`${apiUrl}/questions?${queryParams}`, {
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
          const retryResponse = await fetch(`${apiUrl}/questions?${queryParams}`, {
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
            if (retryData.data && retryData.data.questions) {
              return NextResponse.json({
                questions: retryData.data.questions,
                total: retryData.data.total || 0,
                totalPages: retryData.data.totalPages || Math.ceil((retryData.data.total || 0) / 10)
              }, { headers });
            }

            // Trả về kết quả gốc nếu không có cấu trúc dữ liệu phù hợp
            return NextResponse.json(retryData, { headers });
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
        hasData: data.data ? 'yes' : 'no',
        totalQuestions: data.data?.questions?.length || 0,
        total: data.data?.total || 0,
        // Thêm log cấu trúc dữ liệu
        dataStructure: Object.keys(data),
        dataDataStructure: data.data ? Object.keys(data.data) : 'no data.data',
        // Log câu hỏi đầu tiên nếu có
        firstQuestion: data.data?.questions?.length > 0 ?
          { id: data.data.questions[0]._id, content: data.data.questions[0].content && data.data.questions[0].content.substring(0, 100) } :
          'no questions'
      });

      // Trả về kết quả với định dạng cấu trúc phù hợp cho frontend
      if (data.data && data.data.questions) {
        return NextResponse.json({
          questions: data.data.questions,
          total: data.data.total || 0,
          totalPages: data.data.totalPages || Math.ceil((data.data.total || 0) / 10)
        }, { headers });
      }

      // Trả về kết quả gốc nếu không có cấu trúc dữ liệu phù hợp
      return NextResponse.json(data, { headers });
    } catch (fetchError) {
      logger.error('Lỗi khi gọi API:', fetchError);

      return NextResponse.json({
        success: false,
        message: 'Lỗi khi kết nối đến API',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu admin/questions:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi truy vấn dữ liệu câu hỏi'
    }, { status: 500 });
  }
}

// Hàm trợ giúp để lấy câu hỏi từ API
// Lưu ý: Hàm này đã bị loại bỏ vì dự án hiện tại sử dụng PostgreSQL với Prisma, không sử dụng MongoDB

// Hàm xử lý DELETE request tới /api/admin/questions/:id
export async function DELETE(request: NextRequest) {
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
      }, { status: 403 });
    }

    // Lấy id câu hỏi từ URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const questionId = pathSegments[pathSegments.length - 1];

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu DELETE đến:', `${apiUrl}/questions/${questionId}`);

    // Lấy token API từ cache, cookie hoặc API auth
    logger.info('Lấy token API...');

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
      }, { status: 401 });
    }

    // Gọi đến API questions của backend với token mới
    const response = await fetch(`${apiUrl}/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Nếu không thành công (401), trả về lỗi xác thực
    if (response.status === 401) {
      logger.warn('API trả về lỗi xác thực 401 mặc dù đã sử dụng token mới');
      return NextResponse.json({
        success: false,
        message: 'Lỗi xác thực khi kết nối đến API. Vui lòng đăng nhập lại.'
      }, { status: 401 });
    }

    // Lấy dữ liệu từ API
    const data = await response.json();

    // Trả về kết quả
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu DELETE admin/questions:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi xóa câu hỏi'
    }, { status: 500 });
  }
}

// Hàm xử lý POST request tới /api/admin/questions
export async function POST(request: NextRequest) {
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
      }, { status: 403 });
    }

    // Lấy dữ liệu từ body request
    const body = await request.json();

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu POST đến:', `${apiUrl}/questions`);

    // Lấy token API từ cache, cookie hoặc API auth
    logger.info('Lấy token API...');

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
      }, { status: 401 });
    }

    // Gọi đến API questions của backend với token mới
    const response = await fetch(`${apiUrl}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    // Nếu không thành công (401), trả về lỗi xác thực
    if (response.status === 401) {
      logger.warn('API trả về lỗi xác thực 401 mặc dù đã sử dụng token mới');
      return NextResponse.json({
        success: false,
        message: 'Lỗi xác thực khi kết nối đến API. Vui lòng đăng nhập lại.'
      }, { status: 401 });
    }

    // Lấy dữ liệu từ API
    const data = await response.json();

    // Trả về kết quả
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu POST admin/questions:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi tạo câu hỏi mới'
    }, { status: 500 });
  }
}