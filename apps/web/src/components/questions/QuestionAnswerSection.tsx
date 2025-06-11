'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

import { QuestionFormData } from './QuestionFormTabs';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import logger from '@/lib/utils/logger';

interface QuestionAnswerSectionProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
}

function getAnswerLabel(index: number): string {
  return String.fromCharCode(64 + (index + 1));
}

export function QuestionAnswerSection({ formData, setFormData }: QuestionAnswerSectionProps) {
  // Xác định loại câu hỏi
  const [questionType, setQuestionType] = useState<string>(formData.type || 'MC');

  // Cập nhật questionType khi formData.type thay đổi
  useEffect(() => {
    setQuestionType(formData.type || 'MC');

    // Log để debug
    logger.debug('QuestionAnswerSection - formData đã thay đổi:', {
      type: formData.type,
      answers: formData.answers?.length || 0,
      correctAnswer: formData.correctAnswer
    });
  }, [formData.type, formData.answers, formData.correctAnswer]);

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

      // Cập nhật correctAnswer
      let newCorrectAnswer = prev.correctAnswer;
      if (answer.isCorrect) {
        if (questionType === 'TF') {
          // Nếu là câu hỏi TF, correctAnswer là mảng
          if (Array.isArray(prev.correctAnswer)) {
            newCorrectAnswer = prev.correctAnswer.filter(a => a !== answer.content);
          }
        } else if (questionType === 'MC') {
          // Nếu là câu hỏi MC, correctAnswer là string
          if (prev.correctAnswer === answer.content) {
            newCorrectAnswer = '';
          }
        }
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
      let newCorrectAnswer = prev.correctAnswer;
      const answer = prevAnswers.find(a => a.id === id);

      if (answer?.isCorrect) {
        if (questionType === 'TF') {
          // Nếu là câu hỏi TF, correctAnswer là mảng
          if (Array.isArray(prev.correctAnswer)) {
            newCorrectAnswer = prev.correctAnswer.map(a =>
              a === answer.content ? content : a
            );
          }
        } else if (questionType === 'MC') {
          // Nếu là câu hỏi MC, correctAnswer là string
          if (prev.correctAnswer === answer.content) {
            newCorrectAnswer = content;
          }
        }
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
        correctAnswer: [answer.content], // Lưu dưới dạng mảng để phù hợp với API
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

  // Cập nhật đáp án tự luận, trả lời ngắn
  const handleTextAnswerChange = (answer: string) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: [answer] // Lưu dưới dạng mảng để phù hợp với API
    }));
  };

  // Kiểm tra đáp án đúng
  const isCorrectAnswer = (answerId: string): boolean => {
    // Đảm bảo formData.answers tồn tại
    const answers = formData.answers || [];
    const answer = answers.find(a => a.id === answerId);
    return !!answer?.isCorrect;
  };

  // Hiển thị phần đáp án dựa trên loại câu hỏi
  const renderAnswerSection = () => {
    switch (questionType) {
      case 'MC': // Multiple Choice
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">Đáp án trắc nghiệm</h3>

            {/* Hiển thị đáp án đúng */}
            {formData.correctAnswer && (
              <div className="mb-4 p-3 bg-primary-gold/10 dark:bg-green-500/10 border border-primary-gold/30 dark:border-green-500/30 rounded-md transition-colors duration-300">
                <div className="font-medium text-primary-terracotta dark:text-green-500 transition-colors duration-300">
                  Đáp án đúng: {Array.isArray(formData.correctAnswer)
                    ? formData.correctAnswer.join(', ')
                    : formData.correctAnswer}
                </div>
              </div>
            )}

            {/* Danh sách đáp án */}
            {(formData.answers || []).map((answer, index) => {
              const isCorrect = isCorrectAnswer(answer.id);

              return (
                <div
                  key={answer.id}
                  className={`p-4 border rounded-md relative ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50 bg-primary-gold/5 dark:bg-green-500/5' : 'border-primary-terracotta/20 dark:border-slate-700'} transition-colors duration-300`}
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
                      <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2 text-slate-800 dark:text-white transition-colors duration-300">
                        <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30' : 'bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white'} transition-colors duration-300`}>
                          {getAnswerLabel(index)}
                        </Badge>
                        {isCorrect && (
                          <Badge variant="outline" className="bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30 transition-colors duration-300">
                            Đáp án đúng
                          </Badge>
                        )}
                      </Label>
                      <Textarea
                        id={`answer-${answer.id}`}
                        value={answer.content}
                        onChange={(e) => updateAnswerContent(answer.id, e.target.value)}
                        placeholder="Nhập nội dung đáp án"
                        className={`min-h-[80px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300 ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50' : ''}`}
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
              className="w-full mt-2 bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700 transition-colors duration-300 hover:scale-105"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Thêm đáp án
            </Button>
          </div>
        );

      case 'TF': // True/False
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">Đáp án đúng/sai</h3>

            {/* Hiển thị đáp án đúng */}
            {formData.correctAnswer && (
              <div className="mb-4 p-3 bg-primary-gold/10 dark:bg-green-500/10 border border-primary-gold/30 dark:border-green-500/30 rounded-md transition-colors duration-300">
                <div className="font-medium text-primary-terracotta dark:text-green-500 transition-colors duration-300">
                  Đáp án đúng: {Array.isArray(formData.correctAnswer)
                    ? formData.correctAnswer.join(', ')
                    : formData.correctAnswer}
                </div>
              </div>
            )}

            {/* Danh sách đáp án */}
            {(formData.answers || []).map((answer, index) => {
              const isCorrect = isCorrectAnswer(answer.id);

              return (
                <div
                  key={answer.id}
                  className={`p-4 border rounded-md relative ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50 bg-primary-gold/5 dark:bg-green-500/5' : 'border-primary-terracotta/20 dark:border-slate-700'} transition-colors duration-300`}
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
                      <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2 text-slate-800 dark:text-white transition-colors duration-300">
                        <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30' : 'bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white'} transition-colors duration-300`}>
                          {getAnswerLabel(index)}
                        </Badge>
                        {isCorrect && (
                          <Badge variant="outline" className="bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30 transition-colors duration-300">
                            Đáp án đúng
                          </Badge>
                        )}
                      </Label>
                      <Textarea
                        id={`answer-${answer.id}`}
                        value={answer.content}
                        onChange={(e) => updateAnswerContent(answer.id, e.target.value)}
                        placeholder="Nhập nội dung đáp án"
                        className={`min-h-[80px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300 ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50' : ''}`}
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
              className="w-full mt-2 bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700 transition-colors duration-300 hover:scale-105"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Thêm đáp án
            </Button>
          </div>
        );

      case 'SA': // Short Answer
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-nynus-dark dark:text-white transition-colors duration-300">Đáp án trả lời ngắn</h3>
            <div className="mb-2 text-sm text-nynus-medium dark:text-slate-400 transition-colors duration-300">
              Nhập câu trả lời ngắn mà học sinh/sinh viên phải nhập chính xác để được tính là đúng
            </div>
            <Textarea
              id="short-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập đáp án trả lời ngắn (ví dụ: 42, Paris, H2O, etc.)"
              className="min-h-[80px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
            />
          </div>
        );

      case 'ES': // Essay
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-nynus-dark dark:text-white transition-colors duration-300">Đáp án tự luận</h3>
            <div className="mb-2 text-sm text-nynus-medium dark:text-slate-400 transition-colors duration-300">
              Nhập gợi ý đáp án tự luận cho giáo viên chấm điểm
            </div>
            <Textarea
              id="essay-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập gợi ý đáp án tự luận"
              className="min-h-[150px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
            />
          </div>
        );

      default:
        return (
          <div className="text-nynus-medium dark:text-slate-400 transition-colors duration-300">
            Không có thông tin đáp án cho loại câu hỏi này
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 bg-nynus-jade dark:bg-slate-950 border border-primary-terracotta/20 dark:border-slate-800 p-4 rounded-md transition-colors duration-300">
      {renderAnswerSection()}
    </div>
  );
}
