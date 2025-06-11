'use client';
import { QuestionFormData } from "./QuestionFormTabs";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";



type QuestionBasicInfoProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
};

// Các loại câu hỏi
const questionTypes = [
  { value: 'MC', label: 'Trắc nghiệm' },
  { value: 'TF', label: 'Đúng/Sai' },
  { value: 'SA', label: 'Trả lời ngắn' },
  { value: 'MA', label: 'Ghép đôi' },
  { value: 'ES', label: 'Tự luận' },
];

// Các tag phổ biến
const popularTags = [
  { value: 'đại-số', label: 'Đại số' },
  { value: 'hình-học', label: 'Hình học' },
  { value: 'giải-tích', label: 'Giải tích' },
  { value: 'xác-suất', label: 'Xác suất' },
  { value: 'thống-kê', label: 'Thống kê' },
  { value: 'lượng-giác', label: 'Lượng giác' },
  { value: 'số-phức', label: 'Số phức' },
];

export function QuestionBasicInfo({ formData, setFormData }: QuestionBasicInfoProps) {
  // Xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi tags
  const handleTagsChange = (tags: string[]) => {
    setFormData((prev) => ({
      ...prev,
      tags
    }));
  };

  return (
    <div className="space-y-6 bg-nynus-jade dark:bg-slate-950 border border-primary-terracotta/20 dark:border-slate-800 p-4 rounded-md transition-colors duration-300">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">Thông tin cơ bản</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
          Nhập thông tin cơ bản của câu hỏi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-slate-800 dark:text-white transition-colors duration-300">Loại câu hỏi</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value)}
          >
            <SelectTrigger id="type" className="bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300">
              <SelectValue placeholder="Chọn loại câu hỏi" />
            </SelectTrigger>
            <SelectContent className="bg-nynus-cream dark:bg-slate-800 border-primary-terracotta/20 dark:border-slate-700 text-nynus-dark dark:text-white transition-colors duration-300">
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-nynus-dark dark:text-white transition-colors duration-300 hover:bg-nynus-silver dark:hover:bg-slate-700">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
            Loại câu hỏi sẽ quyết định cách hiển thị và tương tác với người dùng
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source" className="text-slate-800 dark:text-white transition-colors duration-300">Nguồn câu hỏi</Label>
          <Input
            id="source"
            name="source"
            value={formData.source || ''}
            onChange={handleInputChange}
            placeholder="Ví dụ: Sách giáo khoa, Đề thi học kì, Tự soạn..."
            className="bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
          />
          <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
            Nguồn gốc của câu hỏi, có thể là tên sách, tên đề thi, hoặc ghi chú nguồn khác
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rawContent" className="text-slate-800 dark:text-white transition-colors duration-300">Nội dung gốc (LaTeX)</Label>
        <Textarea
          id="rawContent"
          name="rawContent"
          value={formData.rawContent || ''}
          onChange={handleInputChange}
          placeholder="Nhập nội dung LaTeX của câu hỏi..."
          className="font-mono h-32 bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
        />
        <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
          Nội dung gốc dạng LaTeX, dùng để lưu trữ và xử lý
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-slate-800 dark:text-white transition-colors duration-300">Nội dung hiển thị</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Nội dung đã xử lý và được hiển thị cho người dùng"
          className="h-32 bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
        />
        <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
          Nội dung sẽ được hiển thị cho người dùng. Được tạo tự động từ nội dung LaTeX
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="solution" className="text-slate-800 dark:text-white transition-colors duration-300">Lời giải</Label>
        <Textarea
          id="solution"
          name="solution"
          value={formData.solution || ''}
          onChange={handleInputChange}
          placeholder="Nhập lời giải chi tiết cho câu hỏi"
          className="h-32 bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
        />
        <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
          Lời giải chi tiết giúp người học hiểu cách giải câu hỏi
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags" className="text-slate-800 dark:text-white transition-colors duration-300">Tags</Label>
        <MultiSelect
          selected={formData.tags}
          setSelected={handleTagsChange}
          options={popularTags}
          allowCustomOptions
          placeholder="Nhập và nhấn Enter để thêm tag"
          className="bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
        />
        <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
          Thêm các tag để phân loại câu hỏi và giúp tìm kiếm dễ dàng hơn
        </p>
      </div>
    </div>
  );
}