'use client';

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

import { QuestionFormData } from "./QuestionFormTabs";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";




type QuestionContentInfoProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
};

export function QuestionContentInfo({ formData, setFormData }: QuestionContentInfoProps) {
  const [previewQuestion, setPreviewQuestion] = useState<string | null>(null);
  const [previewSolution, setPreviewSolution] = useState<string | null>(null);
  const [isQuestionImageLoading, setIsQuestionImageLoading] = useState(false);
  const [isSolutionImageLoading, setIsSolutionImageLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<{question?: string; solution?: string}>({});

  // Cleanup preview URLs khi component unmount
  useEffect(() => {
    return () => {
      // Xóa các preview khi component unmount để tránh memory leak
      setPreviewQuestion(null);
      setPreviewSolution(null);
    };
  }, []);

  // Xử lý thay đổi nội dung
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi URL hình ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.replace('images_', '');

    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [field]: value || null,
      },
    }));
  };

  // Xử lý xem trước hình ảnh
  const handlePreviewImage = (type: 'question' | 'solution') => {
    // Reset error state
    setImageErrors(prev => ({...prev, [type]: undefined}));

    if (type === 'question') {
      if (!formData.images.questionImage) return;
      setIsQuestionImageLoading(true);
      setPreviewQuestion(formData.images.questionImage);
    } else {
      if (!formData.images.solutionImage) return;
      setIsSolutionImageLoading(true);
      setPreviewSolution(formData.images.solutionImage);
    }
  };

  // Xử lý đóng xem trước
  const handleClosePreview = (type: 'question' | 'solution') => {
    if (type === 'question') {
      setPreviewQuestion(null);
    } else {
      setPreviewSolution(null);
    }
  };

  // Xử lý xóa URL hình ảnh
  const handleClearImage = (type: 'question' | 'solution') => {
    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [type === 'question' ? 'questionImage' : 'solutionImage']: null,
      },
    }));

    if (type === 'question') {
      setPreviewQuestion(null);
    } else {
      setPreviewSolution(null);
    }
  };

  return (
    <div className="space-y-8 bg-slate-950 border border-slate-800 p-4 rounded-md">
      {/* Nội dung câu hỏi */}
      <div>
        <div className="flex flex-col gap-1.5 mb-4">
          <h3 className="text-lg font-medium">Nội dung câu hỏi</h3>
          <p className="text-sm text-muted-foreground">
            Nội dung hiển thị và định dạng cho câu hỏi
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rawContent">Nội dung gốc (LaTeX)</Label>
            <Textarea
              id="rawContent"
              name="rawContent"
              value={formData.rawContent}
              onChange={handleContentChange}
              placeholder="Nhập nội dung LaTeX của câu hỏi"
              rows={6}
              className="font-mono bg-black text-white border-slate-700"
            />
            <p className="text-xs text-muted-foreground">
              Nội dung gốc dạng LaTeX, được sử dụng để lưu trữ và render
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung hiển thị</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Nội dung câu hỏi đã qua xử lý"
              rows={6}
              className="bg-black text-white border-slate-700"
            />
            <p className="text-xs text-muted-foreground">
              Nội dung sẽ được hiển thị cho người dùng sau khi xử lý
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">Lời giải</Label>
            <Textarea
              id="solution"
              name="solution"
              value={formData.solution || ''}
              onChange={handleContentChange}
              placeholder="Lời giải chi tiết cho câu hỏi"
              rows={6}
              className="bg-black text-white border-slate-700"
            />
            <p className="text-xs text-muted-foreground">
              Giải thích đáp án và cách giải câu hỏi
            </p>
          </div>
        </div>
      </div>

      {/* Hình ảnh */}
      <div>
        <div className="flex flex-col gap-1.5 mb-4">
          <h3 className="text-lg font-medium">Hình ảnh</h3>
          <p className="text-sm text-muted-foreground">
            Thêm hình ảnh cho câu hỏi và lời giải (nếu có)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hình ảnh câu hỏi */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images_questionImage">Hình ảnh câu hỏi</Label>
              <div className="flex gap-2">
                <Input
                  id="images_questionImage"
                  name="images_questionImage"
                  value={formData.images.questionImage || ''}
                  onChange={handleImageChange}
                  placeholder="URL hình ảnh câu hỏi"
                  className="flex-1 bg-black text-white border-slate-700"
                />
                {formData.images.questionImage && (
                  <button
                    type="button"
                    onClick={() => handleClearImage('question')}
                    className="p-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 focus:outline-none"
                    title="Xóa hình ảnh"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {formData.images.questionImage ? (
                <button
                  type="button"
                  onClick={() => handlePreviewImage('question')}
                  className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm inline-flex items-center gap-1"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Xem trước
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nhập URL của hình ảnh câu hỏi. Hỗ trợ các định dạng: JPG, PNG, GIF, WebP.
                </p>
              )}
            </div>

            {previewQuestion && (
              <div className="rounded-md border overflow-hidden relative">
                <div className="absolute top-2 right-2 z-10">
                  <button
                    type="button"
                    onClick={() => handleClosePreview('question')}
                    className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-56 w-full relative">
                  {isQuestionImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="text-sm text-white">Đang tải...</span>
                    </div>
                  )}
                  {imageErrors.question && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                      <span className="text-sm text-red-400">{imageErrors.question}</span>
                    </div>
                  )}
                  <Image
                    src={previewQuestion}
                    alt="Hình ảnh câu hỏi"
                    fill
                    className="object-contain"
                    onLoadingComplete={() => setIsQuestionImageLoading(false)}
                    onError={() => {
                      setIsQuestionImageLoading(false);
                      setImageErrors(prev => ({...prev, question: 'Không thể tải hình ảnh. Vui lòng kiểm tra URL.'}));
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hình ảnh lời giải */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images_solutionImage">Hình ảnh lời giải</Label>
              <div className="flex gap-2">
                <Input
                  id="images_solutionImage"
                  name="images_solutionImage"
                  value={formData.images.solutionImage || ''}
                  onChange={handleImageChange}
                  placeholder="URL hình ảnh lời giải"
                  className="flex-1 bg-black text-white border-slate-700"
                />
                {formData.images.solutionImage && (
                  <button
                    type="button"
                    onClick={() => handleClearImage('solution')}
                    className="p-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 focus:outline-none"
                    title="Xóa hình ảnh"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {formData.images.solutionImage ? (
                <button
                  type="button"
                  onClick={() => handlePreviewImage('solution')}
                  className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm inline-flex items-center gap-1"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Xem trước
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nhập URL của hình ảnh lời giải. Hỗ trợ các định dạng: JPG, PNG, GIF, WebP.
                </p>
              )}
            </div>

            {previewSolution && (
              <div className="rounded-md border overflow-hidden relative">
                <div className="absolute top-2 right-2 z-10">
                  <button
                    type="button"
                    onClick={() => handleClosePreview('solution')}
                    className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-56 w-full relative">
                  {isSolutionImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="text-sm text-white">Đang tải...</span>
                    </div>
                  )}
                  {imageErrors.solution && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                      <span className="text-sm text-red-400">{imageErrors.solution}</span>
                    </div>
                  )}
                  <Image
                    src={previewSolution}
                    alt="Hình ảnh lời giải"
                    fill
                    className="object-contain"
                    onLoadingComplete={() => setIsSolutionImageLoading(false)}
                    onError={() => {
                      setIsSolutionImageLoading(false);
                      setImageErrors(prev => ({...prev, solution: 'Không thể tải hình ảnh. Vui lòng kiểm tra URL.'}));
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 border rounded-md bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Lưu ý về hình ảnh</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Sử dụng URL từ các dịch vụ lưu trữ hình ảnh đáng tin cậy</li>
            <li>Đảm bảo URL trỏ trực tiếp đến tệp hình ảnh, không phải trang web chứa hình ảnh</li>
            <li>Kích thước hình ảnh tối ưu nên nhỏ hơn 500KB để tải nhanh</li>
            <li>Nên sử dụng định dạng WebP để tối ưu kích thước và chất lượng</li>
          </ul>
        </div>
      </div>
    </div>
  );
}