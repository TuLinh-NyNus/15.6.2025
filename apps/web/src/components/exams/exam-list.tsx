'use client';

import { AlertCircle, Clock, FileText, User, Calendar, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/basic-select';
import { Skeleton } from '@/components/ui/skeleton';
import { IExam } from '@/lib/api/services/exam-service';
import { formatDate } from '@/lib/utils';
import { useExams, useDeleteExam } from '@/hooks/use-exams';

export default function ExamList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Sử dụng hook useExams để lấy danh sách bài thi từ API
  const { data, isLoading, error } = useExams({
    search: searchTerm,
    difficulty: selectedDifficulty ? [selectedDifficulty] : undefined,
    limit: 10,
    status: ['PUBLISHED']
  });

  // Sử dụng hook useDeleteExam để xóa bài thi
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();

  // Xử lý xóa bài thi
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài thi này không?')) {
      deleteExam(id);
    }
  };

  // Xử lý xem chi tiết bài thi
  const handleViewExam = (id: string) => {
    router.push(`/de-thi/${id}`);
  };

  // Xử lý chỉnh sửa bài thi
  const handleEditExam = (id: string) => {
    router.push(`/de-thi/${id}/edit`);
  };

  // Xử lý bắt đầu làm bài thi
  const handleStartExam = (id: string) => {
    router.push(`/de-thi/${id}/lam-bai`);
  };

  // Hàm lấy màu badge dựa trên độ khó
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return <Badge className="bg-green-500 hover:bg-green-600">Dễ</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Trung bình</Badge>;
      case 'HARD':
        return <Badge className="bg-red-500 hover:bg-red-600">Khó</Badge>;
      default:
        return <Badge>Không xác định</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Danh sách đề thi</h1>
            <p className="mt-2 text-lg text-gray-400">
              Tìm kiếm và làm các bài thi để kiểm tra kiến thức của bạn
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative w-full sm:w-64">
              <Input
                type="search"
                placeholder="Tìm kiếm đề thi..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full sm:w-auto"
            >
              <option value="">Tất cả độ khó</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </Select>
          </div>
        </div>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Đã xảy ra lỗi khi tải danh sách đề thi. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        )}

        {/* Hiển thị skeleton khi đang tải dữ liệu */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Hiển thị thông báo khi không có đề thi */}
        {!isLoading && (!data?.items || data.items.length === 0) && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-white">Không tìm thấy đề thi</h3>
            <p className="mt-2 text-sm text-gray-400">
              Không tìm thấy đề thi nào phù hợp với tiêu chí tìm kiếm của bạn.
            </p>
          </div>
        )}

        {/* Hiển thị danh sách đề thi */}
        {!isLoading && data?.items && data.items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((exam: IExam) => (
              <Card key={exam.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-white">{exam.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {exam.category.name}
                      </CardDescription>
                    </div>
                    {getDifficultyBadge(exam.difficulty)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-gray-400 line-clamp-2">{exam.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration} phút</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{exam.totalQuestions} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{exam.creator.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(new Date(exam.createdAt))}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => handleStartExam(exam.id)}
                  >
                    Làm bài
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                    onClick={() => handleViewExam(exam.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                    onClick={() => handleEditExam(exam.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-red-400"
                    onClick={() => handleDelete(exam.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {!isLoading && data?.items && data.items.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                disabled={data.page <= 1}
              >
                Trang trước
              </Button>
              <span className="text-gray-400">
                Trang {data.page} / {Math.ceil(data.total / data.limit)}
              </span>
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                disabled={data.page >= Math.ceil(data.total / data.limit)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
