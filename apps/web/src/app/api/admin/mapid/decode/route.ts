import { NextRequest, NextResponse } from 'next/server';
import { decodeMapIDFromSample } from '@/lib/utils/mapid-decoder';

/**
 * API endpoint để giải mã MapID
 * @param request Request từ client
 * @returns Response chứa kết quả giải mã
 */
export async function GET(request: NextRequest) {
  try {
    // Lấy MapID từ query params
    const searchParams = request.nextUrl.searchParams;
    const mapId = searchParams.get('id');

    // Nếu không có MapID
    if (!mapId) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu tham số id',
        data: null
      }, { status: 400 });
    }

    // Giải mã MapID
    const result = decodeMapIDFromSample(mapId);

    // Nếu không giải mã được
    if (!result) {
      return NextResponse.json({
        success: false,
        message: 'Không thể giải mã MapID',
        data: null
      }, { status: 404 });
    }

    // Trả về kết quả
    return NextResponse.json({
      success: true,
      message: 'Giải mã MapID thành công',
      data: result
    }, { status: 200 });
  } catch (error) {
    console.error('Lỗi khi giải mã MapID:', error);

    return NextResponse.json({
      success: false,
      message: 'Lỗi khi giải mã MapID',
      data: null
    }, { status: 500 });
  }
}
