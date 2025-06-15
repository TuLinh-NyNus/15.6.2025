'use client';

import { Filter, Search, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { SimplePagination } from '@/components/ui/pagination';
import { useMapID, MapIDEntry } from '@/lib/utils/map-id-parser';
import { cn } from '@/lib/utils';
import logger from '@/lib/utils/logger';
import questionService from '@/lib/api/services/question-service';

// Định nghĩa các loại cho bộ lọc và câu hỏi
interface FilterOptions {
  subject: string;
  grade: string;
  chapter: string;
  lesson: string;
  type: string;
  difficulty: string;
  form: string;
  status: string;
  searchTerm: string;
  page: number;
  limit: number;
}

// Component chính
export default function QuestionStatusPage() {
  // States
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    subject: 'all',
    grade: 'all',
    chapter: 'all',
    lesson: 'all',
    type: 'all',
    difficulty: 'all',
    form: 'all',
    status: 'all',
    searchTerm: '',
    page: 1,
    limit: 10
  });
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    subject: 'all',
    grade: 'all',
    chapter: 'all',
    lesson: 'all',
    type: 'all',
    difficulty: 'all',
    form: 'all',
    status: 'all',
    searchTerm: '',
    page: 1,
    limit: 10
  });

  const [isUpdatingMap, setIsUpdatingMap] = useState<Record<string, boolean>>({});
  const [tempFilters, setTempFilters] = useState<FilterOptions>({
    subject: 'all',
    grade: 'all',
    chapter: 'all',
    lesson: 'all',
    type: 'all',
    difficulty: 'all',
    form: 'all',
    status: 'all',
    searchTerm: '',
    page: 1,
    limit: 10
  });

  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  const { entries: mapIDEntries, isLoading: isMapIDLoading, error: mapIDError } = useMapID();

  // Sử dụng useMemo để cache kết quả và tránh tính toán lại khi không cần thiết
  const grades = useMemo(() => {
    return mapIDEntries.filter(entry => entry.type === 'grade');
  }, [mapIDEntries]);

  const filteredSubjects = useMemo(() => {
    if (tempFilters.grade === 'all') return [];
    return mapIDEntries.filter(entry =>
      entry.type === 'subject' &&
      entry.value.startsWith(tempFilters.grade)
    );
  }, [mapIDEntries, tempFilters.grade]);

  const filteredChapters = useMemo(() => {
    if (tempFilters.subject === 'all') return [];
    return mapIDEntries.filter(entry =>
      entry.type === 'chapter' &&
      entry.value.startsWith(tempFilters.subject)
    );
  }, [mapIDEntries, tempFilters.subject]);

  const filteredLessons = useMemo(() => {
    if (tempFilters.chapter === 'all') return [];
    return mapIDEntries.filter(entry =>
      entry.type === 'lesson' &&
      entry.value.startsWith(tempFilters.chapter)
    );
  }, [mapIDEntries, tempFilters.chapter]);

  const filteredFormTypes = useMemo(() => {
    if (tempFilters.lesson === 'all') return [];

    // Lọc các form từ MapID
    const forms = mapIDEntries.filter(entry =>
      entry.type === 'type' &&
      entry.value.startsWith(tempFilters.lesson)
    );

    // Chuyển đổi thành định dạng phù hợp cho dropdown
    return forms.map(form => ({
      value: form.value,
      label: `${form.value} - ${(form.description || form.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}`
    }));
  }, [mapIDEntries, tempFilters.lesson]);

  // Xử lý thay đổi bộ lọc tạm thời
  const handleTempFilterChange = (field: keyof FilterOptions, value: string) => {
    setTempFilters(prev => {
      const newFilters = { ...prev, [field]: value };

      // Reset các trường phụ thuộc
      if (field === 'grade') {
        newFilters.subject = 'all';
        newFilters.chapter = 'all';
        newFilters.lesson = 'all';
        newFilters.form = 'all';
      } else if (field === 'subject') {
        newFilters.chapter = 'all';
        newFilters.lesson = 'all';
        newFilters.form = 'all';
      } else if (field === 'chapter') {
        newFilters.lesson = 'all';
        newFilters.form = 'all';
      } else if (field === 'lesson') {
        newFilters.form = 'all';
      }

      return newFilters;
    });
  };

  // Xử lý áp dụng bộ lọc
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentFilters(tempFilters);
    setFilters(prev => ({ ...prev, page: 1 })); // Reset về trang 1
  };

  // Xử lý reset bộ lọc
  const handleResetFilters = () => {
    const defaultFilters = {
      subject: 'all',
      grade: 'all',
      chapter: 'all',
      lesson: 'all',
      type: 'all',
      difficulty: 'all',
      form: 'all',
      status: 'all',
      searchTerm: '',
      page: 1,
      limit: 10
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setCurrentFilters(defaultFilters);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setTempFilters(prev => ({ ...prev, searchTerm: value }));
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Xử lý thay đổi trạng thái câu hỏi
  const handleStatusChange = async (questionId: string, newStatus: string) => {
    try {
      setIsUpdatingMap(prev => ({ ...prev, [questionId]: true }));

      // Gọi API để cập nhật trạng thái
      await questionService.updateQuestionStatus(questionId, newStatus);

      // Cập nhật state
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q._id === questionId ? { ...q, status: newStatus } : q
        )
      );

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái câu hỏi",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái câu hỏi",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingMap(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Gọi API lấy danh sách câu hỏi khi component được tải
  useEffect(() => {
    // Đợi cho mapIDEntries được tải xong trước khi gọi API
    if (!isMapIDLoading) {
      // Tạo một bản sao của filters để sử dụng trong fetchQuestions
      const currentFilters = {...filters};

      const fetchQuestions = async () => {
        try {
          setIsLoading(true);

          // Tạo đối tượng URLSearchParams để gửi đến API
          const queryParams = new URLSearchParams();

          // Thêm các tham số cơ bản
          queryParams.append('page', currentFilters.page.toString());
          queryParams.append('limit', currentFilters.limit.toString());

          if (currentFilters.searchTerm) {
            queryParams.append('search', currentFilters.searchTerm);
          }

          // Thêm các tham số lọc theo status
          if (currentFilters.status !== 'all') {
            queryParams.append('status', currentFilters.status);
          }

          // Thêm các tham số lọc theo MapID
          if (currentFilters.grade !== 'all') {
            queryParams.append('gradeParam', currentFilters.grade);
          }

          if (currentFilters.subject !== 'all') {
            queryParams.append('subjectParam', currentFilters.subject);
          }

          if (currentFilters.chapter !== 'all') {
            queryParams.append('chapterParam', currentFilters.chapter);
          }

          if (currentFilters.lesson !== 'all') {
            queryParams.append('lessonParam', currentFilters.lesson);
          }

          if (currentFilters.type !== 'all') {
            queryParams.append('levelParam', currentFilters.type);
            queryParams.append('types', currentFilters.type);
          }

          if (currentFilters.form !== 'all') {
            queryParams.append('formParam', currentFilters.form);
          }

          if (currentFilters.difficulty !== 'all') {
            queryParams.append('difficulties', currentFilters.difficulty);
          }

          // Log để kiểm tra params
          console.log('Tham số lọc đang gửi đến API:', Object.fromEntries(queryParams.entries()));

          // Gọi API tìm kiếm câu hỏi theo metadata
          const response = await fetch(`/api/admin/questions/status?${queryParams.toString()}`);

          if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          // Log kết quả trả về
          console.log('Kết quả trả về từ API:', {
            total: data.total,
            itemsCount: data.items?.length || 0,
            firstItem: data.items && data.items.length > 0 ? {
              id: data.items[0]._id,
              questionId: data.items[0].questionId,
              status: data.items[0].status
            } : 'không có câu hỏi'
          });

          setQuestions(data.items || []);
          setTotalQuestions(data.total || 0);
          setTotalPages(Math.ceil(data.total / currentFilters.limit));

        } catch (error) {
          console.error("Lỗi khi tải danh sách câu hỏi:", error);
          toast({
            title: "Lỗi",
            description: "Không thể tải danh sách câu hỏi",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuestions();
    }
  }, [filters, isMapIDLoading, toast]);

  // Render skeleton loading
  const renderSkeletonLoading = () => {
    return Array(5).fill(0).map((_, index) => (
      <Card key={index} className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
            <Skeleton className="h-5 w-24 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
          </div>
          <Skeleton className="h-4 w-full bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
          <Skeleton className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-24 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              <Skeleton className="h-4 w-32 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              <Skeleton className="h-8 w-8 rounded-md bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              <Skeleton className="h-8 w-8 rounded-md bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </Card>
    ));
  };

  // Hiển thị giao diện
  return (
    <div className="container py-8 mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/3141592654/admin/questions')}
              className="text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Trạng thái Câu hỏi</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Quản lý và thay đổi trạng thái câu hỏi trong ngân hàng đề</p>
          <div className="mt-2">
            <span className="text-slate-600 dark:text-slate-300 transition-colors duration-300">
              {isLoading ? (
                <Skeleton className="h-6 w-32 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              ) : (
                <>Hiển thị {questions?.length || 0} / {totalQuestions} câu hỏi</>
              )}
            </span>
          </div>
        </div>

        {/* Các chức năng */}
        <div className="flex flex-col space-y-6">
          {/* Hàng 1: Thanh tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-slate-400 transition-colors duration-300" />
            <Input
              placeholder="Tìm kiếm câu hỏi theo từ khóa..."
              className="pl-10 bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors duration-300"
              value={tempFilters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Hàng 2: Bộ lọc theo điều kiện */}
          <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-8 gap-4 items-end">
                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Lớp (Grade)</label>
                  <Select
                    value={tempFilters.grade}
                    onValueChange={(value) => handleTempFilterChange('grade', value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      {grades.map(grade => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.value} - {(grade.description || grade.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Môn (Subject)</label>
                  <Select
                    value={tempFilters.subject}
                    onValueChange={(value) => handleTempFilterChange('subject', value)}
                    disabled={tempFilters.grade === 'all' || filteredSubjects.length === 0}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      {filteredSubjects.map(subject => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.value} - {(subject.description || subject.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Chương (Chapter)</label>
                  <Select
                    value={tempFilters.chapter}
                    onValueChange={(value) => handleTempFilterChange('chapter', value)}
                    disabled={tempFilters.subject === 'all' || filteredChapters.length === 0}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      {filteredChapters.map(chapter => (
                        <SelectItem key={chapter.value} value={chapter.value}>
                          {chapter.value} - {(chapter.description || chapter.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Bài (Lesson)</label>
                  <Select
                    value={tempFilters.lesson}
                    onValueChange={(value) => handleTempFilterChange('lesson', value)}
                    disabled={tempFilters.chapter === 'all' || filteredLessons.length === 0}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      {filteredLessons.map(lesson => (
                        <SelectItem key={lesson.value} value={lesson.value}>
                          {lesson.value} - {(lesson.description || lesson.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Mức độ (Level)</label>
                  <Select
                    value={tempFilters.type}
                    onValueChange={(value) => handleTempFilterChange('type', value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="N">N - Nhận biết</SelectItem>
                      <SelectItem value="H">H - Thông Hiểu</SelectItem>
                      <SelectItem value="V">V - VD</SelectItem>
                      <SelectItem value="C">C - VD Cao</SelectItem>
                      <SelectItem value="T">T - VIP</SelectItem>
                      <SelectItem value="M">M - Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Dạng (Form)</label>
                  <Select
                    value={tempFilters.form}
                    onValueChange={(value) => handleTempFilterChange('form', value)}
                    disabled={tempFilters.lesson === 'all' || filteredFormTypes.length === 0}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      {filteredFormTypes.length > 0 ? (
                        // Hiển thị danh sách dạng từ MapID nếu có
                        filteredFormTypes.map(form => (
                          <SelectItem key={form.value} value={form.value}>
                            {form.label}
                          </SelectItem>
                        ))
                      ) : (
                        // Hiển thị danh sách dạng mặc định nếu không có dạng từ MapID
                        <>
                          <SelectItem value="1">1 - LT tổng hợp</SelectItem>
                          <SelectItem value="2">2 - Liên quan xúc xắc, đồng tiền</SelectItem>
                          <SelectItem value="3">3 - Liên quan việc sắp xếp chỗ</SelectItem>
                          <SelectItem value="4">4 - Liên quan việc chọn người</SelectItem>
                          <SelectItem value="5">5 - Liên quan việc chọn đối tượng khác</SelectItem>
                          <SelectItem value="6">6 - Liên quan hình học</SelectItem>
                          <SelectItem value="7">7 - Liên quan việc đếm số</SelectItem>
                          <SelectItem value="8">8 - Liên quan bàn tròn hoặc hoán vị lặp</SelectItem>
                          <SelectItem value="9">9 - Liên quan vấn đề khác</SelectItem>
                          <SelectItem value="B">B - Liên quan đến sơ đồ hình cây</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Loại câu hỏi (Type)</label>
                  <Select
                    value={tempFilters.difficulty}
                    onValueChange={(value) => handleTempFilterChange('difficulty', value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="MC">MC - Trắc nghiệm</SelectItem>
                      <SelectItem value="TF">TF - Đúng Sai</SelectItem>
                      <SelectItem value="SA">SA - Trả lời ngắn</SelectItem>
                      <SelectItem value="ES">ES - Tự luận</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 hover:scale-105"
                    onClick={handleApplyFilters}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Lọc
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Danh sách câu hỏi */}
          <div className="space-y-6">
            {/* Danh sách câu hỏi */}
            <div className="space-y-4">
              {isLoading ? (
                renderSkeletonLoading()
              ) : (
                questions && questions.length > 0 ? (
                  questions.map(question => (
                    <Card
                      key={question._id}
                      className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300 hover:scale-105"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap gap-2 mb-1">
                              {question.questionID?.subject?.value && (
                                <div className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded transition-colors duration-300">
                                  {question.subject || question.questionID.subject.description || question.questionID.subject.value}
                                </div>
                              )}
                              {question.questionID?.grade?.value && (
                                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 text-xs rounded transition-colors duration-300">
                                  Lớp {question.grade || question.questionID.grade.description || question.questionID.grade.value}
                                </div>
                              )}
                              {question.type && (
                                <div className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs rounded transition-colors duration-300">
                                  {question.type}
                                </div>
                              )}
                              <div className={cn(
                                "px-2 py-1 text-xs rounded transition-colors duration-300",
                                question.status === 'ACTIVE' ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" :
                                question.status === 'DRAFT' ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                                question.status === 'PENDING' ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                                question.status === 'ARCHIVED' ? "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400" :
                                "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                              )}>
                                {question.status === 'ACTIVE' ? "Đang hoạt động" :
                                 question.status === 'DRAFT' ? "Bản nháp" :
                                 question.status === 'PENDING' ? "Chờ kiểm tra" :
                                 question.status === 'ARCHIVED' ? "Đã lưu trữ" :
                                 "Đã xóa"}
                              </div>
                            </div>
                            <p className="text-slate-800 dark:text-white transition-colors duration-300">{question.content?.length > 150 ? question.content.slice(0, 150) + '...' : question.content}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                              <div>ID: {question._id ? String(question._id).substring(0, 8) + '...' : 'Không có ID'}</div>

                              {(question.questionID?.fullId || question.questionId) && (
                                <div>Mã câu hỏi: {question.questionID?.fullId || question.questionId}</div>
                              )}

                              {question.subcount && (
                                <div>
                                  Subcount: {' '}
                                  <span
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer underline transition-colors duration-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/3141592654/admin/questions/${question._id}`);
                                    }}
                                  >
                                    {question.subcount}
                                  </span>
                                </div>
                              )}

                              {question.usageCount !== undefined && (
                                <div>Sử dụng: {question.usageCount} lần</div>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 w-48">
                            <Select
                              value={question.status}
                              onValueChange={(value) => handleStatusChange(question._id, value)}
                              disabled={isUpdatingMap[question._id]}
                            >
                              <SelectTrigger className={cn(
                                "w-full bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300",
                                question.status === 'ACTIVE' ? "border-green-300 dark:border-green-500/50" :
                                question.status === 'DRAFT' ? "border-yellow-300 dark:border-yellow-500/50" :
                                question.status === 'PENDING' ? "border-blue-300 dark:border-blue-500/50" :
                                question.status === 'ARCHIVED' ? "border-gray-300 dark:border-gray-500/50" :
                                "border-red-300 dark:border-red-500/50"
                              )}>
                                <SelectValue>
                                  {isUpdatingMap[question._id] ? (
                                    <div className="flex items-center">
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Đang cập nhật...
                                    </div>
                                  ) : (
                                    question.status === 'ACTIVE' ? "Đang hoạt động" :
                                    question.status === 'DRAFT' ? "Bản nháp" :
                                    question.status === 'PENDING' ? "Chờ kiểm tra" :
                                    question.status === 'ARCHIVED' ? "Đã lưu trữ" :
                                    "Đã xóa"
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                <SelectItem value="PENDING">Chờ kiểm tra</SelectItem>
                                <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
                                <SelectItem value="DELETED">Đã xóa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-center transition-colors duration-300">
                    <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Không có câu hỏi nào phù hợp với bộ lọc.</p>
                  </Card>
                )
              )}
            </div>

            {/* Phân trang */}
            {!isLoading && totalPages > 1 && (
              <SimplePagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
