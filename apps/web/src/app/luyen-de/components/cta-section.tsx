"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="bg-gradient-to-br from-indigo-100/70 to-purple-100/70 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl overflow-hidden border border-indigo-300/30 dark:border-indigo-500/20 p-8 md:p-12 fancy-card transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6 transition-colors duration-300">
              Sẵn sàng để nâng cao kết quả học tập?
            </h2>
            <p className="text-lg text-slate-700 dark:text-slate-50 mb-8 leading-relaxed transition-colors duration-300">
              Bắt đầu luyện đề ngay hôm nay với sự hỗ trợ từ AI. Cá nhân hóa lộ trình,
              theo dõi tiến độ và đạt kết quả tốt hơn.
            </p>
            <Link
              href="#exam-categories"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all text-lg shadow-lg shadow-indigo-500/25 hover:scale-105"
            >
              Bắt đầu luyện đề ngay
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}