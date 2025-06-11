import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import logger from '@/lib/utils/logger';

/**
 * API route để đăng xuất
 * @param request NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest) {
  try {
    // Lấy token từ cookie
    const cookieStore = cookies();
    const apiAuthToken = cookieStore.get('api_auth_token')?.value;
    
    // Nếu có token, gọi API backend để đăng xuất
    if (apiAuthToken) {
      logger.info('API Logout: Đang gọi API backend để đăng xuất');
      
      const apiUrl = process.env.API_URL || 'http://localhost:5000';
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiAuthToken}`,
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        // Bỏ qua lỗi khi gọi API logout
        logger.warn('API Logout: Lỗi khi gọi API backend để đăng xuất', error);
      });
    }
    
    // Xóa cookie
    cookieStore.delete('api_auth_token');
    cookieStore.delete('auth_token');
    
    logger.info('API Logout: Đã xóa token khỏi cookie');
    
    // Trả về thành công
    return NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    logger.error('API Logout: Lỗi khi xử lý đăng xuất', error);
    
    // Vẫn xóa cookie ngay cả khi có lỗi
    const cookieStore = cookies();
    cookieStore.delete('api_auth_token');
    cookieStore.delete('auth_token');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Đăng xuất thành công mặc dù có lỗi',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}
