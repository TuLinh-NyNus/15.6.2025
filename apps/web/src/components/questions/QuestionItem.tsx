'use client';

import { Eye, Pencil, Trash2, Loader2, FileText, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Không sử dụng useState trong component này

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LaTeXRenderer from '@/components/latex/LaTeXRenderer';
// import { cn } from '@/lib/utils'; // Không sử dụng cn trong component này

interface QuestionItemProps {
  question: {
    _id?: string;
    id?: string;
    content: string;
    type?: string;
    subject?: string;
    grade?: string;
    difficulty?: string;
    questionId?: string;
    questionID?: {
      fullId?: string;
      grade?: {
        value?: string;
        description?: string;
      };
      subject?: {
        value?: string;
        description?: string;
      };
      level?: {
        value?: string;
        description?: string;
      };
    };
    subcount?: string;
    source?: string;
    usageCount?: number;
    rawContent?: string;
    raw_content?: string;
    solution?: string;
    answers?: any;
    correctAnswer?: any;
    images?: {
      questionImage?: string;
      solutionImage?: string;
    };
    tags?: string[];
    examRefs?: any[];
    feedback?: number | {
      count?: number;
      feedbackCount?: number;
    };
    createdAt?: string;
    updatedAt?: string;
  };
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
  onViewPdf?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isDeleting?: boolean;
}

// Helper functions
const getBadgeVariantByLevel = (level: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (level) {
    case 'EASY':
    case 'E':
      return "default"; // Easy - xanh lá
    case 'MEDIUM':
    case 'M':
      return "secondary"; // Medium - cam
    case 'HARD':
    case 'H':
      return "destructive"; // Hard - đỏ
    default:
      return "outline";
  }
};

const getLevelLabel = (level: string): string => {
  switch (level) {
    case 'EASY':
    case 'E':
      return "Dễ";
    case 'MEDIUM':
    case 'M':
      return "Trung bình";
    case 'HARD':
    case 'H':
      return "Khó";
    default:
      return level;
  }
};

export function QuestionItem({
  question,
  onView,
  onEdit,
  onDelete,
  onViewPdf,
  onViewDetails,
  isDeleting = false
}: QuestionItemProps) {
  const router = useRouter();
  // Truncate content nếu quá dài
  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  // Render badges cho câu hỏi
  const renderQuestionBadges = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-1">
        {question.questionID?.subject?.value && (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            {question.subject || question.questionID.subject.description || question.questionID.subject.value}
          </Badge>
        )}
        {question.questionID?.grade?.value && (
          <Badge variant="outline">
            Lớp {question.grade || question.questionID.grade.description || question.questionID.grade.value}
          </Badge>
        )}
        {question.questionID?.level?.value && (
          <Badge variant={getBadgeVariantByLevel(question.questionID.level.value)}>
            {getLevelLabel(question.questionID.level.value)}
          </Badge>
        )}
      </div>
    );
  };

  // Tạo ID duy nhất cho câu hỏi dựa trên nội dung
  const uniqueContentId = `question-${question.content?.substring(0, 20).replace(/\s+/g, '-') || 'unknown'}`;

  return (
    <Card
      className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300"
      id={uniqueContentId}
      data-id={question._id || question.id || ''}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            {renderQuestionBadges()}
            <div className="text-slate-800 dark:text-white w-full transition-colors duration-300">
              <LaTeXRenderer content={question.rawContent || question.raw_content || question.content} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
              <div>ID: {question._id ? String(question._id).substring(0, 8) + '...' : question.id ? String(question.id).substring(0, 8) + '...' : 'Không có ID'}</div>

              {(question.questionID?.fullId || question.questionId) && (
                <div>Mã câu hỏi: {question.questionID?.fullId || question.questionId}</div>
              )}

              {question.subcount && (
                <div>
                  Subcount: {' '}
                  <span
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer underline transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/3141592654/admin/questions/${question.subcount}`);
                    }}
                  >
                    {question.subcount}
                  </span>
                </div>
              )}

              {question.usageCount !== undefined && (
                <div>Sử dụng: {question.usageCount} lần</div>
              )}

              {question.source && (
                <div>Nguồn: {question.source}</div>
              )}

              {(typeof question.feedback === 'number' ? question.feedback > 0 :
                (question.feedback?.count || question.feedback?.feedbackCount)) && (
                <div>Feedback: {typeof question.feedback === 'number' ? question.feedback :
                  (question.feedback?.count || question.feedback?.feedbackCount)} lần</div>
              )}

              {question.tags && question.tags.length > 0 && (
                <div>Tags: {question.tags.slice(0, 3).join(', ')}{question.tags.length > 3 ? '...' : ''}</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Nút xem câu hỏi */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 px-0 flex justify-center items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-300 hover:scale-105"
              title="Xem chi tiết"
              onClick={() => onView(question._id || question.id || '')}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="sr-only">Xem</span>
            </Button>

            {/* Nút xem PDF - sẽ xây dựng sau */}
            {onViewPdf && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 px-0 flex justify-center items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-300 hover:scale-105"
                title="Xem PDF"
                onClick={() => onViewPdf(question._id || question.id || '')}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="sr-only">Xem PDF</span>
              </Button>
            )}

            {/* Nút xem chi tiết */}
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 px-0 flex justify-center items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors duration-300 hover:scale-105"
                title="Xem thông tin chi tiết"
                onClick={() => onViewDetails(question._id || question.id || '')}
              >
                <Info className="h-3.5 w-3.5" />
                <span className="sr-only">Chi tiết</span>
              </Button>
            )}

            {/* Nút sửa câu hỏi */}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 px-0 flex justify-center items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-300 hover:scale-105"
                title="Sửa câu hỏi"
                onClick={async (e) => {
                  e.stopPropagation();

                  const questionId = question._id || question.id || '';
                  if (!questionId) {
                    console.error('Không thể chỉnh sửa câu hỏi vì không có ID');
                    alert('Không thể chỉnh sửa câu hỏi vì không có ID');
                    return;
                  }

                  // Kiểm tra xem câu hỏi có subcount không
                  if (question.subcount) {
                    // Nếu có subcount, điều hướng đến trang chi tiết câu hỏi với subcount trong phần admin
                    console.log('Điều hướng đến trang chi tiết câu hỏi với subcount:', question.subcount);
                    router.push(`/3141592654/admin/questions/${question.subcount}`);
                  } else {
                    try {
                      // Gọi API để lấy subcount từ database
                      const response = await fetch(`/api/admin/questions/get-subcount?id=${questionId}`);
                      const data = await response.json();

                      console.log('API response:', data);

                      if (response.ok && data.subcount) {
                        // Nếu có subcount, điều hướng đến trang chi tiết câu hỏi với subcount trong phần admin
                        console.log('Điều hướng đến trang chi tiết câu hỏi với subcount:', data.subcount);
                        router.push(`/3141592654/admin/questions/${data.subcount}`);
                      } else {
                        // Nếu không có subcount, sử dụng hàm onEdit được truyền từ component cha
                        console.log('Không có subcount, sử dụng hàm onEdit');
                        onEdit(questionId);
                      }
                    } catch (error) {
                      console.error('Lỗi khi lấy subcount:', error);
                      // Nếu có lỗi, sử dụng hàm onEdit được truyền từ component cha
                      onEdit(questionId);
                    }
                  }
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Sửa</span>
              </Button>
            )}

            {/* Nút xóa câu hỏi - Chỉ hiển thị một nút xóa duy nhất */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 sm:w-auto px-0 sm:px-2 flex justify-center items-center bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-white transition-colors duration-300 hover:scale-105"
              onClick={() => {
                try {
                  console.log('=== BẮT ĐẦU XÓA CÂU HỎI ===');
                  console.log('Thông tin câu hỏi:', {
                    id: question._id,
                    content: question.content?.substring(0, 30),
                    type: typeof question._id
                  });

                  // Kiểm tra ID câu hỏi
                  if (!question._id) {
                    console.error('ID câu hỏi không tồn tại');

                    // Thử lấy ID từ DOM
                    const questionElement = document.getElementById(uniqueContentId);
                    const dataId = questionElement?.getAttribute('data-id');

                    if (dataId) {
                      console.log('Tìm thấy ID từ DOM:', dataId);
                      question._id = dataId;
                    } else {
                      // Thử tìm ID từ các thuộc tính khác
                      if (question.id) {
                        console.log('Sử dụng ID từ thuộc tính id:', question.id);
                        question._id = question.id;
                      } else {
                        alert('Không thể xóa câu hỏi vì ID không tồn tại');
                        return;
                      }
                    }
                  }

                  // Xác nhận xóa
                  const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi này không?`);
                  if (!confirmDelete) {
                    console.log('Người dùng đã hủy xóa câu hỏi');
                    return;
                  }

                  // Đảm bảo ID là string
                  const questionId = String(question._id);
                  console.log('Xóa câu hỏi với ID:', questionId);

                  // Gọi hàm xóa
                  console.log('Gọi hàm onDelete với ID:', questionId);

                  // Nếu không có ID, truyền thêm nội dung câu hỏi
                  if (!questionId || questionId === 'undefined' || questionId === 'null') {
                    console.log('ID không hợp lệ, truyền thêm nội dung câu hỏi');
                    // Lưu nội dung câu hỏi vào localStorage để sử dụng trong API route
                    localStorage.setItem('deleteQuestionContent', question.content || '');
                  }

                  onDelete(questionId);
                  console.log('Đã gọi hàm onDelete');
                } catch (error) {
                  console.error('Lỗi khi xử lý xóa câu hỏi:', error);
                  alert('Đã xảy ra lỗi khi xóa câu hỏi');
                }
              }}
              disabled={isDeleting}
              title="Xóa câu hỏi"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">Xóa</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}