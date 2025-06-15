import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import logger from '@/lib/utils/logger';

// Hàm xử lý GET request tới /api/admin/questions/[subcount]
export async function GET(
  request: NextRequest,
  { params }: { params: { subcount: string } }
) {
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

    // Lấy subcount từ params
    const { subcount } = params;
    if (!subcount) {
      return NextResponse.json({
        success: false,
        message: 'Subcount không hợp lệ'
      }, {
        status: 400,
        headers
      });
    }

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu đến:', `${apiUrl}/questions/${subcount}`);

    // Kiểm tra xem có token trong query parameter không
    const url = new URL(request.url);
    const tokenFromQuery = url.searchParams.get('token');

    // Kiểm tra xem có token trong cookie không
    const cookieToken = request.cookies.get('auth_token')?.value;
    const apiCookieToken = request.cookies.get('api_auth_token')?.value;

    // Lấy token từ query parameter, cookie hoặc từ NextAuth
    let accessToken = tokenFromQuery || apiCookieToken || cookieToken || (typeof token.accessToken === 'string' ? token.accessToken : '') || '';

    logger.debug('Token info:', {
      hasToken: !!token,
      hasTokenFromQuery: !!tokenFromQuery,
      hasCookieToken: !!cookieToken,
      hasApiCookieToken: !!apiCookieToken,
      hasAccessToken: !!accessToken,
      accessTokenLength: typeof accessToken === 'string' ? accessToken.length : 0,
      tokenFirstChars: typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'N/A',
      tokenSource: tokenFromQuery
        ? 'query'
        : (apiCookieToken
          ? 'api_cookie'
          : (cookieToken
            ? 'cookie'
            : (token.accessToken ? 'nextauth' : 'none')))
    });

    // Lấy token API từ cache, cookie hoặc API auth
    logger.info('Lấy token API...');

    // Import hàm getApiToken
    const { getApiToken } = await import('@/lib/get-api-token');

    try {
      // Lấy token mới từ cache, cookie hoặc API auth
      accessToken = await getApiToken(request.nextUrl.origin);
      logger.info('Đã lấy token thành công, độ dài:', typeof accessToken === 'string' ? accessToken.length : 0);
      logger.debug('Token (first 20 chars):', typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'N/A');
    } catch (tokenError) {
      logger.error('Lỗi khi lấy token:', tokenError);

      // Nếu không lấy được token mới và không có token hiện tại, trả về lỗi
      if (!accessToken) {
        return NextResponse.json({
          success: false,
          message: 'Không thể lấy token xác thực',
          error: tokenError instanceof Error ? tokenError.message : 'Unknown error'
        }, {
          status: 401,
          headers
        });
      }

      // Nếu có token hiện tại, tiếp tục sử dụng
      logger.warn('Sử dụng token hiện tại do không lấy được token mới');
    }

    // Kiểm tra lại token sau khi lấy mới
    if (!accessToken) {
      logger.error('Không có token để gọi API');
      return NextResponse.json({
        success: false,
        message: 'Không có token để xác thực'
      }, {
        status: 401,
        headers
      });
    }

    logger.debug('Gọi API với token, độ dài:', typeof accessToken === 'string' ? accessToken.length : 0);
    logger.debug('Authorization header:', `Bearer ${typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'N/A'}`);

    const response = await fetch(`${apiUrl}/questions/${subcount}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    logger.debug('API response status:', response.status, response.statusText);

    // Nếu không thành công (401), trả về lỗi
    if (response.status === 401) {
      logger.warn('API trả về lỗi xác thực 401 ngay cả sau khi đã lấy token mới');

      try {
        const errorText = await response.text();
        logger.warn('Chi tiết lỗi 401:', errorText);
      } catch (e) {
        logger.error('Không thể đọc chi tiết lỗi 401:', e);
      }

      return NextResponse.json({
        success: false,
        message: 'Lỗi xác thực khi gọi API',
        status: response.status,
        statusText: response.statusText
      }, {
        status: 401,
        headers
      });
    }

    // Lấy dữ liệu từ API
    let data;
    try {
      const responseText = await response.text();
      logger.debug('Phản hồi từ API (text):', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));

      if (!responseText.trim()) {
        logger.warn('Phản hồi từ API rỗng');
        data = { success: false, message: 'Phản hồi từ API rỗng' };
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          logger.error('Lỗi khi parse JSON:', jsonError);
          return NextResponse.json({
            success: false,
            message: 'Lỗi khi xử lý phản hồi từ API',
            error: responseText
          }, {
            status: 500,
            headers
          });
        }
      }
    } catch (textError) {
      logger.error('Lỗi khi đọc phản hồi text:', textError);
      return NextResponse.json({
        success: false,
        message: 'Lỗi khi đọc phản hồi từ API'
      }, {
        status: 500,
        headers
      });
    }

    // Logging thông tin dữ liệu để debug
    logger.debug('Phản hồi từ API (parsed):', {
      status: response.status,
      success: data?.success,
      hasData: data?.data ? 'yes' : 'no',
      dataStructure: data ? Object.keys(data) : 'không có dữ liệu',
    });

    // Trả về kết quả
    return NextResponse.json(data, { headers });
  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu admin/questions/[subcount]:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi truy vấn thông tin câu hỏi'
    }, {
      status: 500,
      headers
    });
  }
}

// Hàm xử lý PUT request tới /api/admin/questions/[subcount]
export async function PUT(
  request: NextRequest,
  { params }: { params: { subcount: string } }
) {
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

    // Lấy subcount từ params
    const { subcount } = params;
    if (!subcount) {
      return NextResponse.json({
        success: false,
        message: 'Subcount không hợp lệ'
      }, {
        status: 400,
        headers
      });
    }

    // Lấy dữ liệu từ body request
    const body = await request.json();

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu PUT đến:', `${apiUrl}/questions/${subcount}`);

    // Kiểm tra xem có token trong query parameter không
    const url = new URL(request.url);
    const tokenFromQuery = url.searchParams.get('token');

    // Kiểm tra xem có token trong cookie không
    const cookieToken = request.cookies.get('auth_token')?.value;
    const apiCookieToken = request.cookies.get('api_auth_token')?.value;

    // Lấy token từ query parameter, cookie hoặc từ NextAuth
    let accessToken = tokenFromQuery || apiCookieToken || cookieToken || (typeof token.accessToken === 'string' ? token.accessToken : '') || '';

    logger.debug('Token info (PUT):', {
      hasToken: !!token,
      hasTokenFromQuery: !!tokenFromQuery,
      hasCookieToken: !!cookieToken,
      hasApiCookieToken: !!apiCookieToken,
      hasAccessToken: !!accessToken,
      accessTokenLength: typeof accessToken === 'string' ? accessToken.length : 0,
      tokenFirstChars: typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'N/A',
      tokenSource: tokenFromQuery
        ? 'query'
        : (apiCookieToken
          ? 'api_cookie'
          : (cookieToken
            ? 'cookie'
            : (token.accessToken ? 'nextauth' : 'none')))
    });

    // Lấy token API từ cache, cookie hoặc API auth
    logger.info('Lấy token API (PUT)...');

    // Import hàm getApiToken
    const { getApiToken } = await import('@/lib/get-api-token');

    try {
      // Lấy token mới từ cache, cookie hoặc API auth
      accessToken = await getApiToken(request.nextUrl.origin);
      logger.info('Đã lấy token thành công (PUT), độ dài:', typeof accessToken === 'string' ? accessToken.length : 0);
      logger.debug('Token (PUT) (first 20 chars):', typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'N/A');
    } catch (tokenError) {
      logger.error('Lỗi khi lấy token (PUT):', tokenError);

      // Nếu không lấy được token mới và không có token hiện tại, trả về lỗi
      if (!accessToken) {
        return NextResponse.json({
          success: false,
          message: 'Không thể lấy token xác thực',
          error: tokenError instanceof Error ? tokenError.message : 'Unknown error'
        }, {
          status: 401,
          headers
        });
      }

      // Nếu có token hiện tại, tiếp tục sử dụng
      logger.warn('Sử dụng token hiện tại do không lấy được token mới (PUT)');
    }

    // Kiểm tra lại token sau khi lấy mới
    if (!accessToken) {
      logger.error('Không có token để gọi API PUT');
      return NextResponse.json({
        success: false,
        message: 'Không có token để xác thực'
      }, {
        status: 401,
        headers
      });
    }

    logger.debug('Gọi API PUT với token, độ dài:', typeof accessToken === 'string' ? accessToken.length : 0);
    logger.debug('Authorization header (PUT):', `Bearer ${typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'N/A'}`);

    try {
      // Log dữ liệu gửi đi
      logger.debug('Dữ liệu gửi đi (body):', JSON.stringify(body).substring(0, 200) + '...');

      // Gọi đến API questions của backend với token
      logger.debug('Bắt đầu gọi API backend PUT:', `${apiUrl}/questions/${subcount}`);

      const response = await fetch(`${apiUrl}/questions/${subcount}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      logger.debug('Đã nhận phản hồi từ API backend PUT:', response.status, response.statusText);

      // Nếu không thành công (401), trả về lỗi
      if (response.status === 401) {
        logger.warn('API trả về lỗi xác thực 401 ngay cả sau khi đã lấy token mới (PUT)');

        try {
          const errorText = await response.text();
          logger.warn('Chi tiết lỗi 401 (PUT):', errorText);
        } catch (e) {
          logger.error('Không thể đọc chi tiết lỗi 401 (PUT):', e);
        }

        return NextResponse.json({
          success: false,
          message: 'Lỗi xác thực khi gọi API PUT',
          status: response.status,
          statusText: response.statusText
        }, {
          status: 401,
          headers
        });
      }

      // Lấy dữ liệu từ API
      const data = await response.json();
      return NextResponse.json(data, { headers });
    } catch (apiError) {
      // Nếu không thể kết nối đến API backend, trả về lỗi
      logger.error('Không thể kết nối đến API backend:', apiError);
      logger.error('Chi tiết lỗi khi gọi API backend:', {
        message: apiError instanceof Error ? apiError.message : 'Unknown error',
        stack: apiError instanceof Error ? apiError.stack : 'No stack trace',
        name: apiError instanceof Error ? apiError.name : 'Unknown error type'
      });

      // Trả về lỗi để frontend biết rằng cập nhật không thành công
      return NextResponse.json({
        success: false,
        message: 'Không thể kết nối đến API backend để cập nhật câu hỏi',
        error: apiError instanceof Error ? apiError.message : 'Unknown error'
      }, {
        status: 503, // Service Unavailable
        headers
      });
    }
  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu PUT admin/questions/[subcount]:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin câu hỏi'
    }, {
      status: 500,
      headers
    });
  }
}

