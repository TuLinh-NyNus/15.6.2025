import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import logger from '@/lib/utils/logger';

/**
 * API route để đăng nhập và lấy token
 * @param request NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest) {
  try {
    // Lấy thông tin đăng nhập từ request body
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }
    
    logger.info('API Login: Đang gọi API backend để đăng nhập', { email });
    
    // Gọi API backend để đăng nhập
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    // Kiểm tra response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('API Login: Đăng nhập thất bại', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Đăng nhập thất bại',
          error: errorData.message || response.statusText
        },
        { status: response.status }
      );
    }
    
    // Lấy dữ liệu từ response
    const data = await response.json();
    
    logger.info('API Login: Đăng nhập thành công', {
      tokenLength: data.accessToken?.length,
      expiresIn: data.expiresIn
    });
    
    // Lưu token vào cookie
    const cookieStore = cookies();
    
    cookieStore.set('api_auth_token', data.accessToken, {
      path: '/',
      maxAge: data.expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Trả về token cho client
    return NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn
    });
  } catch (error) {
    logger.error('API Login: Lỗi khi xử lý đăng nhập', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server khi xử lý đăng nhập',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
