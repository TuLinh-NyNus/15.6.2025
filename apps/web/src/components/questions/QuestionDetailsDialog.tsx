'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuestionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
}

export function QuestionDetailsDialog({
  isOpen,
  onClose,
  question
}: QuestionDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('general');

  if (!question) return null;

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

  // Render các đáp án
  const renderAnswers = () => {
    if (!question.answers) return <p>Không có dữ liệu đáp án</p>;

    try {
      let answers = question.answers;
      if (typeof answers === 'string') {
        answers = JSON.parse(answers);
      }

      if (!Array.isArray(answers)) {
        return <p>Dữ liệu đáp án không đúng định dạng</p>;
      }

      // Xác định đáp án đúng
      let correctAnswer = question.correctAnswer;
      if (typeof correctAnswer === 'string' && correctAnswer.startsWith('[')) {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch (e) {
          // Nếu không parse được, giữ nguyên giá trị
        }
      }

      return (
        <div className="space-y-3 mt-2">
          {answers.map((answer: any, index: number) => {
            const isCorrect = Array.isArray(correctAnswer)
              ? correctAnswer.includes(index)
              : correctAnswer === index;

            return (
              <div
                key={index}
                className={`p-3 rounded-md flex items-start gap-2 ${
                  isCorrect ? 'bg-primary-gold/20 border border-primary-gold/30' : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-primary-terracotta" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {typeof answer === 'string'
                      ? answer
                      : answer.content || `Đáp án ${index + 1}`}
                  </div>
                  {isCorrect && (
                    <Badge className="mt-1 bg-primary-gold text-nynus-dark">Đáp án đúng</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Lỗi khi hiển thị đáp án: {(error as Error).message}
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Chi tiết câu hỏi</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </Button>
          </div>
          <DialogDescription className="text-slate-400">
            Thông tin chi tiết về câu hỏi ID: {question._id}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="bg-slate-800 border-b border-slate-700 rounded-none px-2 w-full justify-start">
            <TabsTrigger value="general" className="data-[state=active]:bg-slate-700">
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-slate-700">
              Nội dung
            </TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-slate-700">
              Đáp án
            </TabsTrigger>
            {question.solution && (
              <TabsTrigger value="solution" className="data-[state=active]:bg-slate-700">
                Lời giải
              </TabsTrigger>
            )}
            {question.rawContent && (
              <TabsTrigger value="raw" className="data-[state=active]:bg-slate-700">
                Raw Content
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <TabsContent value="general" className="m-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">ID</h3>
                    <p className="mt-1">{question._id}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Loại câu hỏi</h3>
                    <p className="mt-1">
                      <Badge variant="outline">
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                    </p>
                  </div>

                  {question.questionID?.fullId && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Mã câu hỏi</h3>
                      <p className="mt-1">{question.questionID.fullId}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Ngày tạo</h3>
                      <p className="mt-1">{formatDate(question.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Cập nhật lần cuối</h3>
                      <p className="mt-1">{formatDate(question.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="m-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Nội dung câu hỏi</h3>
                    <div className="mt-2 p-4 bg-slate-800 rounded-md whitespace-pre-wrap">
                      {question.content}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="answers" className="m-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">Các đáp án</h3>
                    {renderAnswers()}
                  </div>
                </div>
              </TabsContent>

              {question.solution && (
                <TabsContent value="solution" className="m-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Lời giải</h3>
                      <div className="mt-2 p-4 bg-slate-800 rounded-md whitespace-pre-wrap">
                        {question.solution}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {question.rawContent && (
                <TabsContent value="raw" className="m-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Raw Content</h3>
                      <div className="mt-2 p-4 bg-slate-800 rounded-md overflow-x-auto">
                        <pre className="text-xs">{question.rawContent}</pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="bg-slate-800/50 border-t border-slate-700 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
