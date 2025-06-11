import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import logger from '@/lib/utils/logger';
import { extractFromLatex } from '@/lib/utils/latex-parser';

/**
 * Xử lý POST request để trích xuất dữ liệu từ nội dung LaTeX
 * @param request Request từ client
 * @returns Response với dữ liệu trích xuất
 */
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

    // Lấy dữ liệu từ request body
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu nội dung LaTeX'
      }, { status: 400 });
    }

    // Trích xuất dữ liệu từ nội dung LaTeX
    logger.info('Trích xuất dữ liệu từ nội dung LaTeX');
    let extractedData;
    try {
      // Kiểm tra nội dung LaTeX có hợp lệ không
      if (!content.includes('\\begin{ex}') || !content.includes('\\end{ex}')) {
        logger.warn('Nội dung LaTeX không chứa môi trường ex');
        return NextResponse.json({
          success: false,
          message: 'Nội dung LaTeX không hợp lệ: Không tìm thấy môi trường \\begin{ex}...\\end{ex}'
        }, { status: 400 });
      }

      extractedData = extractFromLatex(content);
    } catch (error) {
      logger.error('Lỗi khi trích xuất dữ liệu:', error);
      return NextResponse.json({
        success: false,
        message: error instanceof Error ? error.message : 'Không thể trích xuất dữ liệu từ nội dung LaTeX'
      }, { status: 400 });
    }

    if (!extractedData) {
      return NextResponse.json({
        success: false,
        message: 'Không thể trích xuất dữ liệu từ nội dung LaTeX'
      }, { status: 400 });
    }

    // Chuẩn bị dữ liệu để trả về
    const questionData = {
      rawContent: content,
      questionId: extractedData.questionId,
      type: extractedData.type,
      source: extractedData.source,
      subcount: extractedData.subcount?.fullId,
      content: extractedData.content,
      answers: extractedData.answers,
      correctAnswer: extractedData.correctAnswer,
      solution: extractedData.solution,
      solutions: extractedData.solutions,
      questionID: extractedData.questionIdDetails
    };

    // Trả về kết quả thành công
    logger.info('Trích xuất dữ liệu thành công');
    return NextResponse.json({
      success: true,
      message: 'Trích xuất dữ liệu thành công',
      data: questionData
    });

  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu trích xuất dữ liệu:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi trích xuất dữ liệu'
    }, { status: 500 });
  }
}
