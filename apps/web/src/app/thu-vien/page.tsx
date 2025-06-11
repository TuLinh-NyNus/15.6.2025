'use client';

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  isNew: boolean;
  isFeatured: boolean;
}

const categories = [
  {
    id: 1,
    name: "Toán 10",
    icon: "📚",
    count: 120,
  },
  {
    id: 2,
    name: "Toán 11",
    icon: "📐",
    count: 85,
  },
  {
    id: 3,
    name: "Toán 12",
    icon: "📏",
    count: 150,
  },
  {
    id: 4,
    name: "Ôn thi THPT",
    icon: "✏️",
    count: 200,
  },
];

const books: Book[] = [
  {
    id: 1,
    title: "Giải tích 12 nâng cao",
    author: "Thầy Nguyễn Văn A",
    cover: "https://placehold.co/400x600/purple/white?text=Giải+tích+12",
    description: "Tài liệu ôn tập và nâng cao môn Giải tích 12",
    category: "Toán 12",
    tags: ["Giải tích", "Nâng cao", "Lớp 12"],
    rating: 4.8,
    downloads: 1200,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    title: "Hình học không gian",
    author: "Cô Trần Thị B",
    cover: "https://placehold.co/400x600/purple/white?text=Hình+học",
    description: "Tài liệu ôn tập hình học không gian 12",
    category: "Toán 12",
    tags: ["Hình học", "Không gian", "Lớp 12"],
    rating: 4.7,
    downloads: 980,
    isNew: false,
    isFeatured: true,
  },
  // Thêm sách mẫu khác...
];

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors duration-300 sm:text-6xl">
              Thư viện tài liệu
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-gray-300 transition-colors duration-300">
              Khám phá kho tài liệu đa dạng và phong phú
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <div className="relative flex-1 max-w-2xl mx-auto">
              <Input
                type="search"
                placeholder="Tìm kiếm tài liệu..."
                className="pl-10 pr-4 py-3 rounded-full bg-white/80 dark:bg-white/10 border-purple-300/50 dark:border-purple-500/20 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-gray-400 transition-colors duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-gray-400 transition-colors duration-300"
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
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full rounded-xl p-4 text-left transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category.name
                      ? "bg-purple-100/80 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500"
                      : "bg-white/80 dark:bg-white/5 hover:bg-purple-100/50 dark:hover:bg-purple-500/10"
                  } border border-transparent hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors duration-300`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-400 transition-colors duration-300">
                    {category.count} tài liệu
                  </p>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {book.isNew && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500 text-white transition-colors duration-300">Mới</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white line-clamp-2 transition-colors duration-300">
                        {book.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-gray-400 transition-colors duration-300">{book.author}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-yellow-500 transition-colors duration-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15.585l-7.07 3.714 1.35-7.862L.72 7.177l7.88-1.146L10 0l2.4 6.03 7.88 1.146-5.56 5.42 1.35 7.862z"
                            />
                          </svg>
                          <span className="ml-1 text-sm text-slate-600 dark:text-gray-400 transition-colors duration-300">
                            {book.rating}
                          </span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-gray-400 transition-colors duration-300">
                          {book.downloads.toLocaleString()} lượt tải
                        </span>
                      </div>
                      <Button
                        className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-colors duration-300 hover:scale-105"
                      >
                        Tải xuống
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}