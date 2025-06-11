"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Clock, FileText, BarChart3, Brain, Zap, Award, Target, BookOpen, Star, ExternalLink } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense, lazy } from "react";

// Lazy load các components nặng
const AnalysisSection = lazy(() => import('./components/analysis-section'));
const CTASection = lazy(() => import('./components/cta-section'));

// Loading fallback
const SectionSkeleton = () => (
  <div className="py-20">
    <div className="container mx-auto px-4">
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-72 bg-slate-700 rounded mx-auto"></div>
        <div className="h-5 w-full max-w-2xl mx-auto bg-slate-700 rounded"></div>
        <div className="h-64 bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export default function ExercisePage() {
  // Dữ liệu danh mục đề thi
  const categories = [
    {
      title: "Luyện đề theo lớp",
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      description: "Bài tập được phân chia theo cấp độ từ Lớp 6 đến Lớp 12, phù hợp với chương trình giáo dục.",
      items: ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"],
      bgColor: "from-purple-500/10 to-indigo-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Luyện đề theo kỳ thi",
      icon: <Award className="h-6 w-6 text-blue-500" />,
      description: "Tập hợp đề thi từ các kỳ thi chính thức và không chính thức, từ kiểm tra 15 phút đến THPT Quốc gia.",
      items: ["THPT Quốc gia", "Học kỳ", "Kiểm tra 1 tiết", "Kiểm tra 15 phút", "Thi thử đại học"],
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Luyện đề theo chủ đề",
      icon: <Target className="h-6 w-6 text-amber-500" />,
      description: "Các đề thi tập trung vào các chủ đề toán học cụ thể, giúp củng cố kiến thức từng phần chi tiết.",
      items: ["Hình học", "Đại số", "Giải tích", "Số học", "Xác suất thống kê", "Tổ hợp hàm số"],
      bgColor: "from-amber-500/10 to-yellow-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Luyện đề cá nhân hóa",
      icon: <Brain className="h-6 w-6 text-rose-500" />,
      description: "Sử dụng AI để phân tích điểm mạnh, điểm yếu và tạo đề thi phù hợp với năng lực của từng học sinh.",
      items: ["Đề gợi ý AI", "Điểm yếu cần cải thiện", "Tăng cường kỹ năng", "Luyện tập mục tiêu"],
      bgColor: "from-rose-500/10 to-pink-500/10",
      borderColor: "border-rose-500/20",
    },
  ];

  // Dữ liệu đề thi nổi bật
  const featuredExams = [
    {
      id: 1,
      title: "Đề thi THPT Quốc Gia 2023",
      time: 90,
      questions: 50,
      level: "Khó",
      levelColor: "text-rose-500",
      description: "Đề thi chính thức kỳ thi THPT Quốc Gia năm 2023, bao gồm các dạng bài thường gặp.",
      aiTip: "Tập trung vào phần Hình học không gian và Nguyên hàm tích phân.",
      attempts: 12580,
      success: 68,
    },
    {
      id: 2,
      title: "Luyện đề Đại số - Lớp 10",
      time: 45,
      questions: 25,
      level: "Trung bình",
      levelColor: "text-amber-500",
      description: "Tổng hợp các bài tập về Hàm số, Phương trình bậc 2 và Bất đẳng thức.",
      aiTip: "Chú ý các dạng bài về định lý Viet và ứng dụng.",
      attempts: 8745,
      success: 76,
    },
    {
      id: 3,
      title: "Đề ôn thi Học kỳ 1 - Lớp 12",
      time: 60,
      questions: 40,
      level: "Trung bình - Khó",
      levelColor: "text-orange-500",
      description: "Đề tổng hợp kiến thức nửa đầu năm học lớp 12, chuẩn bị cho kỳ thi học kỳ.",
      aiTip: "Đề có nhiều câu hỏi về đạo hàm và ứng dụng, nên dành thời gian ôn lại phần này.",
      attempts: 9450,
      success: 72,
    },
    {
      id: 4,
      title: "Kiểm tra 15 phút - Lượng giác",
      time: 15,
      questions: 10,
      level: "Dễ",
      levelColor: "text-green-500",
      description: "Đề kiểm tra nhanh kiến thức về các công thức lượng giác cơ bản.",
      aiTip: "Ôn lại các công thức lượng giác cơ bản và cách áp dụng vào bài tập.",
      attempts: 15670,
      success: 85,
    },
  ];

  // Dữ liệu phân tích kết quả người dùng mẫu
  const userStats = {
    completedExams: 12,
    avgScore: 7.8,
    weakTopics: ["Hàm số", "Số phức", "Nguyên hàm"],
    strongTopics: ["Lượng giác", "Đạo hàm", "Phương trình"],
    timeSpent: "18 giờ 42 phút",
    completed: "78%",
  };

  // Trạng thái hiển thị menu nổi
  const [showQuickNav, setShowQuickNav] = useState(false);

  // Hiện menu khi cuộn xuống
  useEffect(() => {
    const handleScroll = () => {
      setShowQuickNav(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hàm tạo lời chúc mừng cá nhân hóa dựa trên tiến độ
  const getMotivationalMessage = (progress: string): string => {
    const progressNum = parseInt(progress);
    if (progressNum < 30) return "Hãy bắt đầu hành trình học tập của bạn!";
    if (progressNum < 50) return "Bạn đã bắt đầu tốt, hãy tiếp tục nỗ lực!";
    if (progressNum < 70) return "Tiến bộ tuyệt vời! Bạn đang đi đúng hướng.";
    if (progressNum < 90) return "Xuất sắc! Bạn gần đạt được mục tiêu rồi!";
    return "Phi thường! Bạn đã chứng minh sự kiên trì và nỗ lực của mình!";
  };

  // Màu background cho tin nhắn dựa trên tiến độ
  const getMotivationColor = (progress: string): string => {
    const progressNum = parseInt(progress);
    if (progressNum < 30) return "from-amber-600/20 to-amber-500/10 border-amber-500/30";
    if (progressNum < 50) return "from-orange-600/20 to-amber-500/10 border-orange-500/30";
    if (progressNum < 70) return "from-indigo-600/20 to-blue-500/10 border-indigo-500/30";
    if (progressNum < 90) return "from-blue-600/20 to-indigo-500/10 border-blue-500/30";
    return "from-green-600/20 to-emerald-500/10 border-green-500/30";
  };

  // Tạo refs và hooks cho animation scroll
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px 0px" });
  const isCategoriesInView = useInView(categoriesRef, { once: true, margin: "-100px 0px" });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Parallax effect cho background hero
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 500], [0, 100]);
  const heroBg1Parallax = useTransform(scrollY, [0, 500], [0, 50]);
  const heroBg2Parallax = useTransform(scrollY, [0, 500], [0, -30]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 transition-colors duration-300">
      {/* Breadcrumbs Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-300">
            Trang chủ
          </Link>
          <span className="text-slate-400 dark:text-slate-600 transition-colors duration-300">/</span>
          <span className="text-indigo-500 dark:text-indigo-300 transition-colors duration-300">Luyện đề</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background elements */}
        <motion.div className="absolute inset-0 z-0 opacity-30" style={{ y: heroParallax }}>
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-[120px]"
            style={{ y: heroBg1Parallax }}
          ></motion.div>
          <motion.div
            className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500 rounded-full filter blur-[100px]"
            style={{ y: heroBg2Parallax }}
          ></motion.div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            ref={heroRef}
            className="flex flex-col lg:flex-row items-center gap-12"
            variants={containerVariants}
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
          >
            <motion.div className="flex-1 space-y-6" variants={itemVariants}>
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100/50 dark:bg-indigo-500/20 border border-indigo-300/50 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-2 transition-colors duration-300">
                🏆 Chinh phục mọi kỳ thi
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
                Luyện đề thông minh<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600 dark:from-blue-400 dark:to-violet-500 transition-colors duration-300">với trí tuệ nhân tạo</span>
              </h1>
              <p className="text-lg text-slate-700 dark:text-slate-50 max-w-2xl leading-relaxed transition-colors duration-300">
                Trải nghiệm luyện đề với ngân hàng câu hỏi phong phú, đề thi tùy chỉnh và gợi ý AI
                giúp bạn học tập hiệu quả hơn. Cá nhân hóa lộ trình học tập của bạn.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="#exam-categories"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  Chọn đề ngay
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#analysis"
                  className="px-6 py-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  Xem thống kê của bạn
                </Link>
              </div>
            </motion.div>

            <motion.div className="flex-1 relative" variants={itemVariants}>
              <div className="relative w-full h-[400px] bg-white/40 dark:bg-slate-800/40 rounded-xl overflow-hidden fancy-card transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 dark:from-indigo-600/10 dark:to-purple-600/10 transition-colors duration-300"></div>
                <Image
                  src="/images/exercise-dashboard.svg"
                  alt="Dashboard luyện đề với AI"
                  fill
                  className="p-4 object-contain"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-100/50 dark:bg-indigo-500/20 backdrop-blur-sm rounded-full text-xs text-indigo-600 dark:text-indigo-300 border border-indigo-300/50 dark:border-indigo-500/30 transition-colors duration-300">
                  Powered by AI
                </div>
              </div>

              {/* Floating badge elements */}
              <motion.div
                className="absolute -top-6 -left-6 bg-purple-100/80 dark:bg-purple-900/80 backdrop-blur-sm p-3 rounded-lg border border-purple-300/50 dark:border-purple-700/50 shadow-xl transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-slate-800 dark:text-white transition-colors duration-300">AI phân tích điểm mạnh yếu</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-6 bg-blue-100/80 dark:bg-blue-900/80 backdrop-blur-sm p-3 rounded-lg border border-blue-300/50 dark:border-blue-700/50 shadow-xl transition-colors duration-300"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-slate-800 dark:text-white transition-colors duration-300">Theo dõi tiến độ học tập</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative h-24 -mt-10">
        <svg className="absolute w-full h-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path
            d="M0,36L48,40C96,44,192,52,288,57.3C384,63,480,65,576,64C672,63,768,59,864,50.7C960,43,1056,31,1152,33.3C1248,36,1344,52,1392,60L1440,68L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-slate-50/80 dark:fill-slate-900/80 transition-colors duration-300"
          ></path>
        </svg>
      </div>

      {/* Danh mục đề thi */}
      <section id="exam-categories" className="py-20 bg-slate-100/50 dark:bg-slate-900/50 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Danh mục đề thi</h2>
            <p className="mt-4 text-slate-700 dark:text-slate-50 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              Lựa chọn danh mục phù hợp với nhu cầu học tập của bạn. Từ đề thi theo lớp
              đến các bài tập được cá nhân hóa bởi AI.
            </p>
          </div>

          <motion.div
            ref={categoriesRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isCategoriesInView ? "visible" : "hidden"}
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className={`rounded-xl p-6 border ${category.borderColor} bg-gradient-to-br ${category.bgColor} backdrop-blur-sm relative overflow-hidden group fancy-card`}
                variants={itemVariants}
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="p-2 bg-white/40 dark:bg-slate-900/40 rounded-lg backdrop-blur-sm transition-colors duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors duration-300">{category.title}</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 transition-colors duration-300">
                  {category.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {category.items.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + i * 0.05 + 0.3, duration: 0.3 }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 transition-colors duration-300"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-200 transition-colors duration-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <Link
                  href={`/luyen-de/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-200 text-sm font-medium transition-colors duration-300"
                >
                  Xem chi tiết
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative h-24">
        <svg className="absolute w-full h-full transform rotate-180" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path
            d="M0,36L48,40C96,44,192,52,288,57.3C384,63,480,65,576,64C672,63,768,59,864,50.7C960,43,1056,31,1152,33.3C1248,36,1344,52,1392,60L1440,68L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-slate-50/80 dark:fill-slate-900/80 transition-colors duration-300"
          ></path>
        </svg>
      </div>

      {/* Đề thi nổi bật */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Đề thi nổi bật</h2>
              <p className="mt-4 text-slate-700 dark:text-slate-50 max-w-2xl leading-relaxed transition-colors duration-300">
                Các đề thi được nhiều học sinh lựa chọn và đánh giá cao. Bắt đầu ngay để cải thiện kỹ năng của bạn.
              </p>
            </div>
            <Link
              href="/luyen-de/tat-ca"
              className="hidden md:flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-200 font-medium transition-colors duration-300"
            >
              Xem tất cả đề thi
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                className="border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden group hover:border-indigo-500/30 transition-colors duration-300 fancy-card bg-white/50 dark:bg-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300">
                        {exam.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 transition-colors duration-300">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{exam.time} phút</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 transition-colors duration-300">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{exam.questions} câu hỏi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                          <span className={`text-sm ${exam.levelColor}`}>{exam.level}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/luyen-de/de-thi/${exam.id}`}
                      className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-600/30 rounded-lg text-indigo-300 hover:text-white text-sm font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                      Bắt đầu
                    </Link>
                  </div>

                  <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">
                    {exam.description}
                  </div>

                  <div className="mt-5 p-3 bg-indigo-50/50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-900/50 rounded-lg transition-colors duration-300">
                    <div className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 transition-colors duration-300" />
                      <div>
                        <div className="text-xs font-medium text-indigo-600 dark:text-indigo-300 mb-1 transition-colors duration-300">Gợi ý từ AI:</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">{exam.aiTip}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">
                      <span className="text-slate-700 dark:text-slate-300 font-medium transition-colors duration-300">{exam.attempts.toLocaleString()}</span> lượt thực hiện
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden transition-colors duration-300">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${exam.success}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-indigo-600 dark:text-indigo-300 transition-colors duration-300">{exam.success}% <span className="text-slate-600 dark:text-slate-400 transition-colors duration-300">hoàn thành</span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/luyen-de/tat-ca"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:text-indigo-500 dark:hover:text-indigo-200 font-medium transition-colors duration-300"
            >
              Xem tất cả đề thi
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Phân tích kết quả với Lazy Loading */}
      <Suspense fallback={<SectionSkeleton />}>
        <AnalysisSection
          userStats={userStats}
          getMotivationalMessage={getMotivationalMessage}
          getMotivationColor={getMotivationColor}
        />
      </Suspense>

      {/* CTA Section với Lazy Loading */}
      <Suspense fallback={<SectionSkeleton />}>
        <CTASection />
      </Suspense>

      {/* Quick Navigation Menu */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: showQuickNav ? 1 : 0,
          scale: showQuickNav ? 1 : 0.5,
          pointerEvents: showQuickNav ? "auto" : "none"
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-xl transition-colors duration-300">
          <div className="flex flex-col gap-3">
            <a
              href="#exam-categories"
              className="w-10 h-10 rounded-full bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-600 flex items-center justify-center text-indigo-600 dark:text-indigo-300 hover:text-white transition-colors duration-300"
              title="Danh mục đề thi"
            >
              <BookOpen className="h-5 w-5" />
            </a>
            <a
              href="#analysis"
              className="w-10 h-10 rounded-full bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-600 flex items-center justify-center text-indigo-600 dark:text-indigo-300 hover:text-white transition-colors duration-300"
              title="Phân tích kết quả"
            >
              <BarChart3 className="h-5 w-5" />
            </a>
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white transition-colors duration-300"
              title="Lên đầu trang"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              whileHover={{ y: -3 }}
            >
              <ChevronRight className="h-5 w-5 rotate-270" />
            </motion.a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}