// Hàm xử lý DELETE request tới /api/admin/questions/[subcount]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { subcount: string } }
) {
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

    // Lấy subcount từ params
    const { subcount } = params;
    logger.debug('Xóa câu hỏi với ID/subcount:', subcount);

    // Kiểm tra ID
    if (!subcount || subcount === 'undefined' || subcount === 'null' || subcount === 'unknown') {
      logger.error('ID/subcount câu hỏi không hợp lệ:', subcount);
      return NextResponse.json({
        success: false,
        message: 'ID câu hỏi không hợp lệ'
      }, {
        status: 400,
        headers
      });
    }

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu DELETE đến:', `${apiUrl}/questions/${subcount}`);

    // Lấy token API từ cache, cookie hoặc API auth
    logger.info('Lấy token API...');

    // Import hàm getApiToken
    const { getApiToken } = await import('@/lib/get-api-token');

    // Lấy token
    let accessToken = '';
    try {
      accessToken = await getApiToken(request.nextUrl.origin);
      logger.info('Đã lấy token thành công, độ dài:', typeof accessToken === 'string' ? accessToken.length : 0);
    } catch (tokenError) {
      logger.error('Lỗi khi lấy token:', tokenError);

      // Nếu không lấy được token, trả về lỗi
      return NextResponse.json({
        success: false,
        message: 'Không thể lấy token xác thực'
      }, {
        status: 401,
        headers
      });
    }

    // Lấy dữ liệu từ body request nếu có
    let body = {};
    try {
      body = await request.json();
      logger.debug('Body request:', body);
    } catch (error) {
      logger.debug('Không có body request hoặc không phải JSON');
    }

    // Gọi đến API questions của backend với token
    const response = await fetch(`${apiUrl}/questions/${subcount}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    // Xử lý trường hợp token hết hạn hoặc không hợp lệ
    if (response.status === 401) {
      logger.warn('API trả về lỗi xác thực 401');

      // Thử lấy token mới
      try {
        // Xóa token cũ khỏi cache để buộc lấy token mới
        const TokenCache = (await import('@/lib/token-cache')).default;
        TokenCache.getInstance().clearToken();

        // Lấy token mới
        const newToken = await getApiToken(request.nextUrl.origin);
        logger.info('Đã lấy token mới thành công, độ dài:', typeof newToken === 'string' ? newToken.length : 0);

        // Gọi lại API với token mới
        const retryResponse = await fetch(`${apiUrl}/questions/${subcount}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
          body: JSON.stringify(body),
        });

        // Xử lý kết quả từ API
        const retryData = await retryResponse.json().catch(() => ({}));

        // Trả về kết quả
        return NextResponse.json({
          success: retryResponse.ok,
          message: retryData.message || (retryResponse.ok ? 'Đã xóa câu hỏi thành công' : 'Không thể xóa câu hỏi'),
          data: retryData.data || null
        }, {
          status: retryResponse.status,
          headers
        });
      } catch (retryError) {
        logger.error('Lỗi khi thử lại với token mới:', retryError);

        return NextResponse.json({
          success: false,
          message: 'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại'
        }, {
          status: 401,
          headers
        });
      }
    }

    // Xử lý kết quả từ API
    const data = await response.json().catch(() => ({}));

    // Trả về kết quả
    return NextResponse.json({
      success: response.ok,
      message: data.message || (response.ok ? 'Đã xóa câu hỏi thành công' : 'Không thể xóa câu hỏi'),
      data: data.data || null
    }, {
      status: response.status,
      headers
    });
  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu DELETE:', error);

    return NextResponse.json({
      success: false,
      message: 'Lỗi khi xử lý yêu cầu'
    }, {
      status: 500,
      headers
    });
  }
}