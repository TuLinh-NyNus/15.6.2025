"use client";

import { motion } from "framer-motion";
import { Trophy, Search, Video, Bot, ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 transition-colors duration-300">
          {content}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 transition-colors duration-300"></div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      className="relative p-6 rounded-2xl transition-all duration-200 group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 ${color} opacity-10 rounded-2xl`}></div>
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300"></div>

      <div className="relative z-10">
        <div className={`p-3 ${color} rounded-xl w-fit mb-4 bg-opacity-20 dark:bg-opacity-20 backdrop-blur-sm transition-colors duration-300`}>
          {icon}
        </div>

        <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4 transition-colors duration-300">{description}</p>

        <Tooltip content="Khám phá tính năng này">
          <Link href="#" className={`inline-flex items-center text-sm font-medium ${color.replace('bg-', 'text-')} hover:underline`}>
            Tìm hiểu thêm <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </Tooltip>
      </div>
    </motion.div>
  );
};

const Features = () => {
  return (
    <section id="features-section" className="py-20 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-blue-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-purple-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100/50 dark:bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-400 backdrop-blur-sm mb-4 transition-colors duration-300">
            <Info className="h-4 w-4 mr-2" /> Tính năng nổi bật
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Học tập thông minh
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg transition-colors duration-300">
            Khám phá các công cụ giúp bạn học toán hiệu quả hơn bao giờ hết
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <FeatureCard
            icon={<Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />}
            title="Phòng thi trực tuyến"
            description="Làm đề có sẵn, tùy chỉnh, thi đấu trực tiếp với bạn bè"
            color="bg-yellow-500"
            delay={0.1}
          />

          <FeatureCard
            icon={<Search className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />}
            title="Tìm kiếm thông minh"
            description="Gợi ý câu hỏi phù hợp, bộ lọc nâng cao theo chủ đề"
            color="bg-blue-500"
            delay={0.2}
          />

          <FeatureCard
            icon={<Video className="h-6 w-6 text-purple-600 dark:text-purple-400 transition-colors duration-300" />}
            title="Khóa học tương tác"
            description="Video bài giảng, bài tập tự động chấm điểm chi tiết"
            color="bg-purple-500"
            delay={0.3}
          />

          <FeatureCard
            icon={<Bot className="h-6 w-6 text-pink-600 dark:text-pink-400 transition-colors duration-300" />}
            title="Chatbot AI hỗ trợ"
            description="Giải bài tập, gợi ý phương pháp học hiệu quả"
            color="bg-pink-500"
            delay={0.4}
          />
        </div>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link
            href="/features"
            className="group px-8 py-4 rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-white transition-all duration-200 flex items-center gap-2"
          >
            <span>Xem tất cả tính năng</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
            >
              <ChevronRight className="h-4 w-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Decorative circles */}
      <div className="hidden lg:block absolute bottom-0 left-12 w-24 h-24 border-4 border-blue-500/20 dark:border-blue-500/20 rounded-full transition-colors duration-300"></div>
      <div className="hidden lg:block absolute top-12 right-12 w-12 h-12 border-2 border-purple-500/20 dark:border-purple-500/20 rounded-full transition-colors duration-300"></div>
    </section>
  );
};

export default Features;