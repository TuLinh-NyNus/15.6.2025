'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { SubcountDetails, ExtractedAnswer } from '@/lib/types/latex-parser';
import { ExtractedQuestion } from '@/lib/utils/latex-parser';
import { extractFromLatex, extractSubcount, extractSolutions } from '@/lib/utils/latex-parser';
import {
  isBalancedBrackets,
  extractContentFromBrackets,
  extractEnvironmentContent,
  extractOptionalParameters,
  isValidLatexElement
} from '@/lib/utils/latex-parser-brackets';

interface TestResult {
  isBalanced: boolean;
  extractedContent: string[];
  environmentContent: string[];
  optionalParams: string[];
  isValidElement: boolean;
  extractedQuestion: ExtractedQuestion | null;
  subcount: SubcountDetails | null;
  solutions: string[];
}

export function LatexBracketTester() {
  const [latexInput, setLatexInput] = useState('');
  const [command, setCommand] = useState('\\question');
  const [environment, setEnvironment] = useState('ex');
  const [result, setResult] = useState<TestResult | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);

  const handleTest = () => {
    try {
      setError(null);

      // Kiểm tra cân bằng dấu ngoặc
      const isBalanced = isBalancedBrackets(latexInput);

      // Trích xuất nội dung từ dấu ngoặc
      const extractedContent = extractContentFromBrackets(latexInput, command);

      // Trích xuất nội dung từ môi trường
      const environmentContent = extractEnvironmentContent(latexInput, environment);

      // Trích xuất tham số tùy chọn
      const optionalParams = extractOptionalParameters(latexInput, command);

      // Kiểm tra phần tử hợp lệ
      const isValidElement = isValidLatexElement(latexInput, environment);

      // Trích xuất câu hỏi đầy đủ
      let extractedQuestion = null;
      try {
        extractedQuestion = extractFromLatex(latexInput);
      } catch (err) {
        const error = err as Error;
        console.error('Lỗi khi trích xuất câu hỏi:', error);
      }

      // Trích xuất Subcount độc lập
      const subcount = extractSubcount(latexInput);

      // Trích xuất lời giải độc lập
      const solutions = extractSolutions(latexInput);

      setResult({
        isBalanced,
        extractedContent,
        environmentContent,
        optionalParams,
        isValidElement,
        extractedQuestion,
        subcount,
        solutions
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Đã xảy ra lỗi khi xử lý LaTeX');
      console.error(error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Kiểm tra dấu ngoặc LaTeX</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latex-input">Nhập nội dung LaTeX</Label>
            <Textarea
              id="latex-input"
              placeholder="Nhập nội dung LaTeX để kiểm tra..."
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              className="min-h-[200px] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="command">Lệnh LaTeX</Label>
              <Input
                id="command"
                placeholder="\\question, \\loigiai, ..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Môi trường LaTeX</Label>
              <Input
                id="environment"
                placeholder="ex, choice, ..."
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleTest}>Kiểm tra LaTeX</Button>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600">
              {error}
            </div>
          )}
        </div>

        {result && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="basic">Kiểm tra cơ bản</TabsTrigger>
              <TabsTrigger value="content">Nội dung trích xuất</TabsTrigger>
              <TabsTrigger value="environment">Môi trường</TabsTrigger>
              <TabsTrigger value="question">Câu hỏi</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <p className="font-medium">Kiểm tra cân bằng dấu ngoặc:</p>
                  <Badge variant={result.isBalanced ? "default" : "destructive"}>
                    {result.isBalanced ? "Cân bằng" : "Không cân bằng"}
                  </Badge>
                </div>

                <div className="p-4 border rounded-md">
                  <p className="font-medium">Kiểm tra môi trường {environment}:</p>
                  <Badge variant={result.isValidElement ? "default" : "destructive"}>
                    {result.isValidElement ? "Hợp lệ" : "Không hợp lệ"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 border rounded-md mt-4">
                <p className="font-medium">Subcount (Trích xuất độc lập):</p>
                {result?.subcount ? (
                  <div className="flex flex-wrap gap-4 mt-2">
                    <Badge>FullID: {result.subcount.fullId || 'N/A'}</Badge>
                    <Badge variant="outline">Prefix: {result.subcount.prefix || 'N/A'}</Badge>
                    <Badge variant="outline">Number: {result.subcount.number || 'N/A'}</Badge>
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-2">Không tìm thấy Subcount</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="content" className="pt-4">
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Nội dung từ lệnh {command}:</p>
                  {result.extractedContent.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {result.extractedContent.map((content, index) => (
                        <div key={index} className="p-2 border rounded-md">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Không tìm thấy nội dung</p>
                  )}
                </div>

                <div>
                  <p className="font-medium">Lời giải trích xuất (hàm chuyên dụng):</p>
                  {result.solutions.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {result.solutions.map((solution, index) => (
                        <div key={index} className="p-2 border rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                          <p className="font-medium text-sm mb-1">Lời giải {index + 1}:</p>
                          <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[300px]">{solution}</pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Không tìm thấy lời giải</p>
                  )}
                </div>

                <div>
                  <p className="font-medium">Tham số tùy chọn từ lệnh {command}:</p>
                  {result.optionalParams.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {result.optionalParams.map((param, index) => (
                        <div key={index} className="p-2 border rounded-md">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{param}</pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Không tìm thấy tham số tùy chọn</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="environment" className="pt-4">
              <div>
                <p className="font-medium">Nội dung từ môi trường {environment}:</p>
                {result.environmentContent.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {result.environmentContent.map((content, index) => (
                      <div key={index} className="p-2 border rounded-md">
                        <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[300px]">{content}</pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Không tìm thấy môi trường</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="question" className="pt-4">
              {result.extractedQuestion ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <p className="font-medium">Loại câu hỏi:</p>
                      <Badge>{result.extractedQuestion.type}</Badge>
                    </div>

                    <div className="p-4 border rounded-md">
                      <p className="font-medium">ID câu hỏi:</p>
                      <Badge variant="outline">{result.extractedQuestion.questionId || "Không có"}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <p className="font-medium">Subcount:</p>
                      {result.extractedQuestion?.subcount ? (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Full ID:</span>
                            <Badge variant="outline">{result.extractedQuestion.subcount.fullId || 'N/A'}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Prefix:</span>
                            <Badge variant="secondary">{result.extractedQuestion.subcount.prefix || 'N/A'}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Number:</span>
                            <Badge variant="secondary">{result.extractedQuestion.subcount.number || 'N/A'}</Badge>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic mt-2">Không tìm thấy Subcount</p>
                      )}
                    </div>

                    <div className="p-4 border rounded-md">
                      <p className="font-medium">Nguồn:</p>
                      {result.extractedQuestion.source ? (
                        <p className="mt-2">{result.extractedQuestion.source}</p>
                      ) : (
                        <p className="text-gray-500 italic mt-2">Không tìm thấy nguồn</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <p className="font-medium">Nội dung câu hỏi:</p>
                    <div className="whitespace-pre-wrap mt-2">{result.extractedQuestion.content}</div>
                  </div>

                  {result.extractedQuestion.solutions && result.extractedQuestion.solutions.length > 0 && (
                    <div className="p-4 border rounded-md">
                      <p className="font-medium">Lời giải ({result.extractedQuestion.solutions ? result.extractedQuestion.solutions.length : 0}):</p>
                      <div className="space-y-2 mt-2">
                        {result.extractedQuestion.solutions?.map((solution: string, index: number) => (
                          <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                            <pre className="whitespace-pre-wrap font-mono text-sm">{solution}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.extractedQuestion.answers.length > 0 && (
                    <div className="p-4 border rounded-md">
                      <p className="font-medium">Đáp án ({result.extractedQuestion.answers.length}):</p>
                      <div className="space-y-2 mt-2">
                        {result.extractedQuestion.answers.map((answer: ExtractedAnswer, index: number) => (
                          <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md flex gap-2">
                            <Badge variant={answer.isCorrect ? "default" : "secondary"}>
                              {String.fromCharCode(65 + index)}
                            </Badge>
                            <div className="whitespace-pre-wrap">{answer.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 border rounded-md">
                    <p className="font-medium">Đối tượng đầy đủ:</p>
                    <pre className="whitespace-pre-wrap font-mono text-xs overflow-auto max-h-[300px] mt-2">
                      {JSON.stringify(result.extractedQuestion, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Không thể trích xuất câu hỏi</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <p className="text-xs text-gray-500">
          Công cụ này giúp kiểm tra và trích xuất nội dung từ các dấu ngoặc lồng nhau trong LaTeX.
          Nó phân tích cú pháp và xác minh tính hợp lệ của các lệnh và môi trường LaTeX.
        </p>
      </CardFooter>
    </Card>
  );
}