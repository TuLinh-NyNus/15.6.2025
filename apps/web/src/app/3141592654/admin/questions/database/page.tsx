'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertTriangle, Database, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionItem } from '@/components/questions/QuestionItem';
import { QuestionDetailsDialog } from '@/components/questions/QuestionDetailsDialog';
import { useToast } from '@/components/ui/use-toast';
import ErrorPage from './error-page';

export default function DatabaseQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  // Lấy danh sách câu hỏi từ API khi component được tải
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Gọi API để lấy danh sách câu hỏi từ database
        const response = await fetch('/api/admin/questions');

        if (!response.ok) {
          throw new Error(`Lỗi khi lấy dữ liệu: ${response.status}`);
        }

        const data = await response.json();

        // Kiểm tra xem có dữ liệu câu hỏi không
        if (!data.questions || !Array.isArray(data.questions)) {
          throw new Error('Không có dữ liệu câu hỏi từ API');
        }

        // Chuyển đổi dữ liệu để phù hợp với component QuestionItem
        const formattedQuestions = data.questions.map((q: any) => ({
          _id: q.id,
          content: q.content,
          type: q.type,
          raw_content: q.rawContent,
          solution: q.solution,
          answers: q.answers,
          correctAnswer: q.correctAnswer,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt
        }));

        setQuestions(formattedQuestions);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách câu hỏi từ API:', error);
        setError('Có lỗi xảy ra khi lấy danh sách câu hỏi từ API');

        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Không thể tải danh sách câu hỏi",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  // Xử lý khi người dùng xem chi tiết câu hỏi
  const handleViewQuestion = (questionId: string) => {
    router.push(`/3141592654/admin/questions/${questionId}`);
  };

  // Xử lý khi người dùng xem chi tiết câu hỏi trong dialog
  const handleViewDetails = (questionId: string) => {
    const question = questions.find(q => q._id === questionId);
    if (question) {
      setSelectedQuestion(question);
      setIsDetailsDialogOpen(true);
    } else {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin câu hỏi",
        variant: "destructive"
      });
    }
  };

  // Xử lý khi người dùng xem câu hỏi dạng PDF (sẽ xây dựng sau)
  const handleViewPdf = (questionId: string) => {
    toast({
      title: "Thông báo",
      description: "Tính năng xem câu hỏi dạng PDF đang được phát triển",
    });
  };

  // Xử lý khi người dùng xóa câu hỏi
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // Đánh dấu câu hỏi đang xóa
      setDeletingQuestionId(questionId);

      // Hiển thị toast thông báo đang xóa
      toast({
        title: "Đang xử lý",
        description: "Đang xóa câu hỏi...",
      });

      // Gửi yêu cầu DELETE tới API
      const response = await fetch(`/api/admin/questions/${questionId || 'unknown'}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: questionId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Lỗi khi xóa câu hỏi: HTTP ${response.status}`);
      }

      // Thông báo thành công
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi thành công!",
      });

      // Cập nhật danh sách câu hỏi sau khi xóa
      setQuestions(prevQuestions => prevQuestions.filter(q => q._id !== questionId));
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);

      // Thông báo lỗi
      toast({
        title: "Lỗi",
        description: error instanceof Error
          ? `Không thể xóa câu hỏi: ${error.message}`
          : "Không thể xóa câu hỏi. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      // Bỏ đánh dấu câu hỏi đang xóa
      setDeletingQuestionId(null);
    }
  };

  // Nếu có lỗi P2022, hiển thị trang lỗi
  if (error && error.includes('Lỗi khi lấy dữ liệu: 500')) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/3141592654/admin/questions')}
              className="text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Câu hỏi trong Database
              </h1>
              <p className="text-slate-400 mt-1">
                Danh sách câu hỏi đã lưu trong cơ sở dữ liệu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push('/3141592654/admin/questions/inputques')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Thêm câu hỏi mới
            </Button>
          </div>
        </div>

        {/* Nội dung chính */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Danh sách câu hỏi trong Database
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-2 text-slate-400">Đang tải danh sách câu hỏi...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-xl font-medium text-white">Có lỗi xảy ra</h3>
                <p className="mt-1 text-slate-400">{error}</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Database className="h-12 w-12 text-slate-500" />
                <h3 className="mt-2 text-xl font-medium text-white">Không có câu hỏi nào</h3>
                <p className="mt-1 text-slate-400">
                  Chưa có câu hỏi nào được lưu trong cơ sở dữ liệu
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/3141592654/admin/questions/inputques')}
                >
                  Thêm câu hỏi mới
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionItem
                    key={question._id}
                    question={question}
                    onView={() => handleViewQuestion(question._id)}
                    onViewPdf={() => handleViewPdf(question._id)}
                    onViewDetails={() => handleViewDetails(question._id)}
                    onDelete={() => handleDeleteQuestion(question._id)}
                    isDeleting={deletingQuestionId === question._id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog hiển thị chi tiết câu hỏi */}
      {selectedQuestion && (
        <QuestionDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          question={selectedQuestion}
        />
      )}
    </div>
  );
}
