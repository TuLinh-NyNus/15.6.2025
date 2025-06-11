'use client';

import { motion } from "framer-motion";
import Link from "next/link";

import { Card } from "@/components/ui/card";

const categories = [
  {
    id: 1,
    title: "TUYỂN SINH 10",
    icon: "🔢",
    description: "Khóa học luyện thi vào lớp 10 chất lượng cao",
    lessons: 50,
    isHot: true,
    href: "/khoa-hoc/tuyen-sinh-10",
  },
  {
    id: 2,
    title: "Toán học 10",
    icon: "📐",
    description: "Toán học lớp 10 - Nền tảng vững chắc",
    lessons: 45,
    href: "/khoa-hoc/toan-10",
  },
  {
    id: 3,
    title: "Toán học 11",
    icon: "📏",
    description: "Toán học lớp 11 - Nâng cao kiến thức",
    lessons: 48,
    href: "/khoa-hoc/toan-11",
  },
  {
    id: 4,
    title: "Toán học 12",
    icon: "📚",
    description: "Toán học lớp 12 - Luyện thi THPT QG",
    lessons: 52,
    href: "/khoa-hoc/toan-12",
  },
];

export default function CourseCategories() {
  return (
    <section className="relative py-16 sm:py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/20 to-slate-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 transition-colors duration-300" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
            Danh mục khóa học
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Chọn lĩnh vực bạn muốn học và bắt đầu hành trình chinh phục tri thức
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={category.href} className="block">
                <Card className="group relative overflow-hidden rounded-xl bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

                  {/* Hot badge */}
                  {category.isHot && (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-sm font-medium text-white shadow-lg">
                        Hot🔥
                        <span className="ml-1 inline-block animate-pulse">•</span>
                      </span>
                    </div>
                  )}

                  {/* Icon with gradient background */}
                  <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-2xl">
                    {category.icon}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <h3 className="relative text-xl font-semibold text-slate-800 dark:text-white transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {category.title}
                  </h3>
                  <p className="relative mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="relative mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {category.lessons} bài học
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      40+ giờ
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}