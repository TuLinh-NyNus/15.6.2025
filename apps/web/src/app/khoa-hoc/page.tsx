import { Metadata } from "next";

import CourseCategories from "@/components/courses/categories";
import CourseList from "@/components/courses/course-list";
import CourseHero from "@/components/courses/hero";

export const metadata: Metadata = {
  title: "Khóa học | NyNus - Nền tảng học tập thông minh",
  description: "Khám phá hơn 500+ khóa học chất lượng cao từ các giảng viên hàng đầu tại NyNus",
};

export default function CoursePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-100/30 to-slate-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      <CourseHero />
      <CourseCategories />
      <CourseList />
    </main>
  );
}