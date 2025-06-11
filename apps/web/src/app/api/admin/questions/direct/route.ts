import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import logger from '@/lib/utils/logger';

// Hàm kiểm tra xác thực admin
async function checkAdminAuth(request: NextRequest) {
  try {
    // Lấy token từ NextAuth
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    logger.debug("Thông tin token:", {
      hasToken: !!token,
      role: token?.role,
      isAdmin: token?.role === 'admin'
    });

    // Trong môi trường phát triển, cho phép truy cập mặc định
    if (process.env.NODE_ENV === 'development') {
      logger.debug("Môi trường phát triển: Bỏ qua kiểm tra quyền admin");
      return {
        authenticated: true,
        token: token || { role: 'admin', accessToken: 'dev-token' }
      };
    }

    // Kiểm tra quyền admin
    if (!token || token.role !== 'admin') {
      logger.warn("Từ chối quyền truy cập: Người dùng không phải admin");
      return {
        authenticated: false,
        message: 'Không có quyền truy cập',
        status: 403,
        token: null
      };
    }

    return {
      authenticated: true,
      token
    };
  } catch (error) {
    logger.error("Lỗi khi kiểm tra xác thực:", error);

    // Trong môi trường phát triển, cho phép truy cập mặc định khi có lỗi
    if (process.env.NODE_ENV === 'development') {
      logger.debug("Môi trường phát triển: Cho phép truy cập mặc định khi có lỗi");
      return {
        authenticated: true,
        token: { role: 'admin', accessToken: 'dev-token-fallback' }
      };
    }

    return {
      authenticated: false,
      message: 'Lỗi xác thực',
      status: 401,
      token: null
    };
  }
}

// Hàm xử lý POST request để lưu câu hỏi thông qua API
export async function POST(request: NextRequest) {
  try {
    logger.info("Đang xử lý yêu cầu lưu câu hỏi thông qua API...");

    // Kiểm tra xác thực
    const auth = await checkAdminAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        success: false,
        message: auth.message
      }, { status: auth.status });
    }

    // Lấy dữ liệu từ body request
    const questionData = await request.json();
    logger.debug("Đã nhận dữ liệu câu hỏi:", {
      hasContent: !!questionData.content,
      type: questionData.type,
      answerCount: questionData.answers?.length || 0
    });

    // Tạo ID duy nhất cho câu hỏi nếu chưa có
    if (!questionData.id) {
      questionData.id = new Date().getTime().toString();
    }

    // URL của API backend
    // Sử dụng URL tuyệt đối thay vì localhost để tránh lỗi kết nối từ Next.js server-side
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
    logger.debug("Gọi API tại:", apiUrl);

    try {
      // Chuyển đổi dữ liệu từ định dạng frontend sang định dạng backend
      // Đảm bảo type là một trong các giá trị hợp lệ (MC, TF, SA, ES, MA)
      let questionType = 'MC'; // Mặc định là MC

      // Chuyển đổi type từ frontend sang định dạng backend
      if (questionData.type) {
        if (['MC', 'TF', 'SA', 'ES', 'MA'].includes(questionData.type)) {
          // Nếu đã là định dạng hợp lệ, sử dụng luôn
          questionType = questionData.type;
        } else {
          // Chuyển đổi từ định dạng dài sang định dạng ngắn
          switch (questionData.type) {
            case 'multiple-choice':
              questionType = 'MC';
              break;
            case 'true-false':
              questionType = 'TF';
              break;
            case 'short-answer':
              questionType = 'SA';
              break;
            case 'matching':
              questionType = 'MA';
              break;
            case 'essay':
              questionType = 'ES';
              break;
            default:
              questionType = 'MC'; // Mặc định là MC
          }
        }
      }

      logger.debug("Loại câu hỏi đã chuyển đổi:", {
        originalType: questionData.type,
        convertedType: questionType
      });

      const question = {
        // Các trường bắt buộc
        content: questionData.content || questionData.raw_content || "Nội dung không xác định",
        rawContent: questionData.raw_content || questionData.content || "Nội dung không xác định",
        // Sử dụng ID của người dùng admin đã tạo
        creatorId: "3ffc378a-ab13-4060-b259-9b2483721f0f",
        // Sử dụng DRAFT làm trạng thái mặc định
        status: "DRAFT",
        // Thêm trường type với giá trị đã chuyển đổi
        type: questionType,

        // Các trường tùy chọn
        questionId: questionData.questionID?.fullId || `Q${questionData.id || new Date().getTime()}`,
        subcount: questionData.subcount?.fullId || null,
        source: questionData.source || null,
        solution: questionData.solution || null,

        // Các trường khác
        tags: questionData.tags || []
      };

      // Chuẩn bị dữ liệu câu hỏi để gửi đến API
      const cleanedQuestion = {
        content: question.content,
        rawContent: question.rawContent,
        creatorId: question.creatorId,
        status: question.status,
        type: question.type, // Thêm trường type
        questionId: question.questionId,
        subcount: question.subcount,
        source: question.source,
        solution: question.solution,
        tags: question.tags,
        // Thêm lại trường answers và correctAnswer từ form
        // Chuyển đổi mỗi đáp án thành đối tượng đầy đủ theo yêu cầu của DTO
        answers: (questionData.answers || [])
          .map((answer: any, index: number) => {
            // Nếu answer là mảng, bỏ qua
            if (Array.isArray(answer)) {
              return null;
            }

            // Nếu answer không phải là đối tượng, bỏ qua
            if (typeof answer !== 'object' || answer === null) {
              return null;
            }

            // Tạo đối tượng mới với đầy đủ các thuộc tính theo yêu cầu của DTO
            return {
              id: answer.id || index.toString(), // Đảm bảo có id
              content: answer.content || '',
              isCorrect: answer.isCorrect || false
            };
          })
          .filter((answer: any) => answer && answer.content && answer.content.trim() !== ''),
        // Đảm bảo correctAnswer luôn là một mảng
        correctAnswer: Array.isArray(questionData.correctAnswer)
          ? questionData.correctAnswer.filter((answer: string) => answer && answer.trim() !== '')
          : (questionData.correctAnswer && typeof questionData.correctAnswer === 'string' && questionData.correctAnswer.trim() !== '' ? [questionData.correctAnswer] : [])
      };

      // Log chi tiết về dữ liệu answers
      logger.debug("Dữ liệu answers trước khi gửi đến API:", {
        originalAnswers: questionData.answers,
        processedAnswers: cleanedQuestion.answers,
        isArray: Array.isArray(cleanedQuestion.answers),
        length: cleanedQuestion.answers?.length || 0,
        type: typeof cleanedQuestion.answers
      });

      logger.debug("Đang gọi API để lưu câu hỏi...", {
        type: cleanedQuestion.type,
        answersCount: cleanedQuestion.answers?.length || 0,
        correctAnswer: cleanedQuestion.correctAnswer,
        isCorrectAnswerArray: Array.isArray(cleanedQuestion.correctAnswer)
      });

      // Gọi API để lưu câu hỏi
      logger.debug("Gọi API với token:", auth.token?.accessToken || 'dev-token');

      // Trong môi trường phát triển, lấy token hợp lệ từ API backend
      let accessToken = auth.token?.accessToken || '';
      if (process.env.NODE_ENV === 'development') {
        logger.info("Môi trường phát triển: Lấy token hợp lệ từ API backend");

        try {
          // Lấy token từ API auth/login
          const loginResponse = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'nynus-boo@nynus.edu.vn',
              password: 'Abd8stbcs!'
            }),
            // Thêm các tùy chọn để tránh lỗi kết nối
            cache: 'no-store',
            next: { revalidate: 0 }
          });

          if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            accessToken = loginResult.accessToken;
            logger.info("Lấy token thành công:", typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'token không phải chuỗi');
          } else {
            logger.warn("Không thể lấy token từ API auth/login, sử dụng token mặc định");
            // Sử dụng token mặc định
            accessToken = 'dev-token';
          }
        } catch (loginError) {
          logger.error("Lỗi khi lấy token:", loginError);
          // Sử dụng token mặc định
          accessToken = 'dev-token';
        }
      }

      // Gọi API thực tế
      const response = await fetch(`${apiUrl}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cleanedQuestion),
        // Thêm các tùy chọn để tránh lỗi kết nối
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      // Xử lý trường hợp token hết hạn hoặc không hợp lệ
      if (response.status === 401) {
        logger.warn('API trả về lỗi xác thực 401');
        return NextResponse.json({
          success: false,
          message: 'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại'
        }, { status: 401 });
      }

      if (response.ok) {
        const result = await response.json();
        logger.info(`✅ Đã lưu câu hỏi thành công với ID: ${result.id || result._id || 'unknown'}`);

        return NextResponse.json({
          success: true,
          message: 'Lưu câu hỏi thành công',
          data: {
            question: result
          }
        });
      } else {
        const errorData = await response.json().catch(() => ({
          message: `Lỗi HTTP: ${response.status} ${response.statusText}`
        }));

        throw new Error(errorData.message || `Lỗi khi lưu câu hỏi: ${response.status}`);
      }
    } catch (apiError) {
      logger.error('Lỗi khi gọi API:', apiError);
      throw apiError;
    }
  } catch (error) {
    logger.error('❌ Lỗi khi lưu câu hỏi:', error);
    logger.error('Chi tiết lỗi:', error instanceof Error ? error.stack : 'Không có stack trace');

    return NextResponse.json({
      success: false,
      message: 'Lỗi khi lưu câu hỏi',
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    }, { status: 500 });
  }
}

// Hàm xử lý PUT request để cập nhật câu hỏi thông qua API
export async function PUT(request: NextRequest) {
  try {
    logger.info("Đang xử lý yêu cầu cập nhật câu hỏi thông qua API...");

    // Kiểm tra xác thực
    const auth = await checkAdminAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        success: false,
        message: auth.message
      }, { status: auth.status });
    }

    // Lấy dữ liệu từ body request
    const questionData = await request.json();
    logger.debug("Đã nhận dữ liệu câu hỏi cần cập nhật:", {
      hasContent: !!questionData.content,
      type: questionData.type,
      answerCount: questionData.answers?.length || 0
    });

    // Lấy ID câu hỏi từ URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const questionId = pathSegments[pathSegments.length - 1];

    if (!questionId) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu ID câu hỏi'
      }, { status: 400 });
    }

    // URL của API backend
    // Sử dụng URL tuyệt đối thay vì localhost để tránh lỗi kết nối từ Next.js server-side
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
    logger.debug("Gọi API tại:", apiUrl);

    try {
      // Chuyển đổi dữ liệu từ định dạng frontend sang định dạng backend
      // Đảm bảo type là một trong các giá trị hợp lệ (MC, TF, SA, ES, MA)
      let questionType = 'MC'; // Mặc định là MC

      // Chuyển đổi type từ frontend sang định dạng backend
      if (questionData.type) {
        if (['MC', 'TF', 'SA', 'ES', 'MA'].includes(questionData.type)) {
          // Nếu đã là định dạng hợp lệ, sử dụng luôn
          questionType = questionData.type;
        } else {
          // Chuyển đổi từ định dạng dài sang định dạng ngắn
          switch (questionData.type) {
            case 'multiple-choice':
              questionType = 'MC';
              break;
            case 'true-false':
              questionType = 'TF';
              break;
            case 'short-answer':
              questionType = 'SA';
              break;
            case 'matching':
              questionType = 'MA';
              break;
            case 'essay':
              questionType = 'ES';
              break;
            default:
              questionType = 'MC'; // Mặc định là MC
          }
        }
      }

      logger.debug("Loại câu hỏi đã chuyển đổi (PUT):", {
        originalType: questionData.type,
        convertedType: questionType
      });

      const question = {
        // Các trường bắt buộc
        content: questionData.content || questionData.raw_content || "Nội dung không xác định",
        rawContent: questionData.raw_content || questionData.content || "Nội dung không xác định",
        // Sử dụng ID của người dùng admin đã tạo
        creatorId: "3ffc378a-ab13-4060-b259-9b2483721f0f",
        // Sử dụng DRAFT làm trạng thái mặc định
        status: "DRAFT",
        // Thêm trường type với giá trị đã chuyển đổi
        type: questionType,

        // Các trường tùy chọn
        questionId: questionData.questionID?.fullId || `Q${questionData.id || questionId}`,
        subcount: questionData.subcount?.fullId || null,
        source: questionData.source || null,
        solution: questionData.solution || null,

        // Các trường khác
        tags: questionData.tags || []
      };

      // Chuẩn bị dữ liệu câu hỏi để gửi đến API
      const cleanedQuestion = {
        content: question.content,
        rawContent: question.rawContent,
        creatorId: question.creatorId,
        status: question.status,
        type: question.type, // Thêm trường type
        questionId: question.questionId,
        subcount: question.subcount,
        source: question.source,
        solution: question.solution,
        tags: question.tags,
        // Thêm lại trường answers và correctAnswer từ form
        // Chuyển đổi mỗi đáp án thành đối tượng đầy đủ theo yêu cầu của DTO
        answers: (questionData.answers || [])
          .map((answer: any, index: number) => {
            // Nếu answer là mảng, bỏ qua
            if (Array.isArray(answer)) {
              return null;
            }

            // Nếu answer không phải là đối tượng, bỏ qua
            if (typeof answer !== 'object' || answer === null) {
              return null;
            }

            // Tạo đối tượng mới với đầy đủ các thuộc tính theo yêu cầu của DTO
            return {
              id: answer.id || index.toString(), // Đảm bảo có id
              content: answer.content || '',
              isCorrect: answer.isCorrect || false
            };
          })
          .filter((answer: any) => answer && answer.content && answer.content.trim() !== ''),
        // Đảm bảo correctAnswer luôn là một mảng
        correctAnswer: Array.isArray(questionData.correctAnswer)
          ? questionData.correctAnswer.filter((answer: string) => answer && answer.trim() !== '')
          : (questionData.correctAnswer && typeof questionData.correctAnswer === 'string' && questionData.correctAnswer.trim() !== '' ? [questionData.correctAnswer] : [])
      };

      // Log chi tiết về dữ liệu answers
      logger.debug("Dữ liệu answers trước khi gửi đến API (PUT):", {
        originalAnswers: questionData.answers,
        processedAnswers: cleanedQuestion.answers,
        isArray: Array.isArray(cleanedQuestion.answers),
        length: cleanedQuestion.answers?.length || 0,
        type: typeof cleanedQuestion.answers
      });

      logger.debug("Đang gọi API để cập nhật câu hỏi...", {
        type: cleanedQuestion.type,
        answersCount: cleanedQuestion.answers?.length || 0,
        correctAnswer: cleanedQuestion.correctAnswer,
        isCorrectAnswerArray: Array.isArray(cleanedQuestion.correctAnswer)
      });

      // Trong môi trường phát triển, lấy token hợp lệ từ API backend
      let accessToken = auth.token?.accessToken || '';
      if (process.env.NODE_ENV === 'development') {
        logger.info("Môi trường phát triển: Lấy token hợp lệ từ API backend");

        try {
          // Lấy token từ API auth/login
          const loginResponse = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'nynus-boo@nynus.edu.vn',
              password: 'Abd8stbcs!'
            }),
            // Thêm các tùy chọn để tránh lỗi kết nối
            cache: 'no-store',
            next: { revalidate: 0 }
          });

          if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            accessToken = loginResult.accessToken;
            logger.info("Lấy token thành công:", typeof accessToken === 'string' ? accessToken.substring(0, 20) + '...' : 'token không phải chuỗi');
          } else {
            logger.warn("Không thể lấy token từ API auth/login, sử dụng token mặc định");
            // Sử dụng token mặc định
            accessToken = 'dev-token';
          }
        } catch (loginError) {
          logger.error("Lỗi khi lấy token:", loginError);
          // Sử dụng token mặc định
          accessToken = 'dev-token';
        }
      }

      // Gọi API thực tế
      const response = await fetch(`${apiUrl}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cleanedQuestion),
        // Thêm các tùy chọn để tránh lỗi kết nối
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      // Xử lý trường hợp token hết hạn hoặc không hợp lệ
      if (response.status === 401) {
        logger.warn('API trả về lỗi xác thực 401');
        return NextResponse.json({
          success: false,
          message: 'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại'
        }, { status: 401 });
      }

      if (response.ok) {
        const result = await response.json();
        logger.info(`✅ Đã cập nhật câu hỏi thành công với ID: ${result.id || result._id || 'unknown'}`);

        return NextResponse.json({
          success: true,
          message: 'Cập nhật câu hỏi thành công',
          data: {
            question: result
          }
        });
      } else {
        const errorData = await response.json().catch(() => ({
          message: `Lỗi HTTP: ${response.status} ${response.statusText}`
        }));

        throw new Error(errorData.message || `Lỗi khi cập nhật câu hỏi: ${response.status}`);
      }
    } catch (apiError) {
      logger.error('Lỗi khi gọi API:', apiError);
      throw apiError;
    }
  } catch (error) {
    logger.error('❌ Lỗi khi cập nhật câu hỏi:', error);
    logger.error('Chi tiết lỗi:', error instanceof Error ? error.stack : 'Không có stack trace');

    return NextResponse.json({
      success: false,
      message: 'Lỗi khi cập nhật câu hỏi',
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    }, { status: 500 });
  }
}