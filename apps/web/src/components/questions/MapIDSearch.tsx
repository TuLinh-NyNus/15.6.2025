'use client';

import React, { useState, useEffect } from 'react';
import { useMapIDSearch } from '@/lib/hooks/useMapID';
import { useMapIDParameters, MapIDParameter } from '@/lib/hooks/useMapIDParameters';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Search } from 'lucide-react';

/**
 * Component tìm kiếm MapID
 */
export function MapIDSearch() {
  const [criteria, setCriteria] = useState<{
    grade?: string;
    subject?: string;
    chapter?: string;
    difficulty?: string;
    lesson?: string;
    form?: string;
  }>({});

  // Sử dụng hook useMapIDParameters để lấy các tham số MapID
  const {
    grades,
    difficulties,
    getSubjects,
    getChapters,
    getLessons,
    getForms,
    loading: loadingParameters,
    error: errorParameters
  } = useMapIDParameters();

  // State để lưu trữ các danh sách tham số
  const [availableSubjects, setAvailableSubjects] = useState<MapIDParameter[]>([{ value: 'all', label: 'Tất cả' }]);
  const [availableChapters, setAvailableChapters] = useState<MapIDParameter[]>([{ value: 'all', label: 'Tất cả' }]);
  const [availableLessons, setAvailableLessons] = useState<MapIDParameter[]>([{ value: 'all', label: 'Tất cả' }]);
  const [availableForms, setAvailableForms] = useState<MapIDParameter[]>([{ value: 'all', label: 'Tất cả' }]);

  // Cập nhật danh sách môn học khi lớp thay đổi
  useEffect(() => {
    // Kiểm tra nếu getSubjects đã sẵn sàng
    if (!getSubjects) return;

    const fetchSubjects = async () => {
      if (criteria.grade) {
        const subjects = await getSubjects(criteria.grade);
        setAvailableSubjects(subjects);
      } else {
        setAvailableSubjects([{ value: 'all', label: 'Tất cả' }]);
      }
    };

    fetchSubjects();
  }, [criteria.grade, getSubjects]);

  // Cập nhật danh sách chương khi lớp hoặc môn học thay đổi
  useEffect(() => {
    // Kiểm tra nếu getChapters đã sẵn sàng
    if (!getChapters) return;

    const fetchChapters = async () => {
      if (criteria.grade && criteria.subject) {
        const chapters = await getChapters(criteria.grade, criteria.subject);
        setAvailableChapters(chapters);
      } else {
        setAvailableChapters([{ value: 'all', label: 'Tất cả' }]);
      }
    };

    fetchChapters();
  }, [criteria.grade, criteria.subject, getChapters]);

  // Cập nhật danh sách bài khi lớp, môn học hoặc chương thay đổi
  useEffect(() => {
    // Kiểm tra nếu getLessons đã sẵn sàng
    if (!getLessons) return;

    const fetchLessons = async () => {
      if (criteria.grade && criteria.subject && criteria.chapter) {
        const lessons = await getLessons(criteria.grade, criteria.subject, criteria.chapter);
        setAvailableLessons(lessons);
      } else {
        setAvailableLessons([{ value: 'all', label: 'Tất cả' }]);
      }
    };

    fetchLessons();
  }, [criteria.grade, criteria.subject, criteria.chapter, getLessons]);

  // Cập nhật danh sách dạng khi lớp, môn học, chương hoặc bài thay đổi
  useEffect(() => {
    // Kiểm tra nếu getForms đã sẵn sàng
    if (!getForms) return;

    const fetchForms = async () => {
      if (criteria.grade && criteria.subject && criteria.chapter && criteria.lesson) {
        const forms = await getForms(criteria.grade, criteria.subject, criteria.chapter, criteria.lesson);
        setAvailableForms(forms);
      } else {
        setAvailableForms([{ value: 'all', label: 'Tất cả' }]);
      }
    };

    fetchForms();
  }, [criteria.grade, criteria.subject, criteria.chapter, criteria.lesson, getForms]);

  const { results, loading, error } = useMapIDSearch(criteria);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Đã tự động tìm kiếm thông qua useEffect trong hook
  };

  const handleChange = (field: string, value: string) => {
    setCriteria(prev => {
      const newCriteria = { ...prev };

      // Cập nhật giá trị cho trường hiện tại
      newCriteria[field] = value === 'all' ? undefined : value;

      // Reset các trường phụ thuộc khi thay đổi trường chính
      if (field === 'grade') {
        newCriteria.subject = undefined;
        newCriteria.chapter = undefined;
        newCriteria.lesson = undefined;
        newCriteria.form = undefined;
      } else if (field === 'subject') {
        newCriteria.chapter = undefined;
        newCriteria.lesson = undefined;
        newCriteria.form = undefined;
      } else if (field === 'chapter') {
        newCriteria.lesson = undefined;
        newCriteria.form = undefined;
      } else if (field === 'lesson') {
        newCriteria.form = undefined;
      }

      return newCriteria;
    });
  };

  const handleClear = () => {
    setCriteria({
      grade: undefined,
      subject: undefined,
      chapter: undefined,
      difficulty: undefined,
      lesson: undefined,
      form: undefined
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm MapID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Lớp</Label>
              <Select
                value={criteria.grade || 'all'}
                onValueChange={(value) => handleChange('grade', value)}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {loadingParameters ? (
                    <SelectItem value="all">Tất cả</SelectItem>
                  ) : (
                    grades.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Môn học</Label>
              <Select
                value={criteria.subject || 'all'}
                onValueChange={(value) => handleChange('subject', value)}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Mức độ</Label>
              <Select
                value={criteria.difficulty || 'all'}
                onValueChange={(value) => handleChange('difficulty', value)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Chọn mức độ" />
                </SelectTrigger>
                <SelectContent>
                  {loadingParameters ? (
                    <SelectItem value="all">Tất cả</SelectItem>
                  ) : (
                    difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chapter">Chương</Label>
              <Select
                value={criteria.chapter || 'all'}
                onValueChange={(value) => handleChange('chapter', value)}
              >
                <SelectTrigger id="chapter">
                  <SelectValue placeholder="Chọn chương" />
                </SelectTrigger>
                <SelectContent>
                  {availableChapters.map((chapter) => (
                    <SelectItem key={chapter.value} value={chapter.value}>
                      {chapter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson">Bài</Label>
              <Select
                value={criteria.lesson || 'all'}
                onValueChange={(value) => handleChange('lesson', value)}
              >
                <SelectTrigger id="lesson">
                  <SelectValue placeholder="Chọn bài" />
                </SelectTrigger>
                <SelectContent>
                  {availableLessons.map((lesson) => (
                    <SelectItem key={lesson.value} value={lesson.value}>
                      {lesson.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form">Dạng</Label>
              <Select
                value={criteria.form || 'all'}
                onValueChange={(value) => handleChange('form', value)}
              >
                <SelectTrigger id="form">
                  <SelectValue placeholder="Chọn dạng" />
                </SelectTrigger>
                <SelectContent>
                  {availableForms.map((form) => (
                    <SelectItem key={form.value} value={form.value}>
                      {form.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>Xóa bộ lọc</Button>
          <Button type="submit" onClick={handleSearch} disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            <Search className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Kết quả tìm kiếm</h3>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Không thể tìm kiếm MapID: {error}
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && results.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Không tìm thấy kết quả</AlertTitle>
            <AlertDescription>
              Không tìm thấy MapID phù hợp với tiêu chí tìm kiếm.
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <Card key={index} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{result.mapID}</h4>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(result.mapID)}>
                      Sao chép
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
