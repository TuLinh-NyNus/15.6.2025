'use client';

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { QuestionFormData } from "./QuestionFormTabs";
import { QuestionIDDetailedMeaning } from "./QuestionIDDetailedMeaning";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import logger from "@/lib/utils/logger";


type QuestionIDInfoProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
};

// Interface cho các tùy chọn dropdown
interface OptionItem {
  value: string;
  label: string;
}

// Interface cho kết quả MapID
interface MapIDOption {
  mapID: string;
  description: string;
}

// Kết quả chuẩn hóa
interface NormalizedField {
  value: string;
  description: string;
}

// Helper function để chuẩn hóa dữ liệu từ API
const normalizeFieldData = (field: unknown): NormalizedField => {
  // Nếu field là null hoặc undefined
  if (!field) return { value: "", description: "" };

  // Nếu field là string
  if (typeof field === 'string') {
    return { value: field, description: field };
  }

  // Nếu field là object
  if (typeof field === 'object') {
    const fieldObj = field as Record<string, unknown>;

    // Nếu đã có cấu trúc value/description
    if ('value' in fieldObj && 'description' in fieldObj) {
      return {
        value: String(fieldObj.value || ""),
        description: String(fieldObj.description || "")
      };
    }

    // Chuyển đổi từ cấu trúc id/name/level sang value/description
    if ('id' in fieldObj || 'name' in fieldObj) {
      return {
        value: fieldObj.id ? String(fieldObj.id) : "",
        description: fieldObj.name ? String(fieldObj.name) : "",
      };
    }
  }

  // Trường hợp mặc định
  return { value: "", description: "" };
};

