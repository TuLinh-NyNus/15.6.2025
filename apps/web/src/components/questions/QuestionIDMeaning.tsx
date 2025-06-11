import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, Info, BookOpen, ExternalLink } from 'lucide-react';
import { decodeMapID } from '@/lib/utils/mapid-decoder';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Định nghĩa interface cho QuestionIDField để tránh lỗi TypeScript
interface QuestionIDField {
  value?: string;
  description?: string;
  id?: string;
  name?: string;
  level?: number;
}

// Định nghĩa interface cho QuestionID để tránh lỗi TypeScript
interface QuestionID {
  format?: string;
  fullId?: string;
  grade?: QuestionIDField;
  subject?: QuestionIDField;
  chapter?: QuestionIDField | null;
  level?: QuestionIDField;
  difficulty?: QuestionIDField;
  lesson?: QuestionIDField | null;
  form?: QuestionIDField;
  [key: string]: unknown; // Cho phép các trường động
}

interface QuestionIDMeaningProps {
  questionID: QuestionID;
  onEdit?: () => void; // Callback khi người dùng muốn chỉnh sửa
}

/**
 * Component hiển thị ý nghĩa của các tham số trong QuestionID
 */
export function QuestionIDMeaning({ questionID, onEdit }: QuestionIDMeaningProps) {
  // State để theo dõi trạng thái hiển thị
  const [showEditButton, setShowEditButton] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mapIDDetails, setMapIDDetails] = useState<any>(null);

  // Kiểm tra xem có đủ thông tin để hiển thị không
  const hasBasicInfo = questionID.grade?.value &&
                      questionID.subject?.value &&
                      questionID.chapter?.value &&
                      questionID.level?.value;

  // Tạo ID dựa trên các tham số
  const createID = () => {
    if (!questionID.grade?.value || !questionID.subject?.value ||
        !questionID.chapter?.value || !questionID.level?.value) {
      return 'ID chưa đủ thông tin';
    }

    let id = `${questionID.grade.value}${questionID.subject.value}${questionID.chapter.value}${questionID.level.value}`;

    if (questionID.lesson?.value) {
      id += questionID.lesson.value;
    }

    if (questionID.form?.value) {
      id += `-${questionID.form.value}`;
    }

    return id;
  };

  // Tạo ID với định dạng hiển thị rõ ràng hơn
  const createFormattedID = () => {
    if (!questionID.grade?.value || !questionID.subject?.value ||
        !questionID.chapter?.value || !questionID.level?.value) {
      return 'ID chưa đủ thông tin';
    }

    const parts = [
      questionID.grade.value,
      questionID.subject.value,
      questionID.chapter.value,
      questionID.level.value,
      questionID.lesson?.value || '',
    ];

    let id = parts.join('-');

    if (questionID.form?.value) {
      id += `-${questionID.form.value}`;
    }

    return id;
  };

  // Tải thông tin chi tiết từ Map ID.tex khi component được tạo hoặc khi questionID thay đổi
  useEffect(() => {
    const loadMapIDDetails = async () => {
      if (!hasBasicInfo) return;

      try {
        const id = createID();
        const details = await decodeMapID(id);
        setMapIDDetails(details);
      } catch (error) {
        console.error('Lỗi khi tải thông tin Map ID:', error);
      }
    };

    loadMapIDDetails();
  }, [questionID, hasBasicInfo, createID]);

  if (!hasBasicInfo) {
    return (
      <div className="w-full">
        <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-slate-600">
              Điền đầy đủ các trường để xem ý nghĩa của QuestionID
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị ý nghĩa của từng tham số
  return (
    <div className="w-full"
         onMouseEnter={() => setShowEditButton(true)}
         onMouseLeave={() => setShowEditButton(false)}>
      <Card className="border-slate-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Ý nghĩa QuestionID</CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                      className="h-8 px-2 text-muted-foreground hover:text-primary"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem chi tiết từ Map ID.tex</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {showEditButton && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 px-2 text-muted-foreground hover:text-primary"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Thông tin chi tiết về ý nghĩa của các tham số trong QuestionID theo Map ID.tex
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {createID()}
            </Badge>
            <span className="text-sm text-muted-foreground">→</span>
            <Badge variant="outline" className="text-base px-3 py-1">
              {createFormattedID()}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Tham số 1: Lớp */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.grade?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Lớp:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.grade?.description || mapIDDetails?.grade?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.grade && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 1:</strong> Lớp</p>
                    <p><strong>Giá trị:</strong> {questionID.grade?.value} - {mapIDDetails.grade.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tham số 2: Môn học */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.subject?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Môn học:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.subject?.description || mapIDDetails?.subject?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.subject && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 2:</strong> Môn</p>
                    <p><strong>Giá trị:</strong> {questionID.subject?.value} - {mapIDDetails.subject.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tham số 3: Chương */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.chapter?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Chương:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.chapter?.description || mapIDDetails?.chapter?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.chapter && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 3:</strong> Chương</p>
                    <p><strong>Giá trị:</strong> {questionID.chapter?.value} - {mapIDDetails.chapter.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tham số 4: Độ khó */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.level?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Độ khó:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.level?.description || mapIDDetails?.difficulty?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.difficulty && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 4:</strong> Mức độ</p>
                    <p><strong>Giá trị:</strong> {questionID.level?.value} - {mapIDDetails.difficulty.description}</p>
                    <p className="mt-1">
                      <strong>Các mức độ:</strong> N (Nhận biết), H (Thông Hiểu), V (Vận dụng), C (Vận dụng Cao), T (VIP), M (Note)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tham số 5: Bài học */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.lesson?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Bài học:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.lesson?.description || mapIDDetails?.lesson?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.lesson && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 5:</strong> Bài</p>
                    <p><strong>Giá trị:</strong> {questionID.lesson?.value} - {mapIDDetails.lesson.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tham số 6: Dạng câu hỏi (nếu có) */}
            {(questionID.form?.value || mapIDDetails?.form) && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                  {questionID.form?.value || mapIDDetails?.form?.code || '?'}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Dạng câu hỏi:</span>
                    <span className="text-sm text-slate-600 ml-2">
                      {questionID.form?.description || mapIDDetails?.form?.description || 'Chưa xác định'}
                    </span>
                  </div>
                  {showDetails && mapIDDetails?.form && (
                    <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                      <p><strong>Tham số 6:</strong> Dạng</p>
                      <p><strong>Giá trị:</strong> {questionID.form?.value || mapIDDetails.form.code} - {mapIDDetails.form.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {showDetails && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Thông tin từ Map ID.tex</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-0 text-xs text-blue-500"
                  onClick={() => window.open('/3141592654/admin/questions/map-id', '_blank')}
                >
                  Xem đầy đủ Map ID
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
