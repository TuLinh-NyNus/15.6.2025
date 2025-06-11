"use client";

import { ArrowLeft, Info, Plus, Send, Tag, Upload, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
interface FormData {
  title: string;
  content: string;
  category: string;
  subCategory: string;
  tags: string[];
  files: File[];
}

export default function CreateDiscussionPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: '',
    subCategory: '',
    tags: [],
    files: []
  });

  const [newTag, setNewTag] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData({ ...formData, files: [...formData.files, ...newFiles] });

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    const updatedFiles = [...formData.files];
    updatedFiles.splice(index, 1);

    const updatedPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(updatedPreviewUrls[index]);
    updatedPreviewUrls.splice(index, 1);

    setFormData({ ...formData, files: updatedFiles });
    setPreviewUrls(updatedPreviewUrls);
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert('Vui lòng điền đầy đủ thông tin cần thiết!');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      alert('Bài viết đã được đăng thành công!');
      setIsSubmitting(false);
      // Here would normally redirect to the new post
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20">
      <main className="container px-4 pt-6 pb-16 mx-auto max-w-3xl">
        <div className="flex flex-col gap-6">
          {/* Back button */}
          <div>
            <Link href="/thao-luan" className="inline-flex items-center text-sm text-muted-foreground hover:text-purple-400 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại diễn đàn
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Tạo bài thảo luận mới</h1>
            <p className="text-muted-foreground">Chia sẻ câu hỏi, kinh nghiệm hoặc kiến thức của bạn với cộng đồng</p>
          </div>

          <div className="mb-6 flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className="bg-primary/10 text-primary">HS</AvatarFallback>
              <AvatarImage src="/images/avatars/avatar-1.png" alt="Avatar" />
            </Avatar>
            <div>
              <p className="font-medium">Nguyễn Văn A</p>
              <p className="text-sm text-muted-foreground">Học sinh tiêu biểu</p>
            </div>
          </div>

          <Card className="p-6 border-purple-500/20 bg-background/50 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                  required
                />
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lop-10">Lớp 10</SelectItem>
                      <SelectItem value="lop-11">Lớp 11</SelectItem>
                      <SelectItem value="lop-12">Lớp 12</SelectItem>
                      <SelectItem value="tuyen-sinh-10">Tuyển sinh 10</SelectItem>
                      <SelectItem value="tu-van-chon-nganh">Tư vấn chọn ngành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subcategory" className="block text-sm font-medium">
                    Danh mục phụ
                  </label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                    disabled={!formData.category}
                  >
                    <SelectTrigger className="bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30">
                      <SelectValue placeholder="Chọn danh mục phụ" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.category === 'lop-10' && (
                        <>
                          <SelectItem value="toan-hoc">Toán học</SelectItem>
                          <SelectItem value="vat-ly">Vật lý</SelectItem>
                          <SelectItem value="hoa-hoc">Hóa học</SelectItem>
                          <SelectItem value="ngu-van">Ngữ văn</SelectItem>
                          <SelectItem value="tieng-anh">Tiếng Anh</SelectItem>
                        </>
                      )}
                      {formData.category === 'lop-11' && (
                        <>
                          <SelectItem value="toan-hoc">Toán học</SelectItem>
                          <SelectItem value="vat-ly">Vật lý</SelectItem>
                          <SelectItem value="hoa-hoc">Hóa học</SelectItem>
                          <SelectItem value="ngu-van">Ngữ văn</SelectItem>
                          <SelectItem value="tieng-anh">Tiếng Anh</SelectItem>
                        </>
                      )}
                      {formData.category === 'lop-12' && (
                        <>
                          <SelectItem value="toan-hoc">Toán học</SelectItem>
                          <SelectItem value="vat-ly">Vật lý</SelectItem>
                          <SelectItem value="hoa-hoc">Hóa học</SelectItem>
                          <SelectItem value="ngu-van">Ngữ văn</SelectItem>
                          <SelectItem value="tieng-anh">Tiếng Anh</SelectItem>
                          <SelectItem value="thpt-quoc-gia">THPT Quốc Gia</SelectItem>
                        </>
                      )}
                      {formData.category === 'tuyen-sinh-10' && (
                        <>
                          <SelectItem value="thong-tin-thi">Thông tin thi</SelectItem>
                          <SelectItem value="on-tap">Ôn tập</SelectItem>
                          <SelectItem value="kinh-nghiem">Kinh nghiệm</SelectItem>
                        </>
                      )}
                      {formData.category === 'tu-van-chon-nganh' && (
                        <>
                          <SelectItem value="nganh-ky-thuat">Ngành kỹ thuật</SelectItem>
                          <SelectItem value="nganh-kinh-te">Ngành kinh tế</SelectItem>
                          <SelectItem value="nganh-y-duoc">Ngành y dược</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="content"
                  placeholder="Nội dung bài viết..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[250px] bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Bạn có thể sử dụng Markdown để định dạng văn bản.
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 inline ml-1"
                        >
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p><strong>**Đậm**</strong> hoặc <strong>__Đậm__</strong></p>
                          <p><em>*Nghiêng*</em> hoặc <em>_Nghiêng_</em></p>
                          <p># Tiêu đề lớn</p>
                          <p>## Tiêu đề nhỏ hơn</p>
                          <p>- Danh sách</p>
                          <p>1. Danh sách có số</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label htmlFor="tags" className="block text-sm font-medium">
                  Thẻ
                </label>
                <div className="flex">
                  <Input
                    id="tags"
                    placeholder="Thêm thẻ..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30 rounded-r-none"
                  />
                  <Button
                    type="button"
                    className="rounded-l-none bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={addTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="pr-1.5 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        className="ml-1 rounded-full hover:bg-purple-800/20 p-0.5"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.tags.length === 0 && (
                    <span className="text-xs text-muted-foreground">Thêm thẻ để phân loại bài viết của bạn</span>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label htmlFor="files" className="block text-sm font-medium">
                  Tải lên hình ảnh
                </label>
                <div className="relative">
                  <Input
                    id="files"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-2 py-8 border-purple-500/20 hover:border-purple-500/40 bg-background/50"
                    onClick={() => document.getElementById('files')?.click()}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    <span>Kéo thả hoặc bấm để tải lên</span>
                  </Button>
                </div>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative rounded-md overflow-hidden aspect-video bg-black/10"
                      >
                        <Image
                          src={url}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                          width={300}
                          height={200}
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 rounded-full bg-black/50 p-1 hover:bg-black/70 transition-colors"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang đăng bài...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="mr-2 h-5 w-5" />
                      <span>Đăng bài</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-background overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl opacity-20" />
      </div>
    </div>
  );
}