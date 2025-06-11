import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import logger from '@/lib/utils/logger';

// Hàm xử lý GET request tới /api/questions/[subcount]
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

    // Log thông tin token để debug
    logger.debug('Token info:', {
      hasToken: !!token,
      role: token?.role,
      hasAccessToken: !!token?.accessToken,
      accessTokenLength: token?.accessToken ? (token.accessToken as string).length : 0
    });

    // Lấy subcount từ params
    const { subcount } = params;
    if (!subcount) {
      return NextResponse.json({
        success: false,
        message: 'Thiếu tham số subcount'
      }, {
        status: 400,
        headers
      });
    }

    // URL của API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    logger.debug('Chuyển tiếp yêu cầu đến:', `${apiUrl}/questions/by-subcount/${subcount}`);

    // Trả về dữ liệu mẫu thay vì gọi API
    logger.info('Trả về dữ liệu mẫu cho subcount:', subcount);

    // Trích xuất QuestionID từ subcount
    // Ví dụ: TL.107707 -> Tìm trong nội dung rawContent để lấy QuestionID

    // Tạo dữ liệu mẫu để test
    const mockData = {
      success: true,
      item: {
        _id: '60f1e5b3e6b3f3a3e8c0e1a1',
        id: '60f1e5b3e6b3f3a3e8c0e1a1',
        subcount: subcount,
        questionId: '0P0H2-C', // Lấy trực tiếp từ pattern %[0P0H2-C] trong rawContent
        type: 'MC', // Loại câu hỏi: Trắc nghiệm (Multiple Choice)
        rawContent: `\\begin{ex}%[Nguồn: GKI THPT Hoằng Hóa 2 - Thanh Hóa - 19]%[0P0H2-C]
[TL.107707]
	Từ một hộp chứa $10$ quả cầu màu đỏ và $5$ quả cầu màu xanh, lấy ngẫu nhiên một quả cầu rồi	lấy tiếp một quả cầu nữa. Xác suất để lần thứ hai lấy được quả cầu màu xanh bằng
	\\choice
	{\\True $\\dfrac{1}{3}$}
	{$\\dfrac{2}{3}$}
	{$\\dfrac{10}{21}$}
	{$\\dfrac{2}{21}$}
	\\loigiai{Không gian mẫu của việc lấy hai quả cầu liên tiếp là $|\\Omega|=\\mathrm{A}_{15}^2$.\\\\
		Gọi $A$ là biến cố "lần thứ hai lấy được quả màu xanh''. Ta xét hai trường hợp như sau
		\\begin{itemize}
			\\item \\textbf{TH1:} lần đầu màu đỏ, lần sau màu xanh, ta có $10\\times5$ cách lấy như vậy.
			\\item \\textbf{TH2:} cả hai lần đều lấy được màu xanh, ta có $5\\times4$ cách lấy như vậy.
		\\end{itemize}
		Vậy không gian của biến cố $A$ là $\\left|\\Omega_A\\right|=10\\times5+5\\times4=70$.\\\\
		Suy ra xác suất của biến cố $A$ là $\\mathrm{P}(A)=\\dfrac{\\left|\\Omega_A\\right|}{|\\Omega|}=\\dfrac{70}{\\mathrm{A}_{15}^2}=\\dfrac{1}{3}$.
	}
\\end{ex}`,
        content: 'Từ một hộp chứa 10 quả cầu màu đỏ và 5 quả cầu màu xanh, lấy ngẫu nhiên một quả cầu rồi lấy tiếp một quả cầu nữa. Xác suất để lần thứ hai lấy được quả cầu màu xanh bằng',
        answers: [
          { id: '1', content: '$\\dfrac{1}{3}$', isCorrect: true },
          { id: '2', content: '$\\dfrac{2}{3}$', isCorrect: false },
          { id: '3', content: '$\\dfrac{10}{21}$', isCorrect: false },
          { id: '4', content: '$\\dfrac{2}{21}$', isCorrect: false }
        ],
        correctAnswer: ['1'],
        solution: 'Không gian mẫu của việc lấy hai quả cầu liên tiếp là $|\\Omega|=\\mathrm{A}_{15}^2$.\nGọi $A$ là biến cố "lần thứ hai lấy được quả màu xanh". Ta xét hai trường hợp như sau:\n- TH1: lần đầu màu đỏ, lần sau màu xanh, ta có $10\\times5$ cách lấy như vậy.\n- TH2: cả hai lần đều lấy được màu xanh, ta có $5\\times4$ cách lấy như vậy.\nVậy không gian của biến cố $A$ là $|\\Omega_A|=10\\times5+5\\times4=70$.\nSuy ra xác suất của biến cố $A$ là $\\mathrm{P}(A)=\\dfrac{|\\Omega_A|}{|\\Omega|}=\\dfrac{70}{\\mathrm{A}_{15}^2}=\\dfrac{1}{3}$.',
        images: [],
        tags: ['Xác suất', 'Xác suất có điều kiện', 'Lấy mẫu không hoàn lại'],
        usageCount: 3,
        creator: 'admin',
        status: 'PUBLISHED',
        examRefs: ['GKI THPT Hoằng Hóa 2 - Thanh Hóa - 19'],
        feedback: {},
        source: 'GKI THPT Hoằng Hóa 2 - Thanh Hóa - 19',
        questionID: {
          grade: { value: '0', description: 'Tất cả các lớp' },
          subject: { value: 'P', description: '11-NGÂN HÀNG CHÍNH' },
          chapter: { value: '0', description: 'Xác suất' },
          level: { value: 'H', description: 'Thông hiểu' },
          lesson: { value: '2', description: 'Xác suất của biến cố' },
          form: { value: 'C', description: 'Liên quan đến viên bi' },
          fullId: '0P0H2-C'
        }
      }
    };

    // Log dữ liệu mẫu để debug
    logger.debug('Dữ liệu mẫu được trả về:', {
      subcount: subcount,
      hasRawContent: !!mockData.item.raw_content,
      questionID: mockData.item.questionID ? Object.keys(mockData.item.questionID) : []
    });

    // Trả về dữ liệu mẫu
    return NextResponse.json(mockData, { headers });

  } catch (error) {
    logger.error('Lỗi khi xử lý yêu cầu questions/[subcount]:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi khi truy vấn dữ liệu câu hỏi'
    }, { status: 500 });
  }
}
