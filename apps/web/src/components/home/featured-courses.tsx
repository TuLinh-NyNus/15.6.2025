"use client";

import { ChevronLeft, ChevronRight, Clock, Users, Star, BookOpen, ArrowRight } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CardSkeleton, CourseCardSkeleton, TextSkeleton } from "@/components/ui/skeleton";
import Skeleton from "@/components/ui/skeleton";
import { useFeaturedCourses } from "@/hooks/use-featured-courses";
import { ICourse } from "@/lib/api/services/course-service";

// Dữ liệu mẫu cho khóa học khi API chưa sẵn sàng
const mockCourses = [
  {
    id: "1",
    title: "Toán học lớp 9 cơ bản và nâng cao",
    description: "Chuẩn bị hành trang vững chắc cho kỳ thi vào lớp 10",
    level: "Lớp 9",
    students: 1245,
    duration: 48,
    image: "/images/courses/algebra.jpg",
    rating: 4.8,
    color: "blue"
  },
  {
    id: "2",
    title: "Ôn thi THPT Quốc gia môn Toán",
    description: "Luyện đề và kỹ năng làm bài thi trắc nghiệm hiệu quả",
    level: "Lớp 12",
    students: 958,
    duration: 72,
    image: "/images/courses/calculus.jpg",
    rating: 4.9,
    color: "purple"
  },
  {
    id: "3",
    title: "Hình học không gian lớp 11",
    description: "Nắm vững kiến thức và kỹ năng giải bài tập hình học không gian",
    level: "Lớp 11",
    students: 720,
    duration: 36,
    image: "/images/courses/geometry.jpg",
    rating: 4.7,
    color: "pink"
  },
  {
    id: "4",
    title: "Đại số và Giải tích lớp 10",
    description: "Nền tảng vững chắc cho chương trình THPT",
    level: "Lớp 10",
    students: 890,
    duration: 42,
    image: "/images/courses/math.jpg",
    rating: 4.6,
    color: "green"
  },
  {
    id: "5",
    title: "Toán nâng cao cho học sinh lớp 12",
    description: "Ôn luyện chuyên sâu cho kỳ thi đại học khối A",
    level: "Lớp 12",
    students: 632,
    duration: 54,
    image: "/images/courses/advanced.jpg",
    rating: 4.8,
    color: "orange"
  }
];

const getGradient = (color: string | undefined) => {
  if (!color) return "from-blue-600 to-blue-400";
  const gradients = {
    blue: "from-blue-600 to-blue-400",
    purple: "from-purple-600 to-purple-400",
    pink: "from-pink-600 to-pink-400",
    green: "from-green-600 to-green-400",
    orange: "from-orange-600 to-orange-400"
  };
  return gradients[color as keyof typeof gradients] || "from-blue-600 to-blue-400";
};

// Mở rộng ICourse để thêm các thuộc tính cần thiết cho UI
interface ExtendedCourse extends Partial<ICourse> {
  level?: string;
  students?: number;
  duration?: number;
  image?: string;
  rating?: number;
  color?: string;
}

const CourseCard = ({ course }: { course: ExtendedCourse }) => {
  const gradient = getGradient(course.color);

  return (
    <div className="relative h-full backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300"></div>

      <div className="relative">
        <div className="h-40 bg-slate-200/50 dark:bg-slate-700/50 relative overflow-hidden transition-colors duration-300">
          {/* Placeholder for image */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70`}></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-white">{course.rating}</span>
          </div>

          <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-white">{course.level}</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{course.title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 transition-colors duration-300">{course.description}</p>

          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mb-5 transition-colors duration-300">
            <div className="flex items-center mr-4">
              <Users className="h-3 w-3 mr-1" />
              <span>{course.students} học sinh</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{course.duration} giờ</span>
            </div>
          </div>

          <Link
            href={`/khoa-hoc/${course.id}`}
            className={`w-full block py-2.5 text-center rounded-lg bg-gradient-to-r ${gradient} text-white text-sm font-medium hover:shadow-lg transition-all duration-200`}
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeaturedCourses = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Sử dụng hook để lấy danh sách khóa học nổi bật
  const { data: featuredCourses, isLoading, error } = useFeaturedCourses(6);

  const checkScrollable = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount;

      containerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // Kiểm tra lại sau khi cuộn
      setTimeout(checkScrollable, 300);
    }
  };

  return (
    <section className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 -z-10 transition-colors duration-300"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute left-1/4 w-1/3 h-1/2 bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute right-1/4 bottom-0 w-1/3 h-1/2 bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100/50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 backdrop-blur-sm mb-4 transition-colors duration-300">
              <BookOpen className="h-4 w-4 mr-2" /> Khóa học nổi bật
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800 dark:text-white transition-colors duration-300">
              Học tập theo cấp độ
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl transition-colors duration-300">
              Lựa chọn khóa học phù hợp với trình độ và mục tiêu của bạn từ lớp 9 đến lớp 12
            </p>
          </div>

          <div className="flex gap-2 mt-6 md:mt-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-3 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Trước"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-white transition-colors duration-300" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-3 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Sau"
            >
              <ChevronRight className="h-5 w-5 text-slate-700 dark:text-white transition-colors duration-300" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[60%] md:auto-cols-[45%] lg:auto-cols-[30%] gap-5 overflow-x-auto pb-8 hide-scrollbar snap-x"
          onScroll={checkScrollable}
        >
          {isLoading ? (
            // Hiển thị skeleton khi đang tải dữ liệu
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="snap-start h-full">
                <div className="relative h-full backdrop-blur-sm rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300"></div>
                  <div className="relative">
                    <Skeleton className="h-40 w-full bg-slate-300/50 dark:bg-slate-700/50 transition-colors duration-300" />
                    <div className="p-5">
                      <Skeleton className="h-6 w-3/4 bg-slate-300/50 dark:bg-slate-700/50 mb-2 transition-colors duration-300" />
                      <Skeleton className="h-4 w-full bg-slate-300/50 dark:bg-slate-700/50 mb-2 transition-colors duration-300" />
                      <Skeleton className="h-4 w-2/3 bg-slate-300/50 dark:bg-slate-700/50 mb-4 transition-colors duration-300" />
                      <Skeleton className="h-8 w-full bg-slate-300/50 dark:bg-slate-700/50 mt-8 transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Hiển thị thông báo lỗi
            <div className="col-span-full text-center py-10">
              <p className="text-red-600 dark:text-red-400 transition-colors duration-300">Không thể tải khóa học. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            // Hiển thị danh sách khóa học
            (featuredCourses || mockCourses).map(course => {
              // Tạo đối tượng ExtendedCourse từ dữ liệu API hoặc mock data
              const extendedCourse: ExtendedCourse = {
                ...course,
                // Nếu là dữ liệu API, thêm các thuộc tính UI
                level: course.level || `Lớp ${Math.floor(Math.random() * 4) + 9}`,
                students: course.students || Math.floor(Math.random() * 1000) + 500,
                duration: course.duration || Math.floor(Math.random() * 40) + 20,
                image: course.image || `/images/courses/math.jpg`,
                rating: course.rating || (Math.floor(Math.random() * 10) + 40) / 10,
                color: course.color || ['blue', 'purple', 'pink', 'green', 'orange'][Math.floor(Math.random() * 5)]
              };

              return (
                <div key={course.id} className="snap-start h-full">
                  <CourseCard course={extendedCourse} />
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href="/khoa-hoc"
            className="inline-flex items-center text-slate-800 dark:text-white font-medium px-6 py-3 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
          >
            Xem tất cả khóa học <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;