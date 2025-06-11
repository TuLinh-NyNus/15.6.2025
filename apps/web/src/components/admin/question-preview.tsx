'use client';

import { CheckCircle } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'essay' | 'unknown';

interface ParsedQuestion {
  type: QuestionType;
  content: string;
  choices?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  shortAnswer?: string;
  matches?: {
    items: string[];
    answers: string[];
  };
}

interface QuestionPreviewProps {
  content: string;
}

export function QuestionPreview({ content }: QuestionPreviewProps) {
  const [parsedQuestion, setParsedQuestion] = useState<ParsedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!content) {
      setParsedQuestion(null);
      setError(null);
      return;
    }

    try {
      // Xác định môi trường và trích xuất nội dung
      const envMatch = content.match(/\\begin\{(ex|bt)\}([\s\S]*?)\\end\{\1\}/);
      if (!envMatch) {
        throw new Error('Không tìm thấy môi trường câu hỏi hợp lệ (ex hoặc bt)');
      }

      const env = envMatch[1];
      const questionContent = envMatch[2].trim();

      if (env === 'bt') {
        // Môi trường bt luôn là bài tập tự luận
        setParsedQuestion({
          type: 'essay',
          content: questionContent,
        });
      } else if (env === 'ex') {
        // Xác định loại câu hỏi trong môi trường ex
        if (questionContent.includes('\\choiceTF')) {
          // Trắc nghiệm Đúng/Sai
          const regex = /\\choiceTF\{(.*?)\}(\[correct\])?/g;
          let match;
          const choices = [];
          let contentText = questionContent;

          while ((match = regex.exec(questionContent)) !== null) {
            choices.push({
              text: match[1],
              isCorrect: !!match[2]
            });
            contentText = contentText.replace(match[0], '');
          }

          setParsedQuestion({
            type: 'true-false',
            content: contentText.trim(),
            choices
          });
        } else if (questionContent.includes('\\choice')) {
          // Trắc nghiệm nhiều phương án
          const regex = /\\choice\{(.*?)\}(\[correct\])?/g;
          let match;
          const choices = [];
          let contentText = questionContent;

          while ((match = regex.exec(questionContent)) !== null) {
            choices.push({
              text: match[1],
              isCorrect: !!match[2]
            });
            contentText = contentText.replace(match[0], '');
          }

          setParsedQuestion({
            type: 'multiple-choice',
            content: contentText.trim(),
            choices
          });
        } else if (questionContent.includes('\\shortans')) {
          // Câu trả lời ngắn
          const shortAnsMatch = questionContent.match(/\\shortans\{(.*?)\}/);
          const shortAnswer = shortAnsMatch ? shortAnsMatch[1] : '';

          // Lấy phần content (không bao gồm đáp án)
          let contentText = questionContent;
          if (shortAnsMatch) {
            contentText = contentText.replace(shortAnsMatch[0], '');
          }

          setParsedQuestion({
            type: 'short-answer',
            content: contentText.trim(),
            shortAnswer
          });
        } else if (questionContent.includes('\\match') && questionContent.includes('\\with')) {
          // Câu ghép đôi
          const matchRegex = /\\match\{(.*?)\}/g;
          const withRegex = /\\with\{(.*?)\}/g;
          const matchItems = [];
          const withItems = [];
          let matchMatch;
          let withMatch;
          let contentText = questionContent;

          while ((matchMatch = matchRegex.exec(questionContent)) !== null) {
            matchItems.push(matchMatch[1]);
            contentText = contentText.replace(matchMatch[0], '');
          }

          while ((withMatch = withRegex.exec(questionContent)) !== null) {
            withItems.push(withMatch[1]);
            contentText = contentText.replace(withMatch[0], '');
          }

          setParsedQuestion({
            type: 'matching',
            content: contentText.trim(),
            matches: {
              items: matchItems,
              answers: withItems
            }
          });
        } else {
          // Trường hợp khác hoặc không xác định
          setParsedQuestion({
            type: 'essay',
            content: questionContent
          });
        }
      }

      setError(null);
    } catch (err) {
      console.error('Lỗi phân tích câu hỏi:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi phân tích câu hỏi');
      setParsedQuestion(null);
    }
  }, [content]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!parsedQuestion) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Chưa có nội dung câu hỏi để hiển thị
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {parsedQuestion.type === 'multiple-choice' && 'Trắc nghiệm nhiều phương án'}
          {parsedQuestion.type === 'true-false' && 'Trắc nghiệm Đúng/Sai'}
          {parsedQuestion.type === 'short-answer' && 'Câu trả lời ngắn'}
          {parsedQuestion.type === 'matching' && 'Câu ghép đôi'}
          {parsedQuestion.type === 'essay' && 'Bài tự luận / Essay'}
          {parsedQuestion.type === 'unknown' && 'Không xác định'}
        </Badge>
      </div>

      <Card className="p-6">
        <div className="question-content mb-6">
          {/* Hiển thị nội dung câu hỏi */}
          <div className="whitespace-pre-line">{parsedQuestion.content}</div>
        </div>

        {/* Hiển thị các lựa chọn cho câu hỏi trắc nghiệm */}
        {(['multiple-choice', 'true-false'].includes(parsedQuestion.type) && parsedQuestion.choices) && (
          <div className="space-y-3">
            <h3 className="font-medium">Các phương án:</h3>
            <div className="space-y-2">
              {parsedQuestion.choices.map((choice, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded-md ${choice.isCorrect ? 'bg-green-50 dark:bg-green-950' : ''}`}
                >
                  {choice.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-gray-300 shrink-0 mt-0.5" />
                  )}
                  <div>{choice.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị đáp án cho câu trả lời ngắn */}
        {parsedQuestion.type === 'short-answer' && parsedQuestion.shortAnswer && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Đáp án:</h3>
            <div className="p-2 bg-green-50 dark:bg-green-950 rounded-md">
              {parsedQuestion.shortAnswer}
            </div>
          </div>
        )}

        {/* Hiển thị các cặp ghép đôi */}
        {parsedQuestion.type === 'matching' && parsedQuestion.matches && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Các cặp ghép đôi:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Mục</h4>
                {parsedQuestion.matches.items.map((item, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    {item}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Đáp án</h4>
                {parsedQuestion.matches.answers.map((answer, index) => (
                  <div key={index} className="p-2 border rounded-md">
                    {answer}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}