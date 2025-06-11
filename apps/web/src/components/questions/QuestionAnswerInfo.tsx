'use client';

import { Trash2, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { CorrectAnswerDisplay } from './CorrectAnswerDisplay';
import { QuestionFormData } from './QuestionFormTabs';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';



interface QuestionAnswerInfoProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
}

function getAnswerLabel(index: number): string {
  return String.fromCharCode(64 + (index + 1));
}

export function QuestionAnswerInfo({ formData, setFormData }: QuestionAnswerInfoProps) {
  // Xác định loại đáp án dựa vào loại câu hỏi
  type QuestionFormType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'essay';

  const [answerType, setAnswerType] = useState<QuestionFormType>(
    (formData.form as QuestionFormType) || 'multiple-choice'
  );

  // Cập nhật answerType khi formData.form thay đổi
  useEffect(() => {
    setAnswerType((formData.form as QuestionFormType) || 'multiple-choice');

    // Log để debug
    console.log('QuestionAnswerInfo - formData đã thay đổi:', {
      form: formData.form,
      type: formData.type,
      answers: formData.answers?.length || 0,
      correctAnswer: formData.correctAnswer
    });
  }, [formData.form, formData.answers, formData.correctAnswer]);

  // Cập nhật correctAnswer dựa trên content của answers có isCorrect là true
  const updateCorrectAnswerFromContent = (answers: QuestionFormData['answers']) => {
    // Đảm bảo answers tồn tại
    const safeAnswers = answers || [];
    const correctAnswers = safeAnswers.filter(a => a.isCorrect);

    if (answerType === 'true-false') {
      return correctAnswers.map(a => a.content); // Đã là mảng
    } else if (correctAnswers.length > 0) {
      return [correctAnswers[0].content]; // Chuyển thành mảng
    }

    return []; // Trả về mảng rỗng thay vì chuỗi rỗng
  };

  // Thêm đáp án mới
  const addAnswer = () => {
    let newId = "1";

    // Đảm bảo formData.answers tồn tại
    const answers = formData.answers || [];

    if (answers.length > 0) {
      const maxId = Math.max(...answers.map(a => parseInt(a.id) || 0)) || 0;
      newId = (maxId + 1).toString();
    }

    const newAnswer = {
      id: newId,
      content: '',
      isCorrect: false
    };

    setFormData(prev => ({
      ...prev,
      answers: [...(prev.answers || []), newAnswer]
    }));
  };

  // Xóa đáp án
  const removeAnswer = (id: string) => {
    // Đảm bảo formData.answers tồn tại
    const answers = formData.answers || [];
    const answer = answers.find(a => a.id === id);
    if (!answer) return;

    setFormData(prev => {
      // Đảm bảo prev.answers tồn tại
      const prevAnswers = prev.answers || [];

      // Xóa đáp án khỏi danh sách
      const newAnswers = prevAnswers.filter(a => a.id !== id);

      // Cập nhật correctAnswer dựa trên content
      let newCorrectAnswer = updateCorrectAnswerFromContent(newAnswers);

      // Đảm bảo correctAnswer luôn là mảng
      if (!Array.isArray(newCorrectAnswer)) {
        newCorrectAnswer = newCorrectAnswer ? [newCorrectAnswer] : [];
      }

      return {
        ...prev,
        answers: newAnswers,
        correctAnswer: newCorrectAnswer
      };
    });
  };

  // Cập nhật nội dung đáp án
  const updateAnswerContent = (id: string, content: string) => {
    setFormData(prev => {
      // Đảm bảo prev.answers tồn tại
      const prevAnswers = prev.answers || [];

      // Cập nhật nội dung đáp án
      const newAnswers = prevAnswers.map(a =>
        a.id === id ? { ...a, content } : a
      );

      // Cập nhật correctAnswer nếu đáp án này là đáp án đúng
      const answersWithUpdatedContent = newAnswers.map(a =>
        a.id === id ? { ...a, content } : a
      );

      let newCorrectAnswer = updateCorrectAnswerFromContent(answersWithUpdatedContent);

      // Đảm bảo correctAnswer luôn là mảng
      if (!Array.isArray(newCorrectAnswer)) {
        newCorrectAnswer = newCorrectAnswer ? [newCorrectAnswer] : [];
      }

      return {
        ...prev,
        answers: newAnswers,
        correctAnswer: newCorrectAnswer
      };
    });
  };

  // Đánh dấu đáp án đúng (đơn lẻ cho trắc nghiệm)
  const markCorrectAnswer = (id: string) => {
    // Đảm bảo formData.answers tồn tại
    const answers = formData.answers || [];
    const answer = answers.find(a => a.id === id);
    if (!answer) return;

    setFormData(prev => {
      // Đảm bảo prev.answers tồn tại
      const prevAnswers = prev.answers || [];

      const updatedAnswers = prevAnswers.map(a =>
        ({ ...a, isCorrect: a.id === id })
      );

      return {
        ...prev,
        correctAnswer: [answer.content], // Đảm bảo correctAnswer luôn là mảng
        answers: updatedAnswers
      };
    });
  };

  // Đánh dấu đáp án đúng (nhiều) - chỉ cho câu hỏi đúng/sai
  const toggleCorrectAnswer = (id: string, checked: boolean) => {
    // Đảm bảo formData.answers tồn tại
    const answers = formData.answers || [];
    const answer = answers.find(a => a.id === id);
    if (!answer) return;

    setFormData(prev => {
      // Đảm bảo prev.answers tồn tại
      const prevAnswers = prev.answers || [];

      const updatedAnswers = prevAnswers.map(a =>
        a.id === id ? { ...a, isCorrect: checked } : a
      );

      const correctContents = updatedAnswers
        .filter(a => a.isCorrect)
        .map(a => a.content);

      return {
        ...prev,
        correctAnswer: correctContents,
        answers: updatedAnswers
      };
    });
  };

  // Cập nhật đáp án tự luận, trả lời ngắn và ghép đôi
  const handleTextAnswerChange = (answer: string) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: [answer] // Đảm bảo correctAnswer luôn là mảng
    }));
  };

  // Kiểm tra đáp án đúng
  const isCorrectAnswer = (answerId: string): boolean => {
    // Đảm bảo formData.answers tồn tại
    const answers = formData.answers || [];
    const answer = answers.find(a => a.id === answerId);
    return !!answer?.isCorrect;
  };

  return (
    <div className="space-y-6 bg-slate-950 border border-slate-800 p-4 rounded-md">
      <div>
        <h3 className="text-lg font-medium mb-4">Đáp án</h3>

        <div className="mb-4">
          <Label className="mb-2 block">Loại câu hỏi: <span className="font-semibold">{
            {
              'multiple-choice': 'Trắc nghiệm',
              'true-false': 'Đúng/Sai',
              'short-answer': 'Trả lời ngắn',
              'matching': 'Ghép đôi',
              'essay': 'Tự luận'
            }[answerType]
          }</span></Label>
        </div>

        {answerType === 'multiple-choice' ? (
          <>
            {/* Hiển thị đáp án đúng */}
            <div className="mb-4">
              <CorrectAnswerDisplay formData={formData} />
            </div>

            <div className="space-y-4">
              {(formData.answers || []).map((answer, index) => {
                const isCorrect = isCorrectAnswer(answer.id);

                return (
                  <div
                    key={answer.id}
                    className={`p-4 border rounded-md relative ${isCorrect ? 'border-green-500/50 bg-green-500/5' : ''}`}
                  >
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAnswer(answer.id)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="pt-2">
                        <RadioGroup
                          value={isCorrect ? answer.id : ''}
                          onValueChange={markCorrectAnswer}
                        >
                          <RadioGroupItem
                            value={answer.id}
                            id={`answer-correct-${answer.id}`}
                          />
                        </RadioGroup>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-slate-800'}`}>
                              {getAnswerLabel(index)}
                            </Badge>
                            {isCorrect && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        </Label>
                        <Textarea
                          id={`answer-${answer.id}`}
                          value={answer.content}
                          onChange={(e) => updateAnswerContent(answer.id, e.target.value)}
                          placeholder="Nhập nội dung đáp án"
                          className={`min-h-[80px] bg-black text-white border-slate-700 ${isCorrect ? 'border-green-500/50' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                variant="outline"
                onClick={addAnswer}
                type="button"
                className="w-full mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Thêm đáp án
              </Button>
            </div>
          </>
        ) : answerType === 'true-false' ? (
          <>
            {/* Hiển thị đáp án đúng cho câu hỏi Đúng/Sai */}
            <div className="mb-4">
              <CorrectAnswerDisplay formData={formData} />
            </div>

            <div className="space-y-4">
              {(formData.answers || []).map((answer, index) => {
                const isCorrect = isCorrectAnswer(answer.id);

                return (
                  <div
                    key={answer.id}
                    className={`p-4 border rounded-md relative ${isCorrect ? 'border-green-500/50 bg-green-500/5' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="pt-2">
                        <Checkbox
                          checked={isCorrect}
                          id={`answer-correct-${answer.id}`}
                          onCheckedChange={(checked) => toggleCorrectAnswer(answer.id, checked as boolean)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-slate-800'}`}>
                              {getAnswerLabel(index)}
                            </Badge>
                            {isCorrect && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        </Label>
                        <div className="p-4 bg-black text-white border border-slate-700 rounded-md">
                          {answer.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : answerType === 'short-answer' ? (
          <div className="space-y-4">
            <Label htmlFor="short-answer">Đáp án trả lời ngắn</Label>
            <div className="mb-2 text-sm text-muted-foreground">
              Nhập câu trả lời ngắn mà học sinh/sinh viên phải nhập chính xác để được tính là đúng
            </div>
            <Textarea
              id="short-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập đáp án trả lời ngắn (ví dụ: 42, Paris, H2O, etc.)"
              className="min-h-[80px] bg-black text-white border-slate-700"
            />
          </div>
        ) : answerType === 'matching' ? (
          <div className="space-y-4">
            <Label>Đáp án ghép đôi</Label>
            <div className="mb-2 text-sm text-muted-foreground">
              Nhập các cặp ghép đôi, mỗi cặp trên một dòng theo định dạng &ldquo;Mục bên trái ⟷ Mục bên phải&rdquo;
            </div>
            <Textarea
              value={Array.isArray(formData.correctAnswer)
                ? formData.correctAnswer.join('\n')
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => {
                const pairsArray = e.target.value.split('\n').filter(line => line.trim());
                setFormData(prev => ({
                  ...prev,
                  correctAnswer: pairsArray
                }));
              }}
              placeholder="Ví dụ:\nParis ⟷ Pháp\nLondon ⟷ Anh\nBerlin ⟷ Đức"
              className="min-h-[150px] bg-black text-white border-slate-700"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="essay-answer">Đáp án tự luận</Label>
            <div className="mb-2 text-sm text-muted-foreground">
              Nhập gợi ý đáp án tự luận cho giáo viên chấm điểm
            </div>
            <Textarea
              id="essay-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập gợi ý đáp án tự luận"
              className="min-h-[150px] bg-black text-white border-slate-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}