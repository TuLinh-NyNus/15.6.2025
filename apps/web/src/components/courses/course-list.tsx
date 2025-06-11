'use client';

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/basic-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCourses } from "@/hooks/use-courses";
import { ICourse } from "@/lib/api/services/course-service";



export default function CourseList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Sử dụng hook useCourses để lấy danh sách khóa học từ API
  const { data, isLoading, error } = useCourses({
    search: searchTerm,
    category: selectedSubject || undefined,
    limit: 9,
    status: 'PUBLISHED'
  });

  // Chuyển đổi dữ liệu từ API sang định dạng phù hợp với UI
  const adaptedCourses = data?.courses?.map((course: ICourse) => ({
    id: course.id,
    title: course.title,
    instructor: course.instructor.name,
    duration: `${course.duration} phút`,
    rating: course.rating,
    students: course.enrollmentsCount,
    image: course.thumbnail || "https://placehold.co/800x400/purple/white?text=Khóa+học",
    price: course.isFree ? "Miễn phí" : `${course.price.toLocaleString()}đ`,
    tags: [course.category.name],
    href: `/khoa-hoc/${course.id}`,
    progress: 0, // Cần cập nhật từ API nếu có
  })) || [];

  return (
    <section className="relative py-16 sm:py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/10 to-slate-50 dark:from-slate-900 dark:via-purple-900/10 dark:to-slate-900 transition-colors duration-300" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
              Khóa học nổi bật
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Các khóa học được yêu thích nhất
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative w-full sm:w-64">
              <Input
                type="search"
                placeholder="Tìm kiếm khóa học..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto"
            >
              <option value="">Tất cả môn học</option>
              <option value="Toán 10">Toán 10</option>
              <option value="Tuyển sinh 10">Tuyển sinh 10</option>
              <option value="Nâng cao">Nâng cao</option>
              <option value="Cơ bản">Cơ bản</option>
            </Select>
          </div>
        </div>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              Đã xảy ra lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="popLayout">
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Hiển thị skeleton khi đang tải dữ liệu */}
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="group relative overflow-hidden rounded-xl bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900">
                    <Skeleton className="aspect-w-16 aspect-h-9 h-48 w-full" />
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <Skeleton className="mt-4 h-6 w-full" />
                      <Skeleton className="mt-2 h-4 w-3/4" />
                      <div className="mt-4 flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="mt-6 h-10 w-full" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Hiển thị danh sách khóa học khi đã tải xong */}
            {!isLoading && adaptedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900">
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

                  <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {course.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {course.instructor}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(course.rating)
                                  ? "text-yellow-500"
                                  : "text-gray-500"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({course.students.toLocaleString()} học viên)
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-slate-800 dark:text-white">
                        {course.price}
                      </span>
                    </div>
                    <div className="mt-6">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 group"
                      >
                        {course.progress > 0 ? "Tiếp tục học" : "Học ngay"}
                        <svg
                          className="ml-2 -mr-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* Add bookmark button */}
                  <button
                    onClick={() =>
                      isInWishlist(course.id)
                        ? removeFromWishlist(course.id)
                        : addToWishlist(course)
                    }
                    className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 backdrop-blur-sm transition-colors hover:bg-black/70"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isInWishlist(course.id) ? 1 : 0.8,
                        color: isInWishlist(course.id) ? "#ec4899" : "#9ca3af",
                      }}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Hiển thị thông báo khi không có khóa học */}
        {!isLoading && adaptedCourses.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">Không tìm thấy khóa học nào phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        )}

        {/* Nút xem thêm khóa học */}
        {!isLoading && adaptedCourses.length > 0 && (
          <div className="mt-16 text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10 group"
            >
              Xem thêm khóa học
              <svg
                className="ml-2 -mr-1 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}