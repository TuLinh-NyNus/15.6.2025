'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertTriangle, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionItem } from '@/components/questions/QuestionItem';

export default function SavedQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy danh sách câu hỏi từ localStorage khi component được tải
  useEffect(() => {
    try {
      setIsLoading(true);
      setError('');

      // Lấy danh sách câu hỏi từ localStorage
      const savedQuestions = JSON.parse(localStorage.getItem('savedQuestions') || '[]');
      setQuestions(savedQuestions);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách câu hỏi từ localStorage:', error);
      setError('Có lỗi xảy ra khi lấy danh sách câu hỏi từ localStorage');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Xử lý khi người dùng xem chi tiết câu hỏi
  const handleViewQuestion = (questionId: string) => {
    router.push(`/3141592654/admin/questions/${questionId}`);
  };

  // Xử lý khi người dùng xóa câu hỏi
  const handleDeleteQuestion = (questionId: string) => {
    try {
      // Lấy danh sách câu hỏi từ localStorage
      const savedQuestions = JSON.parse(localStorage.getItem('savedQuestions') || '[]');

      // Lọc ra danh sách câu hỏi mới không chứa câu hỏi cần xóa
      const newQuestions = savedQuestions.filter((question: any) => question.id !== questionId);

      // Lưu lại danh sách câu hỏi mới vào localStorage
      localStorage.setItem('savedQuestions', JSON.stringify(newQuestions));

      // Cập nhật state
      setQuestions(newQuestions);
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      setError('Có lỗi xảy ra khi xóa câu hỏi');
    }
  };

  // Xử lý khi người dùng xóa tất cả câu hỏi
  const handleDeleteAllQuestions = () => {
    try {
      // Xóa danh sách câu hỏi khỏi localStorage
      localStorage.removeItem('savedQuestions');

      // Cập nhật state
      setQuestions([]);
    } catch (error) {
      console.error('Lỗi khi xóa tất cả câu hỏi:', error);
      setError('Có lỗi xảy ra khi xóa tất cả câu hỏi');
    }
  };

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
                Câu hỏi đã lưu trong localStorage
              </h1>
              <p className="text-slate-400 mt-1">
                Danh sách câu hỏi đã lưu trong localStorage (chỉ có trong trình duyệt này)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteAllQuestions}
              disabled={isLoading || questions.length === 0}
              className="bg-red-500/80 hover:bg-red-600 text-white border-red-500"
            >
              Xóa tất cả
            </Button>
          </div>
        </div>

        {/* Nội dung chính */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Danh sách câu hỏi đã lưu
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
                  Bạn chưa lưu câu hỏi nào vào localStorage
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
                    key={question.id}
                    question={question}
                    onView={() => handleViewQuestion(question.id)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
