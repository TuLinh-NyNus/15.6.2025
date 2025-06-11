"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Play, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Hero = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const scrollToNextSection = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-20 lg:py-36 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100/30 via-blue-100/20 to-pink-100/30 dark:from-purple-900/30 dark:via-blue-900/20 dark:to-pink-900/30 transition-colors duration-300"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/20 blur-[120px] rounded-full"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/20 blur-[120px] rounded-full"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.18, 0.1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-pink-500/20 blur-[120px] rounded-full"
        ></motion.div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 backdrop-blur-sm mb-6">
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mr-2"
              >
                ✨
              </motion.span>
              AI học toán thông minh
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
              Học Toán thông minh<br />với AI
            </h1>

            <p className="text-lg md:text-xl text-slate-600/90 dark:text-slate-300/90 max-w-xl mx-auto lg:mx-0 mb-8">
              Nền tảng học toán tương tác, cá nhân hóa trải nghiệm học tập với AI,
              giúp bạn nâng cao kỹ năng dễ dàng hơn bao giờ hết.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/auth/register"
                  className="px-8 py-4 font-medium rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center"
                >
                  Bắt đầu ngay <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </motion.div>

              <motion.button
                className="px-8 py-4 font-medium rounded-full backdrop-blur-sm bg-slate-200/50 dark:bg-white/10 border border-slate-300/50 dark:border-white/20 text-slate-700 dark:text-white flex items-center justify-center gap-2 hover:bg-slate-200/70 dark:hover:bg-white/15 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsVideoModalOpen(true)}
              >
                <Play className="h-5 w-5" /> Xem giới thiệu
              </motion.button>
            </div>

            <div className="hidden lg:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br ${
                    ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-yellow-400 to-orange-600'][i]
                  }`}></div>
                ))}
              </div>
              <p>+1.200 học sinh đã đăng ký trong tháng này</p>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* App/Dashboard mockups */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>

              <motion.div
                className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl"
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-slate-100/70 dark:bg-slate-800/70 rounded-xl overflow-hidden transition-colors duration-300">
                  <div className="h-8 bg-slate-200 dark:bg-slate-900 flex items-center px-4 gap-2 transition-colors duration-300">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-4 h-5 w-32 bg-slate-300 dark:bg-slate-700 rounded-sm transition-colors duration-300"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4">
                    <motion.div
                      className="bg-blue-500/30 h-32 rounded-lg flex items-center justify-center cursor-pointer"
                      whileHover={{ scale: 1.03, backgroundColor: "rgba(59, 130, 246, 0.4)" }}
                    >
                      <span className="text-sm font-medium">Đề thi</span>
                    </motion.div>
                    <motion.div
                      className="bg-purple-500/30 h-32 rounded-lg flex items-center justify-center cursor-pointer"
                      whileHover={{ scale: 1.03, backgroundColor: "rgba(168, 85, 247, 0.4)" }}
                    >
                      <span className="text-sm font-medium">Khóa học</span>
                    </motion.div>
                    <motion.div
                      className="bg-pink-500/30 h-32 rounded-lg flex items-center justify-center cursor-pointer"
                      whileHover={{ scale: 1.03, backgroundColor: "rgba(236, 72, 153, 0.4)" }}
                    >
                      <span className="text-sm font-medium">AI Chat</span>
                    </motion.div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="h-24 bg-slate-300/40 dark:bg-slate-700/40 rounded-lg p-3 transition-colors duration-300">
                      <div className="h-3 w-2/3 bg-slate-400 dark:bg-slate-600 rounded-full mb-2 transition-colors duration-300"></div>
                      <div className="h-3 w-1/2 bg-slate-400 dark:bg-slate-600 rounded-full mb-2 transition-colors duration-300"></div>
                      <div className="h-3 w-3/4 bg-slate-400 dark:bg-slate-600 rounded-full transition-colors duration-300"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating small card */}
              <motion.div
                className="absolute -bottom-10 -left-16 backdrop-blur-sm bg-white/80 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 p-3 rounded-xl shadow-xl"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100/50 dark:bg-blue-500/30 flex items-center justify-center transition-colors duration-300">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">+</span>
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded-full mb-2 transition-colors duration-300"></div>
                    <div className="h-3 w-16 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors duration-300"></div>
                  </div>
                </div>
              </motion.div>

              {/* Floating second card */}
              <motion.div
                className="absolute -top-8 -right-12 backdrop-blur-sm bg-white/80 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 p-3 rounded-xl shadow-xl"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100/50 dark:bg-purple-500/30 flex items-center justify-center transition-colors duration-300">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">↗</span>
                  </div>
                  <div>
                    <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded-full mb-2 transition-colors duration-300"></div>
                    <div className="h-3 w-16 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors duration-300"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={scrollToNextSection}
        >
          <span className="text-sm text-slate-600 dark:text-slate-400 mb-2">Khám phá</span>
          <ChevronDown className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </motion.div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full transition-colors duration-300"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <h3 className="font-medium text-slate-800 dark:text-white transition-colors duration-300">Video giới thiệu NyNus</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-white transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors duration-300">
              <div className="text-center p-8">
                <Play className="h-20 w-20 mx-auto mb-4 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
                <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">Video demo sẽ xuất hiện ở đây</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-[url('/images/wave-light.svg')] dark:bg-[url('/images/wave-dark.svg')] bg-cover bg-bottom bg-no-repeat"></div>
    </section>
  );
};

export default Hero;