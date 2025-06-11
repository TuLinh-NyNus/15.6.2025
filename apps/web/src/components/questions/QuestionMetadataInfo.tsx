'use client';

import { Trash2, PlusCircle, Info } from 'lucide-react';
// Không sử dụng useState trong component này

import { QuestionFormData } from './QuestionFormTabs';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';



type QuestionMetadataInfoProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
};

export function QuestionMetadataInfo({ formData, setFormData }: QuestionMetadataInfoProps) {
  // Danh sách trạng thái câu hỏi
  const statusOptions = [
    { code: 'draft', label: 'Bản nháp' },
    { code: 'review', label: 'Đang xem xét' },
    { code: 'approved', label: 'Đã phê duyệt' },
    { code: 'published', label: 'Đã xuất bản' },
    { code: 'archived', label: 'Đã lưu trữ' },
    { code: 'rejected', label: 'Bị từ chối' }
  ];

  // Format date để hiển thị
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('vi-VN');
  };

  // Hàm cập nhật trạng thái câu hỏi
  const updateStatus = (code: string) => {
    setFormData(prev => ({
      ...prev,
      status: {
        ...prev.status,
        code,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Hàm cập nhật thông tin người tạo
  const updateCreator = (field: 'id' | 'name', value: string) => {
    setFormData(prev => ({
      ...prev,
      creator: {
        ...prev.creator,
        [field]: value
      }
    }));
  };

  // Hàm thêm bình luận mới
  const addComment = () => {
    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      userId: formData.creator?.id || 'unknown',
      content: '',
      date: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        comments: [...(prev.feedback.comments || []), newComment]
      }
    }));
  };

  // Hàm xóa bình luận
  const removeComment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        comments: prev.feedback.comments.filter(comment => comment.id !== id)
      }
    }));
  };

  // Hàm cập nhật nội dung bình luận
  const updateCommentContent = (id: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        comments: prev.feedback.comments.map(comment =>
          comment.id === id ? { ...comment, content } : comment
        )
      }
    }));
  };

  // Hàm cập nhật đánh giá
  const updateFeedbackRating = (field: 'averageDifficulty' | 'clarity' | 'correctnessRate', value: number) => {
    setFormData(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Thông tin người tạo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="creator-id" className="mb-2 block">ID người tạo</Label>
            <Input
              id="creator-id"
              value={formData.creator?.id || ''}
              onChange={(e) => updateCreator('id', e.target.value)}
              placeholder="Nhập ID người tạo"
            />
          </div>
          <div>
            <Label htmlFor="creator-name" className="mb-2 block">Tên người tạo</Label>
            <Input
              id="creator-name"
              value={formData.creator?.name || ''}
              onChange={(e) => updateCreator('name', e.target.value)}
              placeholder="Nhập tên người tạo"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Trạng thái câu hỏi</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status" className="mb-2 block">Trạng thái</Label>
            <Select
              value={formData.status?.code || 'draft'}
              onValueChange={updateStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="last-updated" className="mb-2 block">Cập nhật lần cuối</Label>
            <Input
              id="last-updated"
              value={formatDate(formData.status?.lastUpdated)}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Thống kê sử dụng</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="usage-count" className="mb-2 block">Số lần sử dụng</Label>
            <Input
              id="usage-count"
              type="number"
              value={formData.usageCount || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, usageCount: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="exam-refs" className="mb-2 block">Số lượng đề thi tham chiếu</Label>
            <Input
              id="exam-refs"
              value={(formData.examRefs?.length || 0).toString()}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Lịch sử sử dụng</h4>
          {formData.usageHistory && formData.usageHistory.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đề thi</TableHead>
                    <TableHead>Ngày sử dụng</TableHead>
                    <TableHead>Vị trí</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.usageHistory.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.examName || entry.examId}</TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.questionPosition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Chưa có lịch sử sử dụng</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Đánh giá và phản hồi</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="difficulty" className="mb-2 block">
              <div className="flex items-center">
                Độ khó
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Thang điểm 1-5, 5 là khó nhất</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="difficulty"
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={formData.feedback?.averageDifficulty || 3}
              onChange={(e) => updateFeedbackRating('averageDifficulty', parseFloat(e.target.value) || 3)}
            />
          </div>
          <div>
            <Label htmlFor="clarity" className="mb-2 block">
              <div className="flex items-center">
                Độ rõ ràng
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Thang điểm 1-5, 5 là rõ ràng nhất</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="clarity"
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={formData.feedback?.clarity || 3}
              onChange={(e) => updateFeedbackRating('clarity', parseFloat(e.target.value) || 3)}
            />
          </div>
          <div>
            <Label htmlFor="correctness-rate" className="mb-2 block">
              <div className="flex items-center">
                Tỷ lệ đúng
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tỷ lệ học sinh trả lời đúng (0-100%)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Label>
            <Input
              id="correctness-rate"
              type="number"
              min={0}
              max={100}
              step={1}
              value={formData.feedback?.correctnessRate || 0}
              onChange={(e) => updateFeedbackRating('correctnessRate', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium">Bình luận</h4>
            <Badge variant="outline">{formData.feedback?.comments?.length || 0}</Badge>
          </div>

          <div className="space-y-4 mb-4">
            {formData.feedback?.comments && formData.feedback.comments.length > 0 ? (
              formData.feedback.comments.map((comment, _index) => (
                <div key={comment.id} className="p-4 border rounded-md relative">
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeComment(comment.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{comment.userId}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                    </div>
                    <Textarea
                      value={comment.content}
                      onChange={(e) => updateCommentContent(comment.id, e.target.value)}
                      placeholder="Nhập nội dung bình luận"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Chưa có bình luận nào</p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={addComment}
            type="button"
            className="w-full bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700 transition-colors duration-300 hover:scale-105"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Thêm bình luận
          </Button>
        </div>
      </div>
    </div>
  );
}