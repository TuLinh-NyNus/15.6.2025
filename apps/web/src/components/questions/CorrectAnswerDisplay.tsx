'use client';
import { QuestionFormData } from './QuestionFormTabs';

import { Badge } from '@/components/ui/badge';

interface CorrectAnswerDisplayProps {
  formData: QuestionFormData;
}

function getAnswerLabel(index: number): string {
  return String.fromCharCode(64 + (index + 1));
}

export function CorrectAnswerDisplay({ formData }: CorrectAnswerDisplayProps) {
  // Log để debug
  console.log('CorrectAnswerDisplay - formData:', {
    answers: formData.answers?.length || 0,
    correctAnswer: formData.correctAnswer
  });

  // Lọc ra những đáp án đúng dựa trên thuộc tính isCorrect
  const correctLabelsWithContent = (formData.answers || [])
    .map((answer, index) => {
      if (answer?.isCorrect) {
        return {
          label: getAnswerLabel(index),
          content: answer.content
        };
      }
      return null;
    })
    .filter(Boolean);

  if (correctLabelsWithContent.length === 0) {
    return (
      <div className="text-nynus-medium mb-4 text-sm">
        Chưa có đáp án đúng nào được chọn
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="font-medium text-white flex items-center gap-2">
        <Badge className="bg-primary-gold text-nynus-dark">Đáp án đúng</Badge>
      </div>
      <div className="pl-2 border-l-2 border-primary-gold/50 space-y-2">
        {correctLabelsWithContent.map((item, index) => (
          <div key={index} className="bg-primary-gold/5 border border-primary-gold/20 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Badge className="bg-primary-gold/20 text-primary-terracotta border-primary-gold/30 shrink-0">
                {item?.label}
              </Badge>
              <div className="text-white">
                {item?.content || ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}