export function QuestionIDInfo({ formData, setFormData }: QuestionIDInfoProps) {
  // State cho danh sách các tùy chọn
  const [grades, setGrades] = useState<OptionItem[]>([]);
  const [subjects, setSubjects] = useState<OptionItem[]>([]);
  const [chapters, setChapters] = useState<OptionItem[]>([]);
  const [lessons, setLessons] = useState<OptionItem[]>([]);

  // State để kiểm soát việc hiển thị form nhập liệu
  const [showInputForm, setShowInputForm] = useState(false);

  // Kiểm tra xem có đủ thông tin để hiển thị ý nghĩa QuestionID không
  const hasCompleteQuestionID = formData.questionID?.grade?.value &&
                               formData.questionID?.subject?.value &&
                               formData.questionID?.chapter?.value &&
                               formData.questionID?.level?.value;

  // State loading cho từng loại dữ liệu
  const [loadingStates, setLoadingStates] = useState({
    grades: false,
    subjects: false,
    chapters: false,
    lessons: false
  });

  // Tạo dữ liệu tĩnh cho các trường không phụ thuộc vào API
  const levels = useMemo(() => [
    { value: 'N', label: 'Nhận biết' },
    { value: 'H', label: 'Thông Hiểu' },
    { value: 'V', label: 'Vận dụng' },
    { value: 'C', label: 'Vận dụng Cao' },
    { value: 'T', label: 'VIP' },
    { value: 'M', label: 'Note' }
  ], []);

  // Tạo dữ liệu tĩnh cho các dạng câu hỏi (form) từ MapID
  const forms = useMemo(() => [
    { value: '0', label: 'Câu hỏi tổng hợp' },
    { value: '1', label: 'Dạng 1' },
    { value: '2', label: 'Dạng 2' },
    { value: '3', label: 'Dạng 3' },
    { value: '4', label: 'Dạng 4' },
    { value: '5', label: 'Dạng 5' },
    { value: '6', label: 'Dạng 6' },
    { value: '7', label: 'Dạng 7' },
    { value: '8', label: 'Dạng 8' },
    { value: '9', label: 'Dạng 9' },
    { value: 'A', label: 'Chưa phân dạng' }
  ], []);

  // Tạo dữ liệu mẫu cho các lớp
  const defaultGrades = useMemo(() => [
    { value: '0', label: 'Lớp 10' },
    { value: '1', label: 'Lớp 11' },
    { value: '2', label: 'Lớp 12' },
    { value: '6', label: 'Lớp 6' },
    { value: '7', label: 'Lớp 7' },
    { value: '8', label: 'Lớp 8' },
    { value: '9', label: 'Lớp 9' }
  ], []);

  // Sử dụng dữ liệu mẫu nếu API không trả về dữ liệu
  useEffect(() => {
    if (grades.length === 0 && !loadingStates.grades) {
      setGrades(defaultGrades);
    }
  }, [grades, loadingStates.grades, defaultGrades]);

  // Log các giá trị để debug
  useEffect(() => {
    logger.debug('Grades:', grades);
    logger.debug('Subjects:', subjects);
    logger.debug('Chapters:', chapters);
    logger.debug('Lessons:', lessons);
    logger.debug('Levels:', levels);
    logger.debug('Forms:', forms);
  }, [grades, subjects, chapters, lessons, levels, forms]);

  // State lỗi
  const [error, setError] = useState<string | null>(null);

  // Tải dữ liệu lớp (class)
  const fetchGrades = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, grades: true }));
    setError(null);

    try {
      const response = await fetch('/api/map-id/search?field=grade');
      const data = await response.json();

      if (!data.success) {
        throw new Error('Không thể tải danh sách lớp');
      }

      // Lọc ra các item có giá trị không rỗng
      const grades: OptionItem[] = [];
      logger.debug('API response for grades:', data.results);
      data.results.forEach((item: MapIDOption) => {
        const value = item.mapID.match(/\[(\d)/)?.[1] || '';
        if (value) {
          const label = item.description;
          logger.debug(`Grade: value=${value}, label=${label}`);
          grades.push({
            value,
            label
          });
        }
      });

      setGrades(grades);
    } catch (error) {
      logger.error('Lỗi khi tải danh sách lớp:', error);
      setError('Không thể tải danh sách lớp. Vui lòng thử lại sau.');
    } finally {
      setLoadingStates(prev => ({ ...prev, grades: false }));
    }
  }, []);

  // Tải danh sách môn học khi lớp được chọn
  const fetchSubjects = useCallback(async (gradeValue: string) => {
    if (!gradeValue) return;

    setLoadingStates(prev => ({ ...prev, subjects: true }));
    setSubjects([]); // Reset danh sách môn học
    setChapters([]); // Reset danh sách chương
    setLessons([]); // Reset danh sách bài học

    try {
      const response = await fetch(`/api/map-id/search?grade=${gradeValue}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(`Không thể tải danh sách môn học cho lớp ${gradeValue}`);
      }

      // Lọc ra các item có giá trị không rỗng
      const subjects: OptionItem[] = [];
      data.results.forEach((item: MapIDOption) => {
        const code = item.mapID.match(/\[\d([A-Z])/)?.[1] || '';
        if (code) {
          subjects.push({
            value: code,
            label: item.description.split(' - ')[1] || item.description
          });
        }
      });

      setSubjects(subjects);
    } catch (error) {
      logger.error(`Lỗi khi tải danh sách môn học cho lớp ${gradeValue}:`, error);
      setError(`Không thể tải danh sách môn học cho lớp ${gradeValue}. Vui lòng thử lại sau.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, subjects: false }));
    }
  }, []);

  // Tải danh sách chương khi môn học được chọn
  const fetchChapters = useCallback(async (gradeValue: string, subjectValue: string) => {
    if (!gradeValue || !subjectValue) return;

    setLoadingStates(prev => ({ ...prev, chapters: true }));
    setChapters([]); // Reset danh sách chương
    setLessons([]); // Reset danh sách bài học

    try {
      const response = await fetch(`/api/map-id/search?grade=${gradeValue}&subject=${subjectValue}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(`Không thể tải danh sách chương cho lớp ${gradeValue}, môn học ${subjectValue}`);
      }

      // Lọc ra các item có giá trị không rỗng
      const chapters: OptionItem[] = [];
      data.results.forEach((item: MapIDOption) => {
        const code = item.mapID.match(/\[\d[A-Z](\d+)/)?.[1] || '';
        if (code) {
          chapters.push({
            value: code,
            label: item.description.split(' - ')[2] || item.description
          });
        }
      });

      setChapters(chapters);
    } catch (error) {
      logger.error(`Lỗi khi tải danh sách chương:`, error);
      setError(`Không thể tải danh sách chương. Vui lòng thử lại sau.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, chapters: false }));
    }
  }, []);

  // Tải danh sách bài học khi chương được chọn
  const fetchLessons = useCallback(async (gradeValue: string, subjectValue: string, chapterValue: string) => {
    if (!gradeValue || !subjectValue || !chapterValue) return;

    setLoadingStates(prev => ({ ...prev, lessons: true }));
    setLessons([]); // Reset danh sách bài học

    try {
      const response = await fetch(`/api/map-id/search?grade=${gradeValue}&subject=${subjectValue}&chapter=${chapterValue}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(`Không thể tải danh sách bài học`);
      }

      // Lọc ra các item có giá trị không rỗng
      const lessons: OptionItem[] = [];
      data.results.forEach((item: MapIDOption) => {
        const code = item.mapID.match(/\[\d[A-Z]\d+[NHVCTM](\d+)/)?.[1] || '';
        if (code) {
          lessons.push({
            value: code,
            label: item.description.split(' - ')[4] || item.description
          });
        }
      });

      setLessons(lessons);
    } catch (error) {
      logger.error(`Lỗi khi tải danh sách bài học:`, error);
      setError(`Không thể tải danh sách bài học. Vui lòng thử lại sau.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, lessons: false }));
    }
  }, []);

  // Tải dữ liệu lớp (class) khi component được mount
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // Tải dữ liệu môn học khi lớp thay đổi
  useEffect(() => {
    // Kiểm tra xem formData.questionID.grade có tồn tại không
    const gradeValue = formData.questionID?.grade?.value;
    if (gradeValue) {
      fetchSubjects(gradeValue);
    }
  }, [formData.questionID?.grade?.value, fetchSubjects]);

  // Tải dữ liệu chương khi môn học thay đổi
  useEffect(() => {
    const gradeValue = formData.questionID?.grade?.value;
    const subjectValue = formData.questionID?.subject?.value;
    if (gradeValue && subjectValue) {
      fetchChapters(gradeValue, subjectValue);
    }
  }, [formData.questionID?.grade?.value, formData.questionID?.subject?.value, fetchChapters]);

  // Tải dữ liệu bài học khi chương thay đổi
  useEffect(() => {
    const gradeValue = formData.questionID?.grade?.value;
    const subjectValue = formData.questionID?.subject?.value;
    const chapterValue = formData.questionID?.chapter?.value;
    if (gradeValue && subjectValue && chapterValue) {
      fetchLessons(gradeValue, subjectValue, chapterValue);
    }
  }, [
    formData.questionID?.grade?.value,
    formData.questionID?.subject?.value,
    formData.questionID?.chapter?.value,
    fetchLessons
  ]);

  // Tạo fullId dựa trên các trường khác, không sử dụng timestamp và số ngẫu nhiên
  const generateFullId = useCallback(() => {
    // Đảm bảo formData.questionID tồn tại
    if (!formData.questionID) return;

    const { grade, subject, level, form, chapter, lesson } = formData.questionID;

    // Kiểm tra xem các trường bắt buộc đã có hay chưa
    if (!grade?.value || !subject?.value || !level?.value) {
      return; // Không tạo fullId nếu thiếu thông tin
    }

    // Tạo fullId với các trường bắt buộc
    let fullId = `${subject.value}_${grade.value}_${level?.value || '0'}`;

    // Thêm form nếu có
    if (form?.value) {
      fullId += `_${form.value}`;
    } else {
      fullId += '_0'; // Giá trị mặc định cho form
    }

    // Thêm chapter và lesson nếu có
    if (chapter?.value) {
      fullId += `_${chapter.value}`;
      if (lesson?.value) {
        fullId += `_${lesson.value}`;
      }
    }

    // Thêm một mã định danh cố định thay vì timestamp
    // Sử dụng các giá trị đã có để tạo mã định danh
    const uniqueId = `${grade.value}${subject.value}${chapter?.value || ''}${level?.value || ''}${lesson?.value || ''}${form?.value || ''}`;
    fullId += `_${uniqueId}`;

    setFormData(prev => ({
      ...prev,
      questionID: {
        ...prev.questionID,
        fullId
      }
    }));
  }, [formData.questionID, setFormData]);

  // Chúng ta không tự động cập nhật fullId khi các trường thay đổi nữa
  // Để tránh việc ID đầy đủ bị nhảy số liên tục
  // useEffect(() => {
  //   generateFullId();
  // }, [
  //   formData.questionID.grade.value,
  //   formData.questionID.subject.value,
  //   formData.questionID.level?.value,
  //   formData.questionID.form?.value,
  //   generateFullId
  // ]);

  // Auto-generate fullId cho Subcount
  const generateSubcountFullId = useCallback(() => {
    // Kiểm tra xem formData.subcount có tồn tại không
    if (!formData.subcount) return;

    const { prefix, number } = formData.subcount;
    if (prefix && number) {
      const fullId = `${prefix}.${number}`;
      setFormData(prev => ({
        ...prev,
        subcount: {
          ...prev.subcount,
          fullId
        }
      }));
    }
  }, [formData.subcount, setFormData]);

  // Chúng ta chỉ cập nhật Subcount fullId khi có thay đổi đáng kể ở prefix hoặc number
  useEffect(() => {
    // Kiểm tra xem formData.subcount có tồn tại không
    if (!formData.subcount) return;

    // Chỉ tạo fullId nếu cả prefix và number đều có giá trị
    if (formData.subcount?.prefix && formData.subcount?.number && !formData.subcount?.fullId) {
      generateSubcountFullId();
    }
  }, [formData.subcount, generateSubcountFullId]);

  // Xử lý thay đổi Subcount
  const handleSubcountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name.replace('subcount_', '');

    setFormData((prev) => {
      // Đảm bảo prev.subcount tồn tại
      const prevSubcount = prev.subcount || { prefix: '', number: '', fullId: '' };

      const newSubcount = {
        ...prevSubcount,
        [fieldName]: value,
      };

      // Tự động cập nhật fullId khi thay đổi prefix hoặc number
      if ((fieldName === 'prefix' || fieldName === 'number') &&
          newSubcount.prefix && newSubcount.number) {
        newSubcount.fullId = `${newSubcount.prefix}.${newSubcount.number}`;
      }

      return {
        ...prev,
        subcount: newSubcount,
      };
    });
  };

  // Xử lý thay đổi các trường đơn giản trong QuestionID
  const handleQuestionIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.split('_')[1]; // Lấy phần sau dấu gạch dưới

    setFormData((prev) => ({
      ...prev,
      questionID: {
        ...prev.questionID,
        [field]: value,
      },
    }));

    // Nếu người dùng thay đổi fullId trực tiếp, phân tích nó để cập nhật các trường con
    if (field === 'fullId' && value) {
      try {
        // Phân tích fullId theo định dạng: subject_grade_level_form_chapter_lesson_uniqueId
        const parts = value.split('_');
        if (parts.length >= 4) { // Ít nhất phải có subject, grade, level, form
          const [subject, grade, level, form] = parts;

          // Cập nhật các trường tương ứng
          setTimeout(() => {
            setFormData(prev => ({
              ...prev,
              questionID: {
                ...prev.questionID,
                grade: { ...prev.questionID.grade, value: grade },
                subject: { ...prev.questionID.subject, value: subject },
                level: { ...prev.questionID.level, value: level },
                form: { ...prev.questionID.form, value: form },
                // Cập nhật chapter và lesson nếu có
                ...(parts.length >= 5 ? { chapter: { ...prev.questionID.chapter, value: parts[4] } } : {}),
                ...(parts.length >= 6 ? { lesson: { ...prev.questionID.lesson, value: parts[5] } } : {}),
              }
            }));

            // Gọi API để lấy thông tin mô tả cho các trường
            const fetchMapIDInfo = async () => {
              try {
                // Tạo MapID từ các thông tin đã có
                const mapID = `[${grade}${subject}${parts.length >= 5 ? parts[4] : '0'}${level}${parts.length >= 6 ? parts[5] : '0'}${form ? `-${form}` : ''}]`;

                // Gọi API để lấy thông tin
                const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(mapID)}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data.success && data.result) {
                    // Cập nhật mô tả cho các trường
                    setFormData(prev => ({
                      ...prev,
                      questionID: {
                        ...prev.questionID,
                        grade: { ...prev.questionID.grade, description: data.result.grade.description },
                        subject: { ...prev.questionID.subject, description: data.result.subject.description },
                        level: { ...prev.questionID.level, description: data.result.difficulty.description },
                        form: { ...prev.questionID.form, description: data.result.form.description },
                        ...(parts.length >= 5 ? { chapter: { ...prev.questionID.chapter, description: data.result.chapter.description } } : {}),
                        ...(parts.length >= 6 ? { lesson: { ...prev.questionID.lesson, description: data.result.lesson.description } } : {}),
                      }
                    }));
                  }
                }
              } catch (error) {
                logger.error('Lỗi khi lấy thông tin MapID:', error);
              }
            };

            fetchMapIDInfo();
          }, 100);
        }
      } catch (error) {
        logger.error('Lỗi khi phân tích fullId:', error);
      }
    }
  };

  // Xử lý thay đổi các trường lồng nhau
  const handleNestedChange = (field: string, value: string) => {
    setFormData(prev => {
      // Đảm bảo có cấu trúc chuẩn hóa khi cập nhật giá trị
      const updatedQuestionID = { ...prev.questionID };

      // Tạo đối tượng field nếu chưa tồn tại
      if (!updatedQuestionID[field]) {
        updatedQuestionID[field] = { value: "", description: "" };
      }

      // Nếu field là một object với cấu trúc value/description
      if (typeof updatedQuestionID[field] === 'object' && updatedQuestionID[field] !== null) {
        // Tìm mô tả tương ứng với giá trị được chọn
        let description = "";

        // Tìm mô tả dựa trên loại trường
        if (field === 'grade' && grades.length > 0) {
          const option = grades.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'subject' && subjects.length > 0) {
          const option = subjects.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'chapter' && chapters.length > 0) {
          const option = chapters.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'lesson' && lessons.length > 0) {
          const option = lessons.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'level') {
          // Mức độ có các giá trị cố định
          const levelMap: Record<string, string> = {
            'N': 'Nhận biết',
            'H': 'Thông Hiểu',
            'V': 'Vận dụng',
            'C': 'Vận dụng Cao',
            'T': 'VIP',
            'M': 'Note'
          };
          description = levelMap[value] || "";
        } else if (field === 'form') {
          // Dạng câu hỏi có các giá trị cố định
          // Dạng câu hỏi phụ thuộc vào lớp, môn và chương
          let formMap: Record<string, string> = {
            '0': 'Câu hỏi tổng hợp',
            'A': 'Chưa phân dạng'
          };

          // Nếu là Lớp 10, NGÂN HÀNG CHÍNH, Chương 9 (Véctơ trong hệ tọa độ), Bài 3 (ĐT trong MP toạ độ)
          if (prev.questionID?.grade?.value === '0' &&
              prev.questionID?.subject?.value === 'P' &&
              prev.questionID?.chapter?.value === '9' &&
              prev.questionID?.lesson?.value === '3') {
            formMap = {
              ...formMap,
              '1': 'Điểm, véctơ, hệ số góc của ĐT',
              '2': 'PT đường thẳng có VTCP',
              '3': 'PT đường thẳng có VTPT',
              '4': 'Vị trí tương đối giữa hai ĐT',
              '5': 'Bài toán về góc giữa hai ĐT',
              '6': 'Bài toán về khoảng cách',
              '7': 'Bài toán tìm điểm',
              '8': 'Bài toán dùng cho tam giác, tứ giác',
              '9': 'Bài toán thực tế, PP tọa độ hóa'
            };
          }
          // Nếu là Lớp 10, NGÂN HÀNG CHÍNH, Chương 9 (Véctơ trong hệ tọa độ), Bài 1 (Toạ độ của véctơ)
          else if (prev.questionID?.grade?.value === '0' &&
                   prev.questionID?.subject?.value === 'P' &&
                   prev.questionID?.chapter?.value === '9' &&
                   prev.questionID?.lesson?.value === '1') {
            formMap = {
              ...formMap,
              '1': 'Tọa độ điểm, độ dài đại số của véctơ trên 1 trục',
              '2': 'Phép toán véctơ (tổng, hiệu, tích với số) trong Oxy',
              '3': 'Tọa độ điểm',
              '4': 'Tọa độ véc-tơ',
              '5': 'Sự cùng phương của 2 véctơ và ứng dụng',
              '6': 'Phân tích một véctơ theo 2 véctơ không cùng phương',
              '7': 'Toán thực tế dùng hệ toạ độ',
              '8': 'Độ dài vecto và ứng dụng'
            };
          }
          description = formMap[value] || `Dạng ${value}`;
        }

        updatedQuestionID[field] = {
          ...updatedQuestionID[field],
          value: value,
          description: description
        };
      } else {
        // Nếu field là giá trị trực tiếp
        updatedQuestionID[field] = value;
      }

      return {
        ...prev,
        questionID: updatedQuestionID
      };
    });
  };

  // Chuẩn hóa dữ liệu khi component mount
  useEffect(() => {
    // Đảm bảo cấu trúc nhất quán cho questionID và subcount
    let needsUpdate = false;
    let updatedData: Partial<QuestionFormData> = {};

    // Chuẩn hóa questionID
    if (formData.questionID) {
      // Tạo một đối tượng questionID mặc định nếu chưa có
      const defaultQuestionID = {
        fullId: "",
        format: "",
        grade: { value: "", description: "" },
        subject: { value: "", description: "" },
        chapter: { value: "", description: "" },
        level: { value: "", description: "" },
        lesson: { value: "", description: "" },
        form: { value: "", description: "" },
      };

      // Kết hợp với dữ liệu hiện có
      const normalizedQuestionID = {
        ...defaultQuestionID,
        ...formData.questionID,
        grade: normalizeFieldData(formData.questionID.grade),
        subject: normalizeFieldData(formData.questionID.subject),
        chapter: normalizeFieldData(formData.questionID.chapter),
        level: normalizeFieldData(formData.questionID.level || formData.questionID.difficulty),
        lesson: normalizeFieldData(formData.questionID.lesson),
        form: formData.questionID.form ? normalizeFieldData(formData.questionID.form) : { value: "", description: "" },
      } as typeof formData.questionID;

      // Kiểm tra xem có sự thay đổi không
      if (JSON.stringify(normalizedQuestionID) !== JSON.stringify(formData.questionID)) {
        updatedData.questionID = normalizedQuestionID;
        needsUpdate = true;
      }
    } else {
      // Nếu không có questionID, tạo một đối tượng mặc định
      updatedData.questionID = {
        fullId: "",
        format: "",
        grade: { value: "", description: "" },
        subject: { value: "", description: "" },
        chapter: { value: "", description: "" },
        level: { value: "", description: "" },
        lesson: { value: "", description: "" },
        form: { value: "", description: "" },
      };
      needsUpdate = true;
    }

    // Chuẩn hóa subcount
    if (!formData.subcount) {
      // Nếu không có subcount, tạo một đối tượng mặc định
      updatedData.subcount = {
        prefix: "",
        number: "",
        fullId: ""
      };
      needsUpdate = true;
    } else {
      // Đảm bảo tất cả các trường của subcount đều tồn tại
      const normalizedSubcount = {
        prefix: formData.subcount.prefix || "",
        number: formData.subcount.number || "",
        fullId: formData.subcount.fullId || ""
      };

      // Kiểm tra xem có sự thay đổi không
      if (JSON.stringify(normalizedSubcount) !== JSON.stringify(formData.subcount)) {
        updatedData.subcount = normalizedSubcount;
        needsUpdate = true;
      }
    }

    // Cập nhật formData nếu có sự thay đổi
    if (needsUpdate) {
      setFormData(prev => ({
        ...prev,
        ...updatedData
      }));
    }
  }, [formData, setFormData]);

  return (
    <div className="space-y-8">
      {/* Subcount */}
      <div>
        <div className="flex flex-col gap-1.5 mb-4">
          <h3 className="text-lg font-medium">Định dạng hiển thị</h3>
          <p className="text-sm text-muted-foreground">
            Định dạng hiển thị được sử dụng để người dùng dễ dàng truy cập câu hỏi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subcount_prefix">Tiền tố</Label>
            <Input
              id="subcount_prefix"
              name="subcount_prefix"
              value={formData.subcount?.prefix || ""}
              onChange={handleSubcountChange}
              onBlur={generateSubcountFullId}
              placeholder="Ví dụ: TOAN"
            />
            <p className="text-xs text-muted-foreground">
              Tiền tố định danh (thường là tên môn học viết tắt)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcount_number">Số thứ tự</Label>
            <Input
              id="subcount_number"
              name="subcount_number"
              value={formData.subcount?.number || ""}
              onChange={handleSubcountChange}
              onBlur={generateSubcountFullId}
              placeholder="Ví dụ: 001"
            />
            <p className="text-xs text-muted-foreground">
              Số thứ tự định danh
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcount_fullId">ID đầy đủ</Label>
            <div className="flex gap-2">
              <Input
                id="subcount_fullId"
                name="subcount_fullId"
                value={formData.subcount?.fullId || ""}
                onChange={handleSubcountChange}
                placeholder="Ví dụ: TOAN.001"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              ID đầy đủ được tạo tự động từ tiền tố và số thứ tự
            </p>
          </div>
        </div>
      </div>

      {/* QuestionID */}
      <div>
        <div className="flex flex-col gap-1.5 mb-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">Định danh chi tiết (QuestionID)</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
            Định dạng định danh mới với thông tin phân loại chi tiết
          </p>
          {Object.values(loadingStates).some(state => state) && (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Đang tải dữ liệu...</span>
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 transition-colors duration-300">{error}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="questionID_format" className="text-slate-800 dark:text-white transition-colors duration-300">Định dạng</Label>
            <Input
              id="questionID_format"
              name="questionID_format"
              value={formData.questionID?.format || ""}
              onChange={handleQuestionIDChange}
              placeholder="Ví dụ: v2"
              className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionID_fullId" className="text-slate-800 dark:text-white transition-colors duration-300">ID đầy đủ</Label>
            <div className="flex gap-2">
              <Input
                id="questionID_fullId"
                name="questionID_fullId"
                value={formData.questionID?.fullId || ""}
                onChange={handleQuestionIDChange}
                placeholder="ID đầy đủ sẽ được tạo tự động"
                readOnly
                className="flex-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300"
              />
              <button
                type="button"
                onClick={generateFullId}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors duration-300 hover:scale-105"
              >
                Tạo ID
              </button>
            </div>
          </div>
        </div>

        {/* Hiển thị ý nghĩa của QuestionID */}
        <div className="mb-4">
          <QuestionIDDetailedMeaning
            questionID={formData.questionID}
            onEdit={() => setShowInputForm(true)}
          />
        </div>

        {/* Hiển thị các trường nhập liệu khi chưa có đủ thông tin hoặc khi người dùng muốn chỉnh sửa */}
        {(!hasCompleteQuestionID || showInputForm) && (
          <>
            {showInputForm && hasCompleteQuestionID && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInputForm(false)}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300 hover:scale-105"
                >
                  Ẩn form nhập liệu
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Lớp (Tham số 1) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-800 dark:text-white transition-colors duration-300">Lớp</Label>
              <div className="relative">
                <Select
                  value={formData.questionID?.grade?.value || ""}
                  onValueChange={(value) => handleNestedChange('grade', value)}
                  disabled={loadingStates.grades}
                >
                  <SelectTrigger className="hidden">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStates.grades ? (
                      <div className="p-2 text-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                        Đang tải...
                      </div>
                    ) : grades.length > 0 ? (
                      grades.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.value}</span>
                            <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        Không có dữ liệu
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.questionID?.grade?.value && formData.questionID?.grade?.description ? `${formData.questionID.grade.value} - ${formData.questionID.grade.description}` : formData.questionID?.grade?.value || ''}
                  onClick={() => {
                    const element = document.querySelector(`[value="${formData.questionID?.grade?.value || ''}"]`) as HTMLElement;
                    element?.click();
                  }}
                  readOnly
                  placeholder="Chọn lớp"
                  className="cursor-pointer bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300"
                />
                {loadingStates.grades && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Môn học (Tham số 2) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-800 dark:text-white transition-colors duration-300">Môn học</Label>
              <div className="relative">
                <Select
                  value={formData.questionID?.subject?.value || ""}
                  onValueChange={(value) => handleNestedChange('subject', value)}
                  disabled={loadingStates.subjects || !formData.questionID?.grade?.value}
                >
                  <SelectTrigger className="hidden">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStates.subjects ? (
                      <div className="p-2 text-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                        Đang tải...
                      </div>
                    ) : !formData.questionID?.grade?.value ? (
                      <div className="p-2 text-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        Vui lòng chọn lớp trước
                      </div>
                    ) : subjects.length > 0 ? (
                      subjects.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.value}</span>
                            <Badge variant="outline" className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        Không có dữ liệu
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.questionID?.subject?.value && formData.questionID?.subject?.description ? `${formData.questionID.subject.value} - ${formData.questionID.subject.description}` : formData.questionID?.subject?.value || ''}
                  onClick={() => {
                    if (!loadingStates.subjects && formData.questionID?.grade?.value) {
                      const element = document.querySelector(`[value="${formData.questionID?.subject?.value || ''}"]`) as HTMLElement;
                      element?.click();
                    }
                  }}
                  readOnly
                  placeholder={!formData.questionID?.grade?.value ? "Vui lòng chọn lớp trước" : "Chọn môn học"}
                  className={`cursor-${!loadingStates.subjects && formData.questionID?.grade?.value ? "pointer" : "not-allowed"} bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300`}
                  disabled={loadingStates.subjects || !formData.questionID?.grade?.value}
                />
                {loadingStates.subjects && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chương (Tham số 3) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chương</Label>
              <div className="relative">
                <Select
                  value={formData.questionID?.chapter?.value || ''}
                  onValueChange={(value) => handleNestedChange('chapter', value)}
                  disabled={loadingStates.chapters || !formData.questionID?.subject?.value}
                >
                  <SelectTrigger className="hidden">
                    <SelectValue placeholder="Chọn chương" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStates.chapters ? (
                      <div className="p-2 text-center text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                        Đang tải...
                      </div>
                    ) : !formData.questionID?.subject?.value ? (
                      <div className="p-2 text-center text-muted-foreground">
                        Vui lòng chọn môn học trước
                      </div>
                    ) : chapters.length > 0 ? (
                      chapters.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.value}</span>
                            <Badge variant="outline" className="ml-2">
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">
                        Không có dữ liệu
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.questionID?.chapter?.value && formData.questionID?.chapter?.description ? `${formData.questionID.chapter.value} - ${formData.questionID.chapter.description}` : formData.questionID?.chapter?.value || ''}
                  onClick={() => {
                    if (!loadingStates.chapters && formData.questionID?.subject?.value) {
                      const element = document.querySelector(`[value="${formData.questionID?.chapter?.value || ''}"]`) as HTMLElement;
                      element?.click();
                    }
                  }}
                  readOnly
                  placeholder={!formData.questionID?.subject?.value ? "Vui lòng chọn môn học trước" : "Chọn chương"}
                  className={`cursor-${!loadingStates.chapters && formData.questionID?.subject?.value ? "pointer" : "not-allowed"}`}
                  disabled={loadingStates.chapters || !formData.questionID?.subject?.value}
                />
                {loadingStates.chapters && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Độ khó (Tham số 4) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Độ khó</Label>
              <div className="relative">
                <Select
                  value={formData.questionID?.level?.value || ''}
                  onValueChange={(value) => handleNestedChange('level', value)}
                >
                  <SelectTrigger className="hidden">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((option: OptionItem) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.value}</span>
                          <Badge variant="outline" className="ml-2">
                            {option.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.questionID?.level?.value && formData.questionID?.level?.description ? `${formData.questionID.level.value} - ${formData.questionID.level.description}` : formData.questionID?.level?.value || ''}
                  onClick={() => {
                    if (formData.questionID?.level?.value) {
                      const element = document.querySelector(`[value="${formData.questionID?.level?.value || ''}"]`) as HTMLElement;
                      element?.click();
                    }
                  }}
                  readOnly
                  placeholder="Chọn độ khó"
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bài học (Tham số 5) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bài học</Label>
              <div className="relative">
                <Select
                  value={formData.questionID?.lesson?.value || ''}
                  onValueChange={(value) => handleNestedChange('lesson', value)}
                  disabled={loadingStates.lessons || !formData.questionID?.chapter?.value}
                >
                  <SelectTrigger className="hidden">
                    <SelectValue placeholder="Chọn bài học" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingStates.lessons ? (
                      <div className="p-2 text-center text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                        Đang tải...
                      </div>
                    ) : !formData.questionID?.chapter?.value ? (
                      <div className="p-2 text-center text-muted-foreground">
                        Vui lòng chọn chương trước
                      </div>
                    ) : lessons.length > 0 ? (
                      lessons.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.value}</span>
                            <Badge variant="outline" className="ml-2">
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">
                        Không có dữ liệu
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.questionID?.lesson?.value && formData.questionID?.lesson?.description ? `${formData.questionID.lesson.value} - ${formData.questionID.lesson.description}` : formData.questionID?.lesson?.value || ''}
                  onClick={() => {
                    if (!loadingStates.lessons && formData.questionID?.chapter?.value) {
                      const element = document.querySelector(`[value="${formData.questionID?.lesson?.value || ''}"]`) as HTMLElement;
                      element?.click();
                    }
                  }}
                  readOnly
                  placeholder={!formData.questionID?.chapter?.value ? "Vui lòng chọn chương trước" : "Chọn bài học"}
                  className={`cursor-${!loadingStates.lessons && formData.questionID?.chapter?.value ? "pointer" : "not-allowed"}`}
                  disabled={loadingStates.lessons || !formData.questionID?.chapter?.value}
                />
                {loadingStates.lessons && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dạng câu hỏi (Tham số 6, nếu có) - Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dạng câu hỏi</Label>
              <div className="relative">
                <Select
                  value={formData.questionID?.form?.value || ''}
                  onValueChange={(value) => handleNestedChange('form', value)}
                >
                  <SelectTrigger className="hidden">
                    <SelectValue placeholder="Chọn dạng câu hỏi" />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((option: OptionItem) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.value}</span>
                          <Badge variant="outline" className="ml-2">
                            {option.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.questionID?.form?.value && formData.questionID?.form?.description ? `${formData.questionID.form.value} - ${formData.questionID.form.description}` : formData.questionID?.form?.value || ''}
                  onClick={() => {
                    const element = document.querySelector(`[value="${formData.questionID?.form?.value || ''}"]`) as HTMLElement;
                    element?.click();
                  }}
                  readOnly
                  placeholder="Chọn dạng câu hỏi"
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}