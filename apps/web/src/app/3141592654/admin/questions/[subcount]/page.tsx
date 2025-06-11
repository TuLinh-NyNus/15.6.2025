'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  Copy,
  Pencil,
  X,
  Save,
  Loader2,
  Code,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { QuestionIDMeaning } from '@/components/questions/QuestionIDMeaning';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
// Sử dụng dynamic import để tránh lỗi module not found
import dynamic from 'next/dynamic';
const LaTeXRenderer = dynamic(() => import('@/components/latex/LaTeXRenderer'), {
  ssr: false,
  loading: () => <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
    <p className="text-yellow-500 font-medium mb-2">Đang tải component...</p>
  </div>
});

interface QuestionDetailPageProps {
  params: {
    subcount: string;
  };
}

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [question, setQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'latex' | 'rendered'>('latex');

  // Lấy thông tin câu hỏi từ API
  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Gọi API để lấy thông tin chi tiết câu hỏi theo subcount
        const response = await fetch(`/api/admin/questions/by-subcount/${params.subcount}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Không thể tải câu hỏi: ${errorData.message || 'Lỗi không xác định'}`);
        }

        const result = await response.json();
        console.log('Dữ liệu câu hỏi đã tải:', result);

        if (!result.data?.question) {
          throw new Error('Không tìm thấy dữ liệu câu hỏi');
        }

        setQuestion(result.data.question);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin câu hỏi:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin câu hỏi');
        toast({
          title: 'Lỗi',
          description: err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thông tin câu hỏi',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionDetail();
  }, [params.subcount, toast]);

  // Hàm chuyển đổi kiểu câu hỏi sang tiếng Việt
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MC':
        return 'Trắc nghiệm';
      case 'TF':
        return 'Đúng/Sai';
      case 'SA':
        return 'Tự luận ngắn';
      case 'ES':
        return 'Tự luận dài';
      case 'MA':
        return 'Ghép đôi';
      default:
        return type;
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Render loading skeleton
  const renderSkeletonLoading = () => {
    return (
      <div className="space-y-6">
        {/* Skeleton cho nội dung gốc */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 bg-slate-700" />
            <Skeleton className="h-32 w-full bg-slate-700" />
          </div>
        </Card>

        {/* Skeleton cho thông tin câu hỏi */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 bg-slate-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full bg-slate-700" />
              <Skeleton className="h-24 w-full bg-slate-700" />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render error message
  const renderError = () => {
    const isNotFoundError = error?.includes('Không tìm thấy câu hỏi');

    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-white">
          <AlertTitle>{isNotFoundError ? 'Không tìm thấy câu hỏi' : 'Lỗi'}</AlertTitle>
          <AlertDescription>
            {error || 'Đã xảy ra lỗi khi tải thông tin câu hỏi'}
          </AlertDescription>
        </Alert>

        {isNotFoundError && (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 border border-slate-700 rounded-md">
            <p className="text-slate-300 mb-4">
              Câu hỏi với mã "{params.subcount}" không tồn tại trong hệ thống.
            </p>
            <Button
              variant="default"
              onClick={() => router.push('/3141592654/admin/questions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách câu hỏi
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Xử lý chỉnh sửa câu hỏi
  const handleEditQuestion = () => {
    setIsEditing(true);
    setEditedContent(question?.rawContent || '');
  };

  // Xử lý hủy chỉnh sửa
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  // Xử lý lưu dữ liệu
  const handleSaveQuestion = async () => {
    if (!editedContent.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Nội dung không được để trống',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Trích xuất dữ liệu từ nội dung LaTeX
      console.log('Trích xuất dữ liệu từ nội dung LaTeX');
      const extractedData = await extractQuestionData(editedContent);
      console.log('Dữ liệu trích xuất:', extractedData);

      // Chuẩn bị dữ liệu để lưu
      // Đảm bảo giữ lại ID và các trường quan trọng khác
      const updatedQuestion = {
        ...question,
        id: question.id,
        rawContent: editedContent,
        ...extractedData
      };

      // Log dữ liệu để debug
      console.log('Dữ liệu câu hỏi cần cập nhật:', {
        id: updatedQuestion.id,
        questionId: updatedQuestion.questionId,
        subcount: updatedQuestion.subcount,
        type: updatedQuestion.type,
        source: updatedQuestion.source,
        content: updatedQuestion.content?.substring(0, 50) + '...',
        hasAnswers: !!updatedQuestion.answers,
        hasCorrectAnswer: !!updatedQuestion.correctAnswer,
        hasSolution: !!updatedQuestion.solution
      });

      // Log chi tiết về nguồn
      console.log('Chi tiết về nguồn:', {
        source: updatedQuestion.source,
        sourceType: typeof updatedQuestion.source,
        sourceNull: updatedQuestion.source === null,
        sourceUndefined: updatedQuestion.source === undefined,
        sourceEmpty: updatedQuestion.source === '',
      });

      // Gọi API để cập nhật câu hỏi
      console.log('Cập nhật câu hỏi với ID:', question.id);

      // Kiểm tra và log dữ liệu trước khi gửi để xác nhận định dạng
      console.log('correctAnswer type:', Array.isArray(updatedQuestion.correctAnswer) ? 'array' : typeof updatedQuestion.correctAnswer);
      console.log('correctAnswer value:', updatedQuestion.correctAnswer);

      // Đảm bảo correctAnswer luôn là mảng trước khi gửi
      if (updatedQuestion.correctAnswer && !Array.isArray(updatedQuestion.correctAnswer)) {
        updatedQuestion.correctAnswer = [updatedQuestion.correctAnswer];
        console.log('correctAnswer đã được chuyển đổi thành mảng');
      }

      console.log('Dữ liệu cập nhật:', JSON.stringify(updatedQuestion, null, 2));

      const response = await fetch(`/api/admin/questions/${params.subcount}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestion),
      });

      if (!response.ok) {
        console.error('Lỗi khi cập nhật câu hỏi:', response.status, response.statusText);
        let errorMessage = 'Lỗi không xác định';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Lỗi không xác định';
          console.error('Chi tiết lỗi:', errorData);
        } catch (e) {
          console.error('Không thể parse lỗi JSON:', e);
        }
        throw new Error(`Không thể cập nhật câu hỏi: ${errorMessage}`);
      }

      // Cập nhật state với dữ liệu mới
      setQuestion(updatedQuestion);
      setIsEditing(false);

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được cập nhật thành công',
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật câu hỏi:', err);
      toast({
        title: 'Lỗi',
        description: err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Hàm trích xuất dữ liệu từ nội dung LaTeX
  const extractQuestionData = async (content: string) => {
    try {
      console.log('Bắt đầu trích xuất dữ liệu từ nội dung LaTeX');
      console.log('Kiểm tra nội dung LaTeX:', content.substring(0, 100) + '...');

      // Kiểm tra nội dung LaTeX có hợp lệ không
      if (!content.includes('\\begin{ex}') || !content.includes('\\end{ex}')) {
        console.warn('Nội dung LaTeX không chứa môi trường ex');
        toast({
          title: 'Cảnh báo',
          description: 'Nội dung LaTeX không hợp lệ: Không tìm thấy môi trường \\begin{ex}...\\end{ex}',
          variant: 'warning',
        });
        return { rawContent: content };
      }

      // Trích xuất nguồn từ nội dung LaTeX
      let source = null;

      // Pattern: %[Nguồn: text]
      const sourceMatch = content.match(/%\s*\[\s*Nguồn:?\s*([^\]]*)\s*\]/i);
      if (sourceMatch && sourceMatch[1]) {
        source = sourceMatch[1].trim();
        console.log('Nguồn được trích xuất từ regex:', source);
      }

      console.log('Nguồn được trích xuất cuối cùng:', source);

      // Sử dụng hàm extractFromLatex để trích xuất dữ liệu trực tiếp
      const { extractFromLatex } = await import('@/lib/utils/latex-parser');

      try {
        // Trích xuất dữ liệu từ nội dung LaTeX
        const extractedData = extractFromLatex(content);
        console.log('Dữ liệu trích xuất thành công:', extractedData);

        // Log chi tiết về nguồn từ dữ liệu trích xuất
        console.log('Chi tiết về nguồn từ dữ liệu trích xuất:', {
          source: extractedData.source,
          sourceType: typeof extractedData.source,
          sourceNull: extractedData.source === null,
          sourceUndefined: extractedData.source === undefined,
          sourceEmpty: extractedData.source === '',
          rawContent: extractedData.rawContent.substring(0, 100) + '...',
          manuallyExtractedSource: source
        });

        // Chuyển đổi dữ liệu trích xuất thành định dạng phù hợp để lưu vào database
        return {
          rawContent: content,
          questionId: extractedData.questionId || null,
          subcount: extractedData.subcount?.fullId || null,
          type: extractedData.type === 'multiple-choice' ? 'MC' :
                extractedData.type === 'true-false' ? 'TF' :
                extractedData.type === 'short-answer' ? 'SA' :
                extractedData.type === 'matching' ? 'MA' :
                extractedData.type === 'essay' ? 'ES' :
                extractedData.type,
          // Ưu tiên nguồn từ extractedData, nếu không có thì dùng nguồn trích xuất thủ công
          source: extractedData.source || source || null,
          content: extractedData.content || null,
          answers: extractedData.answers || null,
          // Đảm bảo correctAnswer luôn là mảng
          correctAnswer: Array.isArray(extractedData.correctAnswer)
            ? extractedData.correctAnswer
            : extractedData.correctAnswer ? [extractedData.correctAnswer] : [],
          solution: extractedData.solution || null,
          solutions: extractedData.solutions || null
        };
      } catch (extractError) {
        console.error('Lỗi khi trích xuất dữ liệu từ nội dung LaTeX:', extractError);

        // Nếu trích xuất trực tiếp thất bại, thử gọi API
        console.log('Thử gọi API để trích xuất dữ liệu...');
        const response = await fetch('/api/admin/questions/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API trả về lỗi:', response.status, errorData);
          throw new Error(errorData.message || 'Không thể trích xuất dữ liệu từ nội dung LaTeX');
        }

        const data = await response.json();
        console.log('Dữ liệu trích xuất từ API thành công:', data);

        // Đảm bảo correctAnswer luôn là mảng
        if (data.data && data.data.correctAnswer) {
          data.data.correctAnswer = Array.isArray(data.data.correctAnswer)
            ? data.data.correctAnswer
            : [data.data.correctAnswer];
        }

        return data.data;
      }
    } catch (error) {
      console.error('Lỗi khi trích xuất dữ liệu:', error);
      toast({
        title: 'Cảnh báo',
        description: 'Không thể trích xuất dữ liệu từ nội dung LaTeX. Chỉ cập nhật nội dung gốc.',
        variant: 'warning',
      });
      return { rawContent: content };
    }
  };

  // Xử lý xóa câu hỏi
  const handleDeleteQuestion = async () => {
    if (!question || !question.id) return;

    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${params.subcount}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Không thể xóa câu hỏi: ${errorData.message || 'Lỗi không xác định'}`);
      }

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được xóa thành công',
      });

      // Chuyển hướng về trang danh sách câu hỏi
      router.push('/3141592654/admin/questions');
    } catch (err) {
      console.error('Lỗi khi xóa câu hỏi:', err);
      toast({
        title: 'Lỗi',
        description: err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa câu hỏi',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-white">
              {isLoading ? (
                <Skeleton className="h-9 w-64 bg-slate-700" />
              ) : (
                `Chi tiết câu hỏi ${question?.subcount || ''}`
              )}
            </h1>
          </div>

          {!isLoading && question && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Cuộn xuống phần nội dung LaTeX
                  const latexSection = document.querySelector('.latex-content-section');
                  if (latexSection) {
                    latexSection.scrollIntoView({ behavior: 'smooth' });
                  }
                  // Kích hoạt chế độ chỉnh sửa
                  handleEditQuestion();
                }}
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteQuestion}
                className="bg-red-900 hover:bg-red-800"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </div>
          )}
        </div>

        {/* Nội dung */}
        {isLoading ? renderSkeletonLoading() : error ? renderError() : (
          <div className="space-y-6">
            {/* Nội dung gốc (LaTeX) */}
            <Card className="p-6 bg-slate-800/50 border-slate-700 latex-content-section">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">
                    {viewMode === 'latex' ? 'Nội dung gốc (LaTeX)' : 'Nội dung đã render'}
                  </CardTitle>
                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <>
                        {/* Nút chuyển đổi chế độ xem */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewMode(viewMode === 'latex' ? 'rendered' : 'latex')}
                          data-viewmode-toggle="true"
                        >
                          {viewMode === 'latex' ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem render
                            </>
                          ) : (
                            <>
                              <Code className="h-4 w-4 mr-2" />
                              Xem LaTeX
                            </>
                          )}
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(question?.rawContent || '')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Sao chép
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </Button>
                        <Button variant="default" size="sm" onClick={handleSaveQuestion} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Lưu
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {!isEditing ? (
                  viewMode === 'latex' ? (
                    // Chế độ xem LaTeX
                    <div className="bg-slate-900 p-6 rounded-md overflow-x-auto">
                      <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm">
                        {question?.rawContent || 'Không có nội dung gốc'}
                      </pre>
                    </div>
                  ) : (
                    // Chế độ xem đã render
                    <div className="bg-slate-900 p-6 rounded-md overflow-x-auto">
                      <div className="text-white">
                        <LaTeXRenderer content={question?.rawContent || 'Không có nội dung'} />
                      </div>
                    </div>
                  )
                ) : (
                  // Chế độ chỉnh sửa
                  <div className="bg-slate-900 p-6 rounded-md">
                    <Textarea
                      className="min-h-[400px] font-mono text-sm bg-slate-950 text-slate-300 w-full"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      placeholder="Nhập nội dung LaTeX ở đây..."
                      disabled={isSaving}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thông tin chi tiết câu hỏi */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl text-white">Thông tin câu hỏi</CardTitle>
                <CardDescription>
                  Chi tiết về câu hỏi và các tham số
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cột 1: Thông tin cơ bản */}
                  <div className="space-y-4">
                    {/* QuestionID */}
                    {question?.questionId && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-2">Mã câu hỏi (QuestionID)</h3>
                        <div className="bg-slate-700/30 p-3 rounded-md">
                          <div className="text-white font-mono">{question.questionId}</div>
                        </div>
                      </div>
                    )}

                    {/* Subcount */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Subcount</h3>
                      <div className="bg-slate-700/30 p-3 rounded-md">
                        <div className="text-white">{question?.subcount || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Loại câu hỏi */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Loại câu hỏi</h3>
                      <div className="bg-slate-700/30 p-3 rounded-md">
                        <Badge variant="outline" className="text-white">
                          {getQuestionTypeLabel(question?.type || '')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Cột 2: Thông tin bổ sung */}
                  <div className="space-y-4">
                    {/* Nguồn */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Nguồn</h3>
                      <div className="bg-slate-700/30 p-3 rounded-md">
                        <div className="text-white">
                          {question?.source !== undefined && question?.source !== null && question?.source !== ''
                            ? question.source
                            : 'Không có thông tin'}
                        </div>
                      </div>
                    </div>

                    {/* Người tạo */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Người tạo</h3>
                      <div className="bg-slate-700/30 p-3 rounded-md">
                        <div className="text-white">{question?.creator?.name || 'Không có thông tin'}</div>
                      </div>
                    </div>

                    {/* Số lần sử dụng */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Số lần sử dụng</h3>
                      <div className="bg-slate-700/30 p-3 rounded-md">
                        <div className="text-white">{question?.usageCount || 0} lần</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
