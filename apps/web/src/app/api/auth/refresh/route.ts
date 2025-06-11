import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import logger from '@/lib/utils/logger';

/**
 * API route để refresh token
 * @param request NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest) {
  try {
    // Lấy refresh token từ request body
    const body = await request.json();
    const { refreshToken } = body;
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token là bắt buộc' },
        { status: 400 }
      );
    }
    
    logger.info('API Refresh: Đang gọi API backend để refresh token');
    
    // Gọi API backend để refresh token
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    // Kiểm tra response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('API Refresh: Refresh token thất bại', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refresh token thất bại',
          error: errorData.message || response.statusText
        },
        { status: response.status }
      );
    }
    
    // Lấy dữ liệu từ response
    const data = await response.json();
    
    logger.info('API Refresh: Refresh token thành công', {
      tokenLength: data.accessToken?.length,
      expiresIn: data.expiresIn
    });
    
    // Lưu token mới vào cookie
    const cookieStore = cookies();
    
    cookieStore.set('api_auth_token', data.accessToken, {
      path: '/',
      maxAge: data.expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Trả về token mới cho client
    return NextResponse.json({
      success: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn
    });
  } catch (error) {
    logger.error('API Refresh: Lỗi khi xử lý refresh token', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server khi xử lý refresh token',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
