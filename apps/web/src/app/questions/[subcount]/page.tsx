'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useMapID } from '@/lib/utils/map-id-parser';
import questionService from '@/lib/api/services/question-service';
import Image from 'next/image';

// Định nghĩa kiểu dữ liệu cho câu hỏi
interface QuestionDetail {
  _id: string;
  questionId: string;
  subcount: string;
  rawContent: string;
  content: string;
  images: string[];
  questionID?: {
    grade?: { value: string; description: string };
    subject?: { value: string; description: string };
    chapter?: { value: string; description: string };
    level?: { value: string; description: string };
    lesson?: { value: string; description: string };
    form?: { value: string; description: string };
    fullId?: string;
  };
  type?: string;
  status?: string;
  usageCount?: number;
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Component chính
export default function QuestionDetailPage({ params }: { params: { subcount: string } }) {
  // States
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  const { entries: mapIDEntries, isLoading: isMapIDLoading } = useMapID();

  // Lấy thông tin câu hỏi từ API
  useEffect(() => {
    const fetchQuestionDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Gọi API để lấy thông tin chi tiết câu hỏi
        const response = await questionService.getQuestionBySubcount(params.subcount);

        if (!response || !response.item) {
          throw new Error('Không tìm thấy câu hỏi');
        }

        setQuestion(response.item);
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

  // Hàm lấy mô tả cho các tham số
  const getParameterDescription = (paramType: string, paramValue: string): string => {
    if (!mapIDEntries || isMapIDLoading) return paramValue;

    const entry = mapIDEntries.find(
      (entry) => entry.type === paramType && entry.value === paramValue
    );

    return entry?.description || paramValue;
  };

  // Hàm lấy mô tả cho loại câu hỏi
  const getQuestionTypeDescription = (type: string): string => {
    switch (type) {
      case 'MC':
        return 'Trắc nghiệm';
      case 'TF':
        return 'Đúng/Sai';
      case 'SA':
        return 'Trả lời ngắn';
      case 'ES':
        return 'Tự luận';
      default:
        return type;
    }
  };

  // Hàm lấy mô tả cho mức độ
  const getLevelDescription = (level: string): string => {
    switch (level) {
      case 'N':
        return 'Nhận biết';
      case 'H':
        return 'Thông hiểu';
      case 'V':
        return 'Vận dụng';
      case 'C':
        return 'Vận dụng cao';
      case 'T':
        return 'VIP';
      case 'M':
        return 'Note';
      default:
        return level;
    }
  };

  // Render skeleton loading
  const renderSkeletonLoading = () => (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64 bg-slate-700" />
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="space-y-4">
          <Skeleton className="h-6 w-full bg-slate-700" />
          <Skeleton className="h-40 w-full bg-slate-700" />
        </div>
      </Card>
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(7).fill(0).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-32 bg-slate-700" />
              <Skeleton className="h-8 w-full bg-slate-700" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-slate-700" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full bg-slate-700 rounded-md" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  // Render lỗi
  const renderError = () => (
    <Card className="p-6 bg-slate-800/50 border-slate-700 text-center">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-red-400">Lỗi</h2>
        <p className="text-slate-400">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push('/questions')}
          className="mt-4"
        >
          Quay lại danh sách câu hỏi
        </Button>
      </div>
    </Card>
  );

  // Render thông tin chi tiết câu hỏi
  const renderQuestionDetail = () => {
    if (!question) return null;

    return (
      <div className="space-y-6">
        {/* Nội dung gốc LaTeX - Ô lớn ở đầu trang */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              <h2 className="text-xl font-bold text-white">Nội dung gốc (LaTeX)</h2>
            </div>
            <div className="bg-slate-900 p-6 rounded-md overflow-x-auto">
              <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm">
                {question.rawContent || 'Không có nội dung gốc'}
              </pre>
            </div>
          </div>
        </Card>

        {/* Thông tin các tham số - Hiển thị giá trị và ý nghĩa của từng tham số */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Thông tin tham số câu hỏi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Lớp */}
              {question.questionID?.grade && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Lớp (Grade)</div>
                  <div className="text-white">
                    {question.questionID.grade.value} - {getParameterDescription('grade', question.questionID.grade.value)}
                  </div>
                </div>
              )}

              {/* Môn */}
              {question.questionID?.subject && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Môn (Subject)</div>
                  <div className="text-white">
                    {question.questionID.subject.value} - {getParameterDescription('subject', question.questionID.subject.value)}
                  </div>
                </div>
              )}

              {/* Chương */}
              {question.questionID?.chapter && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Chương (Chapter)</div>
                  <div className="text-white">
                    {question.questionID.chapter.value} - {getParameterDescription('chapter', question.questionID.chapter.value)}
                  </div>
                </div>
              )}

              {/* Bài */}
              {question.questionID?.lesson && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Bài (Lesson)</div>
                  <div className="text-white">
                    {question.questionID.lesson.value} - {getParameterDescription('lesson', question.questionID.lesson.value)}
                  </div>
                </div>
              )}

              {/* Mức độ */}
              {question.questionID?.level && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Mức độ (Level)</div>
                  <div className="text-white">
                    {question.questionID.level.value} - {getLevelDescription(question.questionID.level.value)}
                  </div>
                </div>
              )}

              {/* Dạng */}
              {question.questionID?.form && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Dạng (Form)</div>
                  <div className="text-white">
                    {question.questionID.form.value} - {getParameterDescription('form', question.questionID.form.value)}
                  </div>
                </div>
              )}

              {/* Loại câu hỏi */}
              {question.type && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Loại câu hỏi (Type)</div>
                  <div className="text-white">
                    {question.type} - {getQuestionTypeDescription(question.type)}
                  </div>
                </div>
              )}

              {/* Mã câu hỏi */}
              {(question.questionID?.fullId || question.questionId) && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Mã câu hỏi (QuestionID)</div>
                  <div className="text-white">
                    {question.questionID?.fullId || question.questionId}
                  </div>
                </div>
              )}

              {/* Subcount */}
              {question.subcount && (
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <div className="text-sm font-medium text-slate-400 mb-1">Subcount</div>
                  <div className="text-white">
                    {question.subcount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Hình ảnh - Hiển thị ở dưới cùng */}
        {question.images && question.images.length > 0 && (
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-slate-400" />
                <h2 className="text-xl font-bold text-white">Hình ảnh câu hỏi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {question.images.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-video bg-slate-900 rounded-md overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={`Hình ảnh ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="space-y-6">
        {/* Header */}
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

        {/* Nội dung */}
        {isLoading ? renderSkeletonLoading() : error ? renderError() : renderQuestionDetail()}
      </div>
    </div>
  );
}
