'use client';

import { Clock, Users, Star, PlayCircle } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const courseList = [
  {
    id: 1,
    title: 'Toán học nâng cao lớp 12',
    instructor: 'Nguyễn Văn A',
    duration: '48 giờ',
    students: 234,
    rating: 4.8,
    lessons: 24,
    category: 'Toán học',
    level: 'Nâng cao',
    status: 'Đang diễn ra',
  },
  {
    id: 2,
    title: 'Luyện thi đại học môn Vật lý',
    instructor: 'Trần Thị B',
    duration: '36 giờ',
    students: 189,
    rating: 4.6,
    lessons: 18,
    category: 'Vật lý',
    level: 'Nâng cao',
    status: 'Sắp khai giảng',
  },
  {
    id: 3,
    title: 'Hóa học cơ bản lớp 10',
    instructor: 'Lê Văn C',
    duration: '24 giờ',
    students: 156,
    rating: 4.5,
    lessons: 12,
    category: 'Hóa học',
    level: 'Cơ bản',
    status: 'Đã kết thúc',
  },
];

export default function CoursesPage() {
  // Sẽ sử dụng router trong tương lai khi cần điều hướng trang
  const { toast } = useToast();

  const handleAddCourse = () => {
    // Thêm khóa học mới
    toast({
      title: "Tính năng đang phát triển",
      description: "Chức năng thêm khóa học mới sẽ được cập nhật trong phiên bản tiếp theo.",
    });
    // router.push('/3141592654/admin/courses/new');
  };

  const handleEditCourse = (courseId: number) => {
    // Sửa khóa học
    toast({
      title: "Tính năng đang phát triển",
      description: `Sửa khóa học ID: ${courseId} sẽ được cập nhật trong phiên bản tiếp theo.`,
    });
    // router.push(`/3141592654/admin/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = (courseId: number) => {
    // Xóa khóa học
    toast({
      title: "Tính năng đang phát triển",
      description: `Xóa khóa học ID: ${courseId} sẽ được cập nhật trong phiên bản tiếp theo.`,
    });
  };

  const handleViewCourseDetails = (courseId: number) => {
    // Xem chi tiết khóa học
    toast({
      title: "Tính năng đang phát triển",
      description: `Xem chi tiết khóa học ID: ${courseId} sẽ được cập nhật trong phiên bản tiếp theo.`,
    });
    // router.push(`/3141592654/admin/courses/${courseId}`);
  };

  const handleManageCourseContent = (courseId: number) => {
    // Quản lý nội dung khóa học
    toast({
      title: "Tính năng đang phát triển",
      description: `Quản lý nội dung khóa học ID: ${courseId} sẽ được cập nhật trong phiên bản tiếp theo.`,
    });
    // router.push(`/3141592654/admin/courses/${courseId}/content`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Quản lý khóa học</h1>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300"
          onClick={handleAddCourse}
        >
          Thêm khóa học mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courseList.map((course) => (
          <Card key={course.id} className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">{course.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Giảng viên: {course.instructor}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200/50 dark:hover:bg-blue-500/30 transition-colors duration-300"
                    onClick={() => handleEditCourse(course.id)}
                  >
                    Sửa
                  </button>
                  <button
                    className="p-2 bg-red-100/50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200/50 dark:hover:bg-red-500/30 transition-colors duration-300"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Xoá
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs rounded transition-colors duration-300">
                  {course.category}
                </span>
                <span className="px-2 py-1 bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded transition-colors duration-300">
                  {course.level}
                </span>
                <span className={cn(
                  "px-2 py-1 text-xs rounded transition-colors duration-300",
                  course.status === 'Đang diễn ra' ? 'bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                  course.status === 'Sắp khai giảng' ? 'bg-yellow-100/50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                  'bg-red-100/50 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                )}>
                  {course.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{course.lessons} bài học</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{course.students} học viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400 transition-colors duration-300" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{course.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-300 dark:border-slate-700 transition-colors duration-300">
                <button
                  className="flex-1 px-4 py-2 bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200/50 dark:hover:bg-purple-500/30 transition-colors duration-300"
                  onClick={() => handleViewCourseDetails(course.id)}
                >
                  Xem chi tiết
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200/50 dark:hover:bg-green-500/30 transition-colors duration-300"
                  onClick={() => handleManageCourseContent(course.id)}
                >
                  Quản lý nội dung
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}