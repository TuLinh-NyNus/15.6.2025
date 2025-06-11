'use client';

import { Filter, Search, Plus, Loader2, Map, FileText, Database, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect } from 'react';

import { QuestionItem } from '@/components/questions/QuestionItem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Skeleton from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import logger from '@/lib/utils/logger';
import { useMapID, MapIDEntry } from '@/lib/utils/map-id-parser';

// Định nghĩa các loại cho bộ lọc và câu hỏi
interface FilterOptions {
  subject: string;
  grade: string;
  chapter: string;
  lesson: string;
  type: string;
  difficulty: string;
  form: string;
  searchTerm: string;
  usageCount: string;
  page: number;
  limit: number;
}

interface Question {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: string | any;
  content: string;
  type: string;
  subject?: string;
  grade?: string;
  difficulty?: string;
  answers?: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  usageCount?: number;
  rawContent?: string; // Thay raw_content bằng rawContent
  solution?: string;
  questionID?: {
    fullId: string;
    grade?: {
      value: string;
      description: string;
    };
    subject?: {
      value: string;
      description: string;
    };
    chapter?: {
      value: string;
      description: string;
    };
    lesson?: {
      value: string;
      description: string;
    };
    type?: {
      value: string;
      description: string;
    };
  };
}

// Component chính
export default function QuestionsPage() {
  // States
  const [questions, setQuestions] = useState<Question[]>([]);
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
    searchTerm: '',
    usageCount: 'all',
    page: 1,
    limit: 10
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    subject: 'all',
    grade: 'all',
    chapter: 'all',
    lesson: 'all',
    type: 'all',
    difficulty: 'all',
    form: 'all',
    searchTerm: '',
    usageCount: 'all',
    page: 1,
    limit: 10
  });

  const [isDeletingMap, setIsDeletingMap] = useState<Record<string, boolean>>({});
  const [tempFilters, setTempFilters] = useState<FilterOptions>({
    subject: 'all',
    grade: 'all',
    chapter: 'all',
    lesson: 'all',
    type: 'all',
    difficulty: 'all',
    form: 'all',
    searchTerm: '',
    usageCount: 'all',
    page: 1,
    limit: 10
  });

  // Hooks
  const router = useRouter();
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { entries: mapIDEntries, isLoading: isMapIDLoading, error: mapIDError } = useMapID();

  // Sử dụng useMemo để cache kết quả và tránh tính toán lại khi không cần thiết
  const grades = useMemo(() => {
    return mapIDEntries.filter(entry => entry.type === 'grade');
  }, [mapIDEntries]);

  // Sử dụng useMemo để tính toán các danh sách đã lọc
  const filteredSubjects = useMemo(() => {
    if (!mapIDEntries.length) return [];

    if (tempFilters.grade !== 'all') {
      const selectedGradeEntry = grades.find(g => g.value === tempFilters.grade);
      if (selectedGradeEntry) {
        const gradeIndex = mapIDEntries.findIndex(e => e.value === selectedGradeEntry.value && e.type === 'grade');
        if (gradeIndex !== -1) {
          const subjects: MapIDEntry[] = [];
          for (let i = gradeIndex + 1; i < mapIDEntries.length; i++) {
            if (mapIDEntries[i].type === 'subject') {
              subjects.push(mapIDEntries[i]);
            } else if (mapIDEntries[i].type === 'grade') {
              break;
            }
          }
          return subjects;
        }
      }
    }

    return mapIDEntries.filter(entry => entry.type === 'subject');
  }, [mapIDEntries, tempFilters.grade, grades]);

  const filteredChapters = useMemo(() => {
    if (!mapIDEntries.length || tempFilters.subject === 'all') return [];

    const selectedSubjectEntry = filteredSubjects.find(s => s.value === tempFilters.subject);
    if (!selectedSubjectEntry) return [];

    const subjectIndex = mapIDEntries.findIndex(e => e.value === selectedSubjectEntry.value && e.type === 'subject');
    if (subjectIndex === -1) return [];

    const chapters: MapIDEntry[] = [];
    for (let i = subjectIndex + 1; i < mapIDEntries.length; i++) {
      if (mapIDEntries[i].type === 'chapter') {
        chapters.push(mapIDEntries[i]);
      } else if (mapIDEntries[i].type === 'subject' || mapIDEntries[i].type === 'grade') {
        break;
      }
    }

    return chapters;
  }, [mapIDEntries, tempFilters.subject, filteredSubjects]);

  const filteredLessons = useMemo(() => {
    if (!mapIDEntries.length || tempFilters.chapter === 'all') return [];

    const selectedChapterEntry = filteredChapters.find(c => c.value === tempFilters.chapter);
    if (!selectedChapterEntry) return [];

    const chapterIndex = mapIDEntries.findIndex(e => e.value === selectedChapterEntry.value && e.type === 'chapter');
    if (chapterIndex === -1) return [];

    const lessons: MapIDEntry[] = [];
    for (let i = chapterIndex + 1; i < mapIDEntries.length; i++) {
      if (mapIDEntries[i].type === 'lesson') {
        lessons.push(mapIDEntries[i]);
      } else if (mapIDEntries[i].type === 'chapter' || mapIDEntries[i].type === 'subject' || mapIDEntries[i].type === 'grade') {
        break;
      }
    }

    return lessons;
  }, [mapIDEntries, tempFilters.chapter, filteredChapters]);

  const filteredTypes = useMemo(() => {
    if (!mapIDEntries.length || tempFilters.lesson === 'all') return [];

    const selectedLessonEntry = filteredLessons.find(l => l.value === tempFilters.lesson);
    if (!selectedLessonEntry) return [];

    const lessonIndex = mapIDEntries.findIndex(e => e.value === selectedLessonEntry.value && e.type === 'lesson');
    if (lessonIndex === -1) return [];

    const types: MapIDEntry[] = [];
    for (let i = lessonIndex + 1; i < mapIDEntries.length; i++) {
      if (mapIDEntries[i].type === 'type') {
        types.push(mapIDEntries[i]);
      } else if (mapIDEntries[i].type === 'lesson' || mapIDEntries[i].type === 'chapter' || mapIDEntries[i].type === 'subject' || mapIDEntries[i].type === 'grade') {
        break;
      }
    }

    return types;
  }, [mapIDEntries, tempFilters.lesson, filteredLessons]);

  // Thêm state để lưu trữ danh sách dạng câu hỏi (type) dựa trên lớp, môn, chương và bài đã chọn
  const [filteredFormTypes, setFilteredFormTypes] = useState<MapIDEntry[]>([]);

  // Thêm useEffect để lấy danh sách dạng câu hỏi khi lớp, môn, chương và bài thay đổi
  useEffect(() => {
    const fetchFormTypes = async () => {
      try {
        // Chỉ lấy danh sách dạng khi đã chọn đầy đủ lớp, môn, chương và bài
        if (
          tempFilters.grade !== 'all' &&
          tempFilters.subject !== 'all' &&
          tempFilters.chapter !== 'all' &&
          tempFilters.lesson !== 'all'
        ) {
          // Gọi API để lấy danh sách dạng
          const response = await fetch(
            `/api/map-id/parameters?grade=${tempFilters.grade}&subject=${tempFilters.subject}&chapter=${tempFilters.chapter}&lesson=${tempFilters.lesson}`
          );

          if (!response.ok) {
            throw new Error('Không thể lấy danh sách dạng câu hỏi');
          }

          const data = await response.json();

          if (data.success && data.forms && data.forms.length > 0) {
            // Lọc bỏ phần tử "Tất cả" nếu có
            const formTypes = data.forms
              .filter((form: MapIDEntry) => form.value !== 'all')
              .map((form: MapIDEntry) => {
                // Xử lý lại label để hiển thị đúng
                const formValue = form.value;
                let formLabel = '';

                // Dựa vào giá trị để gán nhãn phù hợp
                switch(formValue) {
                  case '1': formLabel = 'LT tổng hợp'; break;
                  case '2': formLabel = 'Liên quan xúc xắc, đồng tiền'; break;
                  case '3': formLabel = 'Liên quan việc sắp xếp chỗ'; break;
                  case '4': formLabel = 'Liên quan việc chọn người'; break;
                  case '5': formLabel = 'Liên quan việc chọn đối tượng khác'; break;
                  case '6': formLabel = 'Liên quan hình học'; break;
                  case '7': formLabel = 'Liên quan việc đếm số'; break;
                  case '8': formLabel = 'Liên quan bàn tròn hoặc hoán vị lặp'; break;
                  case '9': formLabel = 'Liên quan vấn đề khác'; break;
                  case 'B': formLabel = 'Liên quan đến sơ đồ hình cây'; break;
                  case 'C': formLabel = 'Liên quan đến viên bi'; break;
                  case 'D': formLabel = 'Giải phương trình xác suất'; break;
                  case '0': formLabel = 'Câu hỏi tổng hợp'; break;
                  case 'A': formLabel = 'Chưa phân dạng'; break;
                  default: formLabel = form.label || form.description || formValue;
                }

                return {
                  ...form,
                  label: `${formValue} - ${formLabel}`
                };
              });

            console.log('Danh sách dạng câu hỏi đã xử lý:', formTypes);
            setFilteredFormTypes(formTypes);
          } else {
            // Nếu không có dạng nào, đặt về mảng rỗng
            setFilteredFormTypes([]);
          }
        } else {
          // Nếu chưa chọn đầy đủ, đặt về mảng rỗng
          setFilteredFormTypes([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dạng câu hỏi:', error);
        setFilteredFormTypes([]);
      }
    };

    fetchFormTypes();
  }, [tempFilters.grade, tempFilters.subject, tempFilters.chapter, tempFilters.lesson]);

  // Xử lý thay đổi bộ lọc tạm thời (chưa áp dụng) - sử dụng useCallback để tránh tạo lại function
  const handleTempFilterChange = useCallback((field: keyof FilterOptions, value: string) => {
    setTempFilters(prev => {
      // Tạo object mới để tránh thay đổi trực tiếp prev
      const updatedFilters = { ...prev, [field]: value };

      // Reset các trường phụ thuộc dựa vào trường đang được thay đổi
      if (field === 'grade') {
        updatedFilters.subject = 'all';
        updatedFilters.chapter = 'all';
        updatedFilters.lesson = 'all';
        updatedFilters.type = 'all';
        updatedFilters.form = 'all'; // Reset form khi thay đổi lớp
      } else if (field === 'subject') {
        updatedFilters.chapter = 'all';
        updatedFilters.lesson = 'all';
        updatedFilters.type = 'all';
        updatedFilters.form = 'all'; // Reset form khi thay đổi môn
      } else if (field === 'chapter') {
        updatedFilters.lesson = 'all';
        updatedFilters.type = 'all';
        updatedFilters.form = 'all'; // Reset form khi thay đổi chương
      } else if (field === 'lesson') {
        updatedFilters.type = 'all';
        updatedFilters.form = 'all'; // Reset form khi thay đổi bài
      }

      return updatedFilters;
    });
  }, []);

  // Hàm lấy danh sách câu hỏi từ API đã được thay thế bằng các hàm fetchWithNewFilters, fetchWithCurrentFilters, fetchAfterDelete
  const fetchQuestions = useCallback(async (forceRefresh = false) => {
    // Hàm này không còn được sử dụng, nhưng giữ lại để tránh lỗi
    console.log('Hàm fetchQuestions đã bị thay thế, không nên sử dụng nữa');
  }, []);

  // Xử lý áp dụng bộ lọc khi nhấn nút lọc - sử dụng useCallback
  const handleApplyFilters = useCallback(() => {
    // Tạo một bản sao của tempFilters để sử dụng trong fetchQuestions
    const newFilters = {
      ...tempFilters,
      page: 1 // Reset về trang 1 khi áp dụng bộ lọc mới
    };

    // Cập nhật filters
    setFilters(newFilters);

    // Tạo một hàm fetchQuestions mới sử dụng newFilters thay vì filters
    const fetchWithNewFilters = async (forceRefresh = false) => {
      try {
        setIsLoading(true);
        console.log('Đang tải lại danh sách câu hỏi với bộ lọc mới...');

        // Xây dựng query params
        const queryParams = new URLSearchParams();

        // Thêm tham số cache-buster để tránh cache
        if (forceRefresh) {
          queryParams.append('_t', Date.now().toString());
        }

        // Chuyển đổi và gửi tham số lọc chính xác tới server
        if (newFilters.grade !== 'all') {
          const gradeValue = newFilters.grade;
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('gradeParam', gradeValue);
        }

        if (newFilters.subject !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('subjectParam', newFilters.subject);
        }

        if (newFilters.chapter !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('chapterParam', newFilters.chapter);
        }

        if (newFilters.lesson !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('lessonParam', newFilters.lesson);
        }

        if (newFilters.type !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí 4 (mức độ) trong QuestionID
          queryParams.append('levelParam', newFilters.type);
        }

        if (newFilters.difficulty !== 'all') {
          queryParams.append('difficulty', newFilters.difficulty);
        }

        if (newFilters.form !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí 6 (dạng) trong QuestionID
          queryParams.append('formParam', newFilters.form);
        }

        if (newFilters.usageCount !== 'all') {
          // Gửi tham số lọc theo số lần sử dụng
          queryParams.append('usageCount', newFilters.usageCount);
        }

        if (newFilters.searchTerm) {
          queryParams.append('search', newFilters.searchTerm);
        }

        queryParams.append('page', newFilters.page.toString());
        queryParams.append('limit', newFilters.limit.toString());

        // Log để kiểm tra query params
        logger.debug('Tham số lọc đang gửi đến API (bộ lọc mới):', {
          newFilters,
          queryString: queryParams.toString(),
          gradeParam: newFilters.grade !== 'all' ? newFilters.grade : 'not set',
          subjectParam: newFilters.subject !== 'all' ? newFilters.subject : 'not set',
          chapterParam: newFilters.chapter !== 'all' ? newFilters.chapter : 'not set',
          lessonParam: newFilters.lesson !== 'all' ? newFilters.lesson : 'not set',
          levelParam: newFilters.type !== 'all' ? newFilters.type : 'not set',
          formParam: newFilters.form !== 'all' ? newFilters.form : 'not set'
        });

        // Gọi API
        const response = await fetch(`/api/admin/questions?${queryParams.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Không thể lấy danh sách câu hỏi');
        }

        // Log kết quả trả về
        logger.debug('Kết quả trả về từ API (bộ lọc mới):', {
          status: response.status,
          dataStructure: Object.keys(data),
          totalQuestions: data.total || 0,
          returnedCount: (data.questions || []).length,
          firstQuestion: data.questions && data.questions.length > 0
            ? {
                id: data.questions[0]._id,
                content: data.questions[0].content?.substring(0, 50),
                questionID: data.questions[0].questionID
              }
            : 'không có câu hỏi'
        });

        // Cập nhật state với dữ liệu từ API
        if (data.data) {
          setQuestions(data.data.questions || []);
          setTotalQuestions(data.data.total || 0);
          setTotalPages(data.data.totalPages || 1);
        } else {
          setQuestions(data.questions || []);
          setTotalQuestions(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }

        // Lưu bộ lọc hiện tại
        setCurrentFilters({...newFilters});
      } catch (error) {
        logger.error('Lỗi khi lấy danh sách câu hỏi:', error);
        toast({
          title: "Lỗi",
          description: error instanceof Error
            ? error.message
            : "Không thể tải danh sách câu hỏi",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Gọi hàm fetchWithNewFilters với forceRefresh=true
    fetchWithNewFilters(true);
  }, [tempFilters, toast]);

  // Xử lý tìm kiếm theo từ khóa - sử dụng useCallback
  const handleSearch = useCallback((searchValue: string) => {
    setTempFilters(prev => ({
      ...prev,
      searchTerm: searchValue
    }));
  }, []);

  // Xử lý chuyển trang - sử dụng useCallback
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    // Tạo một bản sao của filters với page mới
    const newFilters = {
      ...filters,
      page: newPage
    };

    // Cập nhật filters
    setFilters(newFilters);

    // Tạo một hàm fetchQuestions mới sử dụng newFilters thay vì filters
    const fetchWithNewFilters = async (forceRefresh = false) => {
      try {
        setIsLoading(true);
        console.log('Đang tải lại danh sách câu hỏi với trang mới...');

        // Xây dựng query params
        const queryParams = new URLSearchParams();

        // Thêm tham số cache-buster để tránh cache
        if (forceRefresh) {
          queryParams.append('_t', Date.now().toString());
        }

        // Chuyển đổi và gửi tham số lọc chính xác tới server
        if (newFilters.grade !== 'all') {
          const gradeValue = newFilters.grade;
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('gradeParam', gradeValue);
        }

        if (newFilters.subject !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('subjectParam', newFilters.subject);
        }

        if (newFilters.chapter !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('chapterParam', newFilters.chapter);
        }

        if (newFilters.lesson !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí trong QuestionID
          queryParams.append('lessonParam', newFilters.lesson);
        }

        if (newFilters.type !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí 4 (mức độ) trong QuestionID
          queryParams.append('levelParam', newFilters.type);
        }

        if (newFilters.difficulty !== 'all') {
          queryParams.append('difficulty', newFilters.difficulty);
        }

        if (newFilters.form !== 'all') {
          // Chỉ gửi tham số lọc theo vị trí 6 (dạng) trong QuestionID
          queryParams.append('formParam', newFilters.form);
        }

        if (newFilters.usageCount !== 'all') {
          // Gửi tham số lọc theo số lần sử dụng
          queryParams.append('usageCount', newFilters.usageCount);
        }

        if (newFilters.searchTerm) {
          queryParams.append('search', newFilters.searchTerm);
        }

        queryParams.append('page', newFilters.page.toString());
        queryParams.append('limit', newFilters.limit.toString());

        // Log để kiểm tra query params
        logger.debug('Tham số lọc đang gửi đến API (trang mới):', {
          newFilters,
          queryString: queryParams.toString(),
          gradeParam: newFilters.grade !== 'all' ? newFilters.grade : 'not set',
          subjectParam: newFilters.subject !== 'all' ? newFilters.subject : 'not set',
          chapterParam: newFilters.chapter !== 'all' ? newFilters.chapter : 'not set',
          lessonParam: newFilters.lesson !== 'all' ? newFilters.lesson : 'not set',
          levelParam: newFilters.type !== 'all' ? newFilters.type : 'not set',
          formParam: newFilters.form !== 'all' ? newFilters.form : 'not set'
        });

        // Gọi API
        const response = await fetch(`/api/admin/questions?${queryParams.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Không thể lấy danh sách câu hỏi');
        }

        // Log kết quả trả về
        logger.debug('Kết quả trả về từ API (trang mới):', {
          status: response.status,
          dataStructure: Object.keys(data),
          totalQuestions: data.total || 0,
          returnedCount: (data.questions || []).length,
          firstQuestion: data.questions && data.questions.length > 0
            ? {
                id: data.questions[0]._id,
                content: data.questions[0].content?.substring(0, 50),
                questionID: data.questions[0].questionID
              }
            : 'không có câu hỏi'
        });

        // Cập nhật state với dữ liệu từ API
        if (data.data) {
          setQuestions(data.data.questions || []);
          setTotalQuestions(data.data.total || 0);
          setTotalPages(data.data.totalPages || 1);
        } else {
          setQuestions(data.questions || []);
          setTotalQuestions(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }

        // Lưu bộ lọc hiện tại
        setCurrentFilters({...newFilters});
      } catch (error) {
        logger.error('Lỗi khi lấy danh sách câu hỏi:', error);
        toast({
          title: "Lỗi",
          description: error instanceof Error
            ? error.message
            : "Không thể tải danh sách câu hỏi",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Gọi hàm fetchWithNewFilters với forceRefresh=true
    fetchWithNewFilters(true);
  }, [totalPages, filters, toast]);

  // Xử lý thêm câu hỏi mới - sử dụng useCallback
  const handleAddQuestion = useCallback(() => {
    router.push('/3141592654/admin/questions/inputques');
  }, [router]);

  // Xử lý xóa câu hỏi - sử dụng useCallback
  const handleOpenDeleteDialog = useCallback((questionId: string) => {
    console.log('=== XỬ LÝ XÓA CÂU HỎI ===');
    console.log('ID câu hỏi cần xóa:', questionId);

    if (!questionId || questionId === 'undefined' || questionId === 'null') {
      console.error('ID câu hỏi không hợp lệ:', questionId);
      alert('Không thể xóa câu hỏi vì ID không hợp lệ');
      return;
    }

    // Đánh dấu câu hỏi đang xóa
    setIsDeletingMap(prev => ({
      ...prev,
      [questionId]: true
    }));

    console.log('Gửi request DELETE đến API...');

    // Lấy nội dung câu hỏi từ localStorage nếu có
    const content = localStorage.getItem('deleteQuestionContent') || '';
    if (content) {
      console.log('Đã tìm thấy nội dung câu hỏi trong localStorage:', content.substring(0, 30));
    }

    // Gửi request DELETE trực tiếp đến API
    fetch(`/api/admin/questions/${encodeURIComponent(questionId || 'unknown')}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: questionId,
        content: content
      })
    })
    .then(response => {
      console.log('Nhận phản hồi từ API:', response.status, response.statusText);
      return response.json().catch(e => {
        console.error('Lỗi khi parse JSON:', e);
        return { success: response.ok, message: response.statusText };
      });
    })
    .then(data => {
      console.log('Dữ liệu phản hồi:', data);

      if (data.success) {
        // Cập nhật danh sách câu hỏi sau khi xóa
        setQuestions(prevQuestions =>
          prevQuestions.filter(q => {
            // Kiểm tra cả _id và id
            const qId = q._id || q.id;
            return String(qId) !== String(questionId);
          })
        );

        // Thông báo thành công
        toast({
          title: "Thành công",
          description: "Đã xóa câu hỏi thành công!",
          variant: "success",
          duration: 3000
        });

        // Tải lại danh sách câu hỏi
        setTimeout(() => {
          console.log('Tải lại danh sách câu hỏi sau khi xóa');

          // Tạo một bản sao của filters để sử dụng trong fetchQuestions
          const currentFilters = {...filters};

          // Tạo một hàm fetchQuestions mới sử dụng currentFilters thay vì filters
          const fetchAfterDelete = async (forceRefresh = false) => {
            try {
              setIsLoading(true);
              console.log('Đang tải lại danh sách câu hỏi sau khi xóa...');

              // Xây dựng query params
              const queryParams = new URLSearchParams();

              // Thêm tham số cache-buster để tránh cache
              if (forceRefresh) {
                queryParams.append('_t', Date.now().toString());
              }

              // Chuyển đổi và gửi tham số lọc chính xác tới server
              if (currentFilters.grade !== 'all') {
                const gradeValue = currentFilters.grade;
                // Chỉ gửi tham số lọc theo vị trí trong QuestionID
                queryParams.append('gradeParam', gradeValue);
              }

              if (currentFilters.subject !== 'all') {
                // Chỉ gửi tham số lọc theo vị trí trong QuestionID
                queryParams.append('subjectParam', currentFilters.subject);
              }

              if (currentFilters.chapter !== 'all') {
                // Chỉ gửi tham số lọc theo vị trí trong QuestionID
                queryParams.append('chapterParam', currentFilters.chapter);
              }

              if (currentFilters.lesson !== 'all') {
                // Chỉ gửi tham số lọc theo vị trí trong QuestionID
                queryParams.append('lessonParam', currentFilters.lesson);
              }

              if (currentFilters.type !== 'all') {
                // Chỉ gửi tham số lọc theo vị trí 4 (mức độ) trong QuestionID
                queryParams.append('levelParam', currentFilters.type);
              }

              if (currentFilters.difficulty !== 'all') {
                queryParams.append('difficulty', currentFilters.difficulty);
              }

              if (currentFilters.form !== 'all') {
                // Chỉ gửi tham số lọc theo vị trí 6 (dạng) trong QuestionID
                queryParams.append('formParam', currentFilters.form);
              }

              if (currentFilters.usageCount !== 'all') {
                // Gửi tham số lọc theo số lần sử dụng
                queryParams.append('usageCount', currentFilters.usageCount);
              }

              if (currentFilters.searchTerm) {
                queryParams.append('search', currentFilters.searchTerm);
              }

              queryParams.append('page', currentFilters.page.toString());
              queryParams.append('limit', currentFilters.limit.toString());

              // Log để kiểm tra query params
              logger.debug('Tham số lọc đang gửi đến API (sau khi xóa):', {
                currentFilters,
                queryString: queryParams.toString(),
                gradeParam: currentFilters.grade !== 'all' ? currentFilters.grade : 'not set',
                subjectParam: currentFilters.subject !== 'all' ? currentFilters.subject : 'not set',
                chapterParam: currentFilters.chapter !== 'all' ? currentFilters.chapter : 'not set',
                lessonParam: currentFilters.lesson !== 'all' ? currentFilters.lesson : 'not set',
                levelParam: currentFilters.type !== 'all' ? currentFilters.type : 'not set',
                formParam: currentFilters.form !== 'all' ? currentFilters.form : 'not set'
              });

              // Gọi API
              const response = await fetch(`/api/admin/questions?${queryParams.toString()}`);
              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy danh sách câu hỏi');
              }

              // Log kết quả trả về
              logger.debug('Kết quả trả về từ API (sau khi xóa):', {
                status: response.status,
                dataStructure: Object.keys(data),
                totalQuestions: data.total || 0,
                returnedCount: (data.questions || []).length,
                firstQuestion: data.questions && data.questions.length > 0
                  ? {
                      id: data.questions[0]._id,
                      content: data.questions[0].content?.substring(0, 50),
                      questionID: data.questions[0].questionID
                    }
                  : 'không có câu hỏi'
              });

              // Cập nhật state với dữ liệu từ API
              if (data.data) {
                setQuestions(data.data.questions || []);
                setTotalQuestions(data.data.total || 0);
                setTotalPages(data.data.totalPages || 1);
              } else {
                setQuestions(data.questions || []);
                setTotalQuestions(data.total || 0);
                setTotalPages(data.totalPages || 1);
              }

              // Lưu bộ lọc hiện tại
              setCurrentFilters({...currentFilters});
            } catch (error) {
              logger.error('Lỗi khi lấy danh sách câu hỏi:', error);
              toast({
                title: "Lỗi",
                description: error instanceof Error
                  ? error.message
                  : "Không thể tải danh sách câu hỏi",
                variant: "destructive"
              });
            } finally {
              setIsLoading(false);
            }
          };

          // Gọi hàm fetchAfterDelete với forceRefresh=true
          fetchAfterDelete(true);
        }, 1000);
      } else {
        // Thông báo lỗi
        toast({
          title: "Lỗi",
          description: data.message || "Không thể xóa câu hỏi. Vui lòng thử lại sau.",
          variant: "destructive",
          duration: 3000
        });
      }
    })
    .catch(error => {
      console.error('Lỗi khi xóa câu hỏi:', error);

      // Thông báo lỗi
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi. Vui lòng thử lại sau.",
        variant: "destructive",
        duration: 3000
      });
    })
    .finally(() => {
      console.log('Hoàn tất xử lý xóa câu hỏi');

      // Xóa nội dung câu hỏi từ localStorage
      localStorage.removeItem('deleteQuestionContent');

      // Xóa trạng thái đang xóa
      setIsDeletingMap(prev => ({
        ...prev,
        [questionId]: false
      }));
    });
  }, [toast, filters]);

  // Xử lý sửa câu hỏi
  const handleEditQuestion = (questionId: string) => {
    // Tìm câu hỏi để lấy subcount
    const question = questions.find(q => q._id === questionId);

    if (question && question.subcount) {
      // Nếu có subcount, điều hướng đến trang chi tiết câu hỏi với subcount trong phần admin
      router.push(`/3141592654/admin/questions/${question.subcount}`);
    } else {
      // Nếu không có subcount, điều hướng đến trang chi tiết câu hỏi với ID
      router.push(`/3141592654/admin/questions/${questionId}`);
    }
  };

  // Xử lý xem chi tiết câu hỏi
  const handleViewQuestionDetail = (questionId: string) => {
    // Tìm câu hỏi để lấy subcount
    const question = questions.find(q => q._id === questionId);

    if (question && question.subcount) {
      // Nếu có subcount, điều hướng đến trang chi tiết câu hỏi với subcount trong phần admin
      router.push(`/3141592654/admin/questions/${question.subcount}`);
    } else {
      // Nếu không có subcount, điều hướng đến trang chi tiết câu hỏi với ID
      router.push(`/3141592654/admin/questions/${questionId}`);
    }
  };

  // Gọi API lấy danh sách câu hỏi khi component được tải
  useEffect(() => {
    // Đợi cho mapIDEntries được tải xong trước khi gọi API
    if (!isMapIDLoading) {
      // Tạo một bản sao của filters để sử dụng trong fetchQuestions
      const currentFilters = {...filters};

      // Tạo một hàm fetchQuestions mới sử dụng currentFilters thay vì filters
      const fetchWithCurrentFilters = async (forceRefresh = false) => {
        try {
          setIsLoading(true);
          console.log('Đang tải lại danh sách câu hỏi khi component được tải...');

          // Xây dựng query params
          const queryParams = new URLSearchParams();

          // Thêm tham số cache-buster để tránh cache
          if (forceRefresh) {
            queryParams.append('_t', Date.now().toString());
          }

          // Chuyển đổi và gửi tham số lọc chính xác tới server
          if (currentFilters.grade !== 'all') {
            const gradeValue = currentFilters.grade;
            // Chỉ gửi tham số lọc theo vị trí trong QuestionID
            queryParams.append('gradeParam', gradeValue);
          }

          if (currentFilters.subject !== 'all') {
            // Chỉ gửi tham số lọc theo vị trí trong QuestionID
            queryParams.append('subjectParam', currentFilters.subject);
          }

          if (currentFilters.chapter !== 'all') {
            // Chỉ gửi tham số lọc theo vị trí trong QuestionID
            queryParams.append('chapterParam', currentFilters.chapter);
          }

          if (currentFilters.lesson !== 'all') {
            // Chỉ gửi tham số lọc theo vị trí trong QuestionID
            queryParams.append('lessonParam', currentFilters.lesson);
          }

          if (currentFilters.type !== 'all') {
            // Chỉ gửi tham số lọc theo vị trí 4 (mức độ) trong QuestionID
            queryParams.append('levelParam', currentFilters.type);
          }

          if (currentFilters.difficulty !== 'all') {
            queryParams.append('difficulty', currentFilters.difficulty);
          }

          if (currentFilters.form !== 'all') {
            // Chỉ gửi tham số lọc theo vị trí 6 (dạng) trong QuestionID
            queryParams.append('formParam', currentFilters.form);
          }

          if (currentFilters.usageCount !== 'all') {
            // Gửi tham số lọc theo số lần sử dụng
            queryParams.append('usageCount', currentFilters.usageCount);
          }

          if (currentFilters.searchTerm) {
            queryParams.append('search', currentFilters.searchTerm);
          }

          queryParams.append('page', currentFilters.page.toString());
          queryParams.append('limit', currentFilters.limit.toString());

          // Log để kiểm tra query params
          logger.debug('Tham số lọc đang gửi đến API (component được tải):', {
            currentFilters,
            queryString: queryParams.toString(),
            gradeParam: currentFilters.grade !== 'all' ? currentFilters.grade : 'not set',
            subjectParam: currentFilters.subject !== 'all' ? currentFilters.subject : 'not set',
            chapterParam: currentFilters.chapter !== 'all' ? currentFilters.chapter : 'not set',
            lessonParam: currentFilters.lesson !== 'all' ? currentFilters.lesson : 'not set',
            levelParam: currentFilters.type !== 'all' ? currentFilters.type : 'not set',
            formParam: currentFilters.form !== 'all' ? currentFilters.form : 'not set'
          });

          // Gọi API
          const response = await fetch(`/api/admin/questions?${queryParams.toString()}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Không thể lấy danh sách câu hỏi');
          }

          // Log kết quả trả về
          logger.debug('Kết quả trả về từ API (component được tải):', {
            status: response.status,
            dataStructure: Object.keys(data),
            totalQuestions: data.total || 0,
            returnedCount: (data.questions || []).length,
            firstQuestion: data.questions && data.questions.length > 0
              ? {
                  id: data.questions[0]._id,
                  content: data.questions[0].content?.substring(0, 50),
                  questionID: data.questions[0].questionID
                }
              : 'không có câu hỏi'
          });

          // Cập nhật state với dữ liệu từ API
          if (data.data) {
            setQuestions(data.data.questions || []);
            setTotalQuestions(data.data.total || 0);
            setTotalPages(data.data.totalPages || 1);
          } else {
            setQuestions(data.questions || []);
            setTotalQuestions(data.total || 0);
            setTotalPages(data.totalPages || 1);
          }

          // Lưu bộ lọc hiện tại
          setCurrentFilters({...currentFilters});
        } catch (error) {
          logger.error('Lỗi khi lấy danh sách câu hỏi:', error);
          toast({
            title: "Lỗi",
            description: error instanceof Error
              ? error.message
              : "Không thể tải danh sách câu hỏi",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      // Gọi hàm fetchWithCurrentFilters
      fetchWithCurrentFilters();
    }
  }, [isMapIDLoading, filters, toast]);

  // Render skeleton loading
  const renderSkeletonLoading = () => {
    return Array(5).fill(0).map((_, index) => (
      <Card key={index} className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
                <Skeleton className="h-5 w-16 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              </div>
              <Skeleton className="h-4 w-full bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              <Skeleton className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
            </div>
            <div className="flex gap-2 ml-4">
              <Skeleton className="h-9 w-14 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              <Skeleton className="h-9 w-14 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Quản lý Câu hỏi</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 transition-colors duration-300 hidden sm:block">Quản lý, thêm, sửa và xóa câu hỏi trong ngân hàng đề</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <span className="text-slate-700 dark:text-slate-300 transition-colors duration-300 whitespace-nowrap hidden sm:inline-block">
              {isLoading ? (
                <Skeleton className="h-6 w-32 bg-slate-300 dark:bg-slate-700 transition-colors duration-300" />
              ) : (
                <>Hiển thị {questions.length} / {totalQuestions} câu hỏi</>
              )}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300 whitespace-nowrap hidden sm:inline-block">Hiển thị:</span>
              <Select
                value={tempFilters.limit.toString()}
                onValueChange={(value) => handleTempFilterChange('limit', value)}
              >
                <SelectTrigger className="h-9 w-[120px] bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                  <SelectValue placeholder="10 câu hỏi/trang" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                  <SelectItem value="5">5 câu hỏi/trang</SelectItem>
                  <SelectItem value="10">10 câu hỏi/trang</SelectItem>
                  <SelectItem value="20">20 câu hỏi/trang</SelectItem>
                  <SelectItem value="50">50 câu hỏi/trang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 md:mt-0 w-full md:w-auto">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-2 flex-1 md:flex-none"
                onClick={() => router.push('/3141592654/admin/questions/map-id')}
              >
                <FileText className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline whitespace-nowrap">Map-ID</span>
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 px-2 flex-1 md:flex-none"
                onClick={() => router.push('/3141592654/admin/questions/status')}
              >
                <ClipboardList className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline whitespace-nowrap">Trạng thái</span>
              </Button>
              {/* Nút "Câu hỏi đã lưu" đã bị ẩn theo yêu cầu */}
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-2 flex-1 md:flex-none"
                onClick={handleAddQuestion}
              >
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline whitespace-nowrap">Thêm câu hỏi</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Các chức năng */}
        <div className="flex flex-col space-y-6">
          {/* Hàng 1: Thanh tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              className="pl-10 bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors duration-300"
              value={tempFilters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Hàng 2: Bộ lọc theo điều kiện */}
          <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Lớp (Grade)</label>
                <Select
                  value={tempFilters.grade}
                  onValueChange={(value) => handleTempFilterChange('grade', value)}
                >
                  <SelectTrigger className="bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {grades.map(grade => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.value} - {(grade.description || `Lớp ${grade.value}`).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Môn (Subject)</label>
                <Select
                  value={tempFilters.subject}
                  onValueChange={(value) => handleTempFilterChange('subject', value)}
                  disabled={tempFilters.grade === 'all' || filteredSubjects.length === 0}
                >
                  <SelectTrigger className="bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {filteredSubjects.map(subject => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.value} - {(subject.description || subject.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Chương (Chapter)</label>
                <Select
                  value={tempFilters.chapter}
                  onValueChange={(value) => handleTempFilterChange('chapter', value)}
                  disabled={tempFilters.subject === 'all' || filteredChapters.length === 0}
                >
                  <SelectTrigger className="bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {filteredChapters.map(chapter => (
                      <SelectItem key={chapter.value} value={chapter.value}>
                        {chapter.value} - {(chapter.description || chapter.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Bài (Lesson)</label>
                <Select
                  value={tempFilters.lesson}
                  onValueChange={(value) => handleTempFilterChange('lesson', value)}
                  disabled={tempFilters.chapter === 'all' || filteredLessons.length === 0}
                >
                  <SelectTrigger className="bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {filteredLessons.map(lesson => (
                      <SelectItem key={lesson.value} value={lesson.value}>
                        {lesson.value} - {(lesson.description || lesson.value).replace(/^[A-Za-z0-9]+\s*-\s*([A-Za-z0-9]+\s*-\s*)?/, '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Mức độ (Level)</label>
                <Select
                  value={tempFilters.type}
                  onValueChange={(value) => handleTempFilterChange('type', value)}
                >
                  <SelectTrigger className="bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Dạng (Form)</label>
                <Select
                  value={tempFilters.form}
                  onValueChange={(value) => handleTempFilterChange('form', value)}
                  disabled={tempFilters.lesson === 'all' || filteredFormTypes.length === 0}
                >
                  <SelectTrigger className="bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Loại câu hỏi (Type)</label>
                <Select
                  value={tempFilters.difficulty}
                  onValueChange={(value) => handleTempFilterChange('difficulty', value)}
                >
                  <SelectTrigger className="bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white transition-colors duration-300">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="MC">MC - Trắc nghiệm</SelectItem>
                    <SelectItem value="TF">TF - Đúng Sai</SelectItem>
                    <SelectItem value="SA">SA - Trả lời ngắn</SelectItem>
                    <SelectItem value="TL">TL - Tự luận</SelectItem>
                    <SelectItem value="GD">GD - Ghép đôi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2">
                  <Select
                    value={tempFilters.usageCount}
                    onValueChange={(value) => handleTempFilterChange('usageCount', value)}
                  >
                    <SelectTrigger className="h-8 bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white text-xs transition-colors duration-300">
                      <SelectValue placeholder="Lọc theo số lần sử dụng" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 transition-colors duration-300">
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="0">0 lần</SelectItem>
                      <SelectItem value="1-5">1-5 lần</SelectItem>
                      <SelectItem value="6-10">6-10 lần</SelectItem>
                      <SelectItem value="11-20">11-20 lần</SelectItem>
                      <SelectItem value="21+">Trên 20 lần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleApplyFilters}
                  disabled={isMapIDLoading}
                >
                  {isMapIDLoading ? (
                    <>
                      <Loader2 className="sm:mr-2 h-4 w-4 animate-spin" /> <span className="hidden sm:inline">Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Filter className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Lọc</span>
                    </>
                  )}
                </Button>
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
                questions.length > 0 ? (
                  questions.map(question => (
                    <QuestionItem
                      key={question._id}
                      question={question}
                      onView={handleViewQuestionDetail}
                      onEdit={handleEditQuestion}
                      onDelete={handleOpenDeleteDialog}
                      isDeleting={isDeletingMap[question._id]}
                    />
                  ))
                ) : (
                  <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 text-center transition-colors duration-300">
                    <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Không có câu hỏi nào phù hợp với bộ lọc.</p>
                  </Card>
                )
              )}
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={cn(
                        "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors duration-300",
                        filters.page <= 1 && "pointer-events-none opacity-50"
                      )}
                      onClick={() => handlePageChange(filters.page - 1)}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Hiển thị trang đầu, trang cuối và các trang gần trang hiện tại
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= filters.page - 1 && page <= filters.page + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            className={cn(
                              filters.page === page
                                ? "bg-indigo-600 text-white border-indigo-700 transition-colors duration-300"
                                : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
                            )}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Hiển thị dấu ... giữa các khoảng trang
                    if (
                      (page === 2 && filters.page > 3) ||
                      (page === totalPages - 1 && filters.page < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <span className="flex h-10 w-10 items-center justify-center text-slate-800 dark:text-white transition-colors duration-300">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }

                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      className={cn(
                        "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors duration-300",
                        filters.page >= totalPages && "pointer-events-none opacity-50"
                      )}
                      onClick={() => handlePageChange(filters.page + 1)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}