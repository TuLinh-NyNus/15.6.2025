'use client';

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Search, Filter, Clock, Star, Users, BookOpen,
  BarChart2, ChevronDown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Award, Zap, Eye,
  Calendar, BookMarked, X, Monitor, Download,
  Bookmark, BookmarkPlus, Menu,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Loader2,
  User,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Suspense } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExamType {
  id: number;
  title: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  exams: number;
  rating: number;
  type: 'multiple' | 'essay' | 'mixed';
  teacherName: string;
  popular: boolean;
  isNew: boolean;
  isSaved: boolean;
}

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
}

interface TooltipPreviewProps {
  exam: ExamType;
  isVisible: boolean;
}

const exams: ExamType[] = [
  {
    id: 1,
    title: 'Đề thi thử THPT Quốc Gia 2024',
    subject: 'Toán',
    topic: 'Giải tích',
    duration: 120,
    difficulty: 'hard',
    exams: 2458,
    rating: 4.8,
    type: 'mixed',
    teacherName: 'Thầy Nguyễn Văn A',
    popular: true,
    isNew: false,
    isSaved: false,
  },
  {
    id: 2,
    title: 'Đề cương ôn tập Hóa học 12',
    subject: 'Hóa',
    topic: 'Hóa hữu cơ',
    duration: 90,
    difficulty: 'medium',
    exams: 1256,
    rating: 4.5,
    type: 'multiple',
    teacherName: 'Cô Trần Thị B',
    popular: true,
    isNew: false,
    isSaved: true,
  },
  {
    id: 3,
    title: 'Bài tập trắc nghiệm Vật lý 11',
    subject: 'Vật lý',
    topic: 'Điện học',
    duration: 60,
    difficulty: 'easy',
    exams: 892,
    rating: 4.2,
    type: 'multiple',
    teacherName: 'Thầy Lê Văn C',
    popular: false,
    isNew: true,
    isSaved: false,
  },
  {
    id: 4,
    title: 'Luyện thi IELTS Reading',
    subject: 'Tiếng Anh',
    topic: 'IELTS',
    duration: 60,
    difficulty: 'hard',
    exams: 1875,
    rating: 4.9,
    type: 'essay',
    teacherName: 'Ms. Mary Johnson',
    popular: true,
    isNew: false,
    isSaved: false,
  },
  {
    id: 5,
    title: 'Bài tập Hình học không gian',
    subject: 'Toán',
    topic: 'Hình học',
    duration: 45,
    difficulty: 'medium',
    exams: 762,
    rating: 4.3,
    type: 'essay',
    teacherName: 'Thầy Phạm Văn D',
    popular: false,
    isNew: true,
    isSaved: true,
  },
  {
    id: 6,
    title: 'Đề thi học kỳ 1 Ngữ văn 12',
    subject: 'Ngữ văn',
    topic: 'Văn học hiện đại',
    duration: 120,
    difficulty: 'medium',
    exams: 1532,
    rating: 4.6,
    type: 'essay',
    teacherName: 'Cô Nguyễn Thị E',
    popular: false,
    isNew: false,
    isSaved: false,
  },
];

const subjects = [
  'Tất cả', 'Toán', 'Vật lý', 'Hóa học', 'Sinh học',
  'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý'
];

const examTypes = [
  { value: 'all', label: 'Tất cả' },
  { value: 'multiple', label: 'Trắc nghiệm' },
  { value: 'essay', label: 'Tự luận' },
  { value: 'mixed', label: 'Kết hợp' }
];

const difficulties = [
  { value: 'all', label: 'Tất cả' },
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' }
];

// New component for 3D Card Effect
function Card3D({ children, className = "" }: Card3DProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 400, damping: 25 });
  const mouseY = useSpring(y, { stiffness: 400, damping: 25 });

  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);
  const brightness = useTransform(mouseY, [-100, 100], [1.1, 0.9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        filter: `brightness(${brightness})`,
      }}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

// Skeleton Loading component
function ExamCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm
      border border-slate-300/50 dark:border-slate-700/50 animate-pulse transition-colors duration-300">
      <div className="p-6">
        {/* Subject and type */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 bg-slate-300 dark:bg-slate-700 rounded-md transition-colors duration-300"></div>
            <div className="w-20 h-6 bg-slate-300 dark:bg-slate-700 rounded-md transition-colors duration-300"></div>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors duration-300"></div>
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors duration-300"></div>
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors duration-300"></div>
          </div>
        </div>

        {/* Title */}
        <div className="w-full h-7 bg-slate-300 dark:bg-slate-700 rounded mb-2 transition-colors duration-300"></div>
        <div className="w-3/4 h-7 bg-slate-300 dark:bg-slate-700 rounded mb-2 transition-colors duration-300"></div>

        {/* Teacher */}
        <div className="w-1/2 h-5 bg-slate-300 dark:bg-slate-700 rounded mb-4 transition-colors duration-300"></div>

        {/* Divider */}
        <div className="h-px bg-slate-300 dark:bg-slate-700 my-4 transition-colors duration-300"></div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="w-16 h-5 bg-slate-300 dark:bg-slate-700 rounded transition-colors duration-300"></div>
          <div className="w-16 h-5 bg-slate-300 dark:bg-slate-700 rounded transition-colors duration-300"></div>
          <div className="w-16 h-5 bg-slate-300 dark:bg-slate-700 rounded transition-colors duration-300"></div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 bg-slate-200/50 dark:bg-slate-900/50 border-t border-slate-300/50 dark:border-slate-700/50 flex items-center justify-between transition-colors duration-300">
        <div className="w-24 h-6 bg-slate-300 dark:bg-slate-700 rounded transition-colors duration-300"></div>
        <div className="w-20 h-8 bg-slate-300 dark:bg-slate-700 rounded-lg transition-colors duration-300"></div>
      </div>
    </div>
  );
}

// Tooltip Preview component
function TooltipPreview({ exam, isVisible }: TooltipPreviewProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 w-72 p-4
            bg-slate-800/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-xl shadow-purple-500/20"
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-white">{exam.title}</h4>
              <p className="mt-1 text-sm text-gray-400">{exam.topic}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{exam.duration} phút</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  <span>{exam.exams} lượt thi</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{exam.rating}/5.0</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <User className="h-4 w-4" />
                  <span>{exam.teacherName}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Particle Animation component
function ParticleAnimation() {
  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-purple-500/10"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function ExamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [savedExams, setSavedExams] = useState<number[]>([2, 5]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredExam, setHoveredExam] = useState<number | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Filter exams based on search and criteria
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.teacherName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'Tất cả' || exam.subject === selectedSubject;
    const matchesType = selectedType === 'all' || exam.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || exam.difficulty === selectedDifficulty;

    if (activeTab === 'popular') return matchesSearch && matchesSubject && matchesType && matchesDifficulty && exam.popular;
    if (activeTab === 'new') return matchesSearch && matchesSubject && matchesType && matchesDifficulty && exam.isNew;
    if (activeTab === 'saved') return matchesSearch && matchesSubject && matchesType && matchesDifficulty && savedExams.includes(exam.id);

    return matchesSearch && matchesSubject && matchesType && matchesDifficulty;
  });

  // Toggle save/bookmark
  const toggleSave = (id: number) => {
    if (savedExams.includes(id)) {
      setSavedExams(savedExams.filter(examId => examId !== id));
    } else {
      setSavedExams([...savedExams, id]);
    }
  };

  // Click outside to close filters
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setHoveredExam(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Background elements for visual effect
  const BackgroundElements = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-500/20 filter blur-[100px]" />
        <div className="absolute top-2/3 left-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/20 filter blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/20 filter blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
    </div>
  );

  // Render difficulty stars
  const renderDifficultyStars = (difficulty: 'easy' | 'medium' | 'hard') => {
    const stars = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(3)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden transition-colors duration-300">
      <BackgroundElements />
      <ParticleAnimation />

      <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 mb-3 transition-colors duration-300"
        >
          ĐỀ THI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-center text-slate-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto transition-colors duration-300"
        >
          Kho đề thi, đề kiểm tra đa dạng với hơn 10,000+ đề thi các môn
        </motion.p>

        <div className="relative max-w-5xl mx-auto mb-10">
          {/* Search and filter section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 items-stretch md:items-center"
          >
            {/* Search bar */}
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Tìm kiếm đề thi, môn học hoặc giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl
                  text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 border border-slate-300/50 dark:border-slate-700/50
                  focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                  transition-all duration-300 hover:bg-white hover:dark:bg-slate-800"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-gray-400 h-5 w-5 transition-colors duration-300" />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-gray-400
                    hover:text-slate-700 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter button */}
            <div className="relative" ref={filtersRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-300/50 dark:border-slate-700/50
                  text-slate-800 dark:text-white flex items-center gap-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors duration-300
                  focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              >
                <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                <span>Bộ lọc</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Filters dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 p-4 rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
                      border border-slate-300/50 dark:border-slate-700/50 shadow-xl z-20 transition-colors duration-300"
                  >
                    {/* Subject filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 transition-colors duration-300">Môn học</label>
                      <div className="flex flex-wrap gap-2">
                        {subjects.map(subject => (
                          <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`px-3 py-1 text-xs rounded-full transition-all
                              ${selectedSubject === subject
                                ? 'bg-purple-500 text-white font-medium'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-300'}`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Exam type filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 transition-colors duration-300">Loại đề thi</label>
                      <div className="grid grid-cols-2 gap-2">
                        {examTypes.map(type => (
                          <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={`px-3 py-2 text-sm rounded-lg transition-all
                              ${selectedType === type.value
                                ? 'bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-medium border border-purple-300/50 dark:border-purple-500/50'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 border border-transparent transition-colors duration-300'}`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 transition-colors duration-300">Độ khó</label>
                      <div className="grid grid-cols-2 gap-2">
                        {difficulties.map(diff => (
                          <button
                            key={diff.value}
                            onClick={() => setSelectedDifficulty(diff.value)}
                            className={`px-3 py-2 text-sm rounded-lg transition-all
                              ${selectedDifficulty === diff.value
                                ? 'bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-medium border border-purple-300/50 dark:border-purple-500/50'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 border border-transparent transition-colors duration-300'}`}
                          >
                            {diff.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset button */}
                    <button
                      onClick={() => {
                        setSelectedSubject('Tất cả');
                        setSelectedType('all');
                        setSelectedDifficulty('all');
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300
                        hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-300 mt-2"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors duration-300'}`}
          >
            <Menu className="h-4 w-4 inline-block mr-2" />
            Tất cả
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'popular'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors duration-300'}`}
          >
            <Zap className="h-4 w-4 inline-block mr-2" />
            Phổ biến
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'new'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors duration-300'}`}
          >
            <Calendar className="h-4 w-4 inline-block mr-2" />
            Mới nhất
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'saved'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors duration-300'}`}
          >
            <BookMarked className="h-4 w-4 inline-block mr-2" />
            Đã lưu
          </button>
        </motion.div>

        {/* Exams grid with loading state */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeleton loading
            [...Array(6)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ExamCardSkeleton />
              </motion.div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative"
                    onMouseEnter={() => setHoveredExam(exam.id)}
                    onMouseLeave={() => setHoveredExam(null)}
                  >
                    {/* Tooltip Preview */}
                    <TooltipPreview
                      exam={exam}
                      isVisible={hoveredExam === exam.id}
                    />

                    <Card3D className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm
                      border border-slate-300/50 dark:border-slate-700/50 hover:border-purple-500/30 transition-all duration-300
                      hover:shadow-lg hover:shadow-purple-500/10">
                      {/* Badge for popular or new */}
                      {exam.isNew && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            bg-green-500/20 text-green-400 border border-green-500/30">
                            Mới
                          </span>
                        </div>
                      )}
                      {exam.popular && !exam.isNew && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Hot
                          </span>
                        </div>
                      )}

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSave(exam.id);
                        }}
                        className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/30 backdrop-blur-sm
                          hover:bg-black/50 transition-colors"
                      >
                        {savedExams.includes(exam.id) ? (
                          <Bookmark className="h-5 w-5 text-purple-400 fill-purple-400" />
                        ) : (
                          <BookmarkPlus className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                        )}
                      </button>

                      <Link href={`/de-thi/${exam.id}`}>
                        <div className="p-6">
                          {/* Subject and type */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-colors duration-300">
                                {exam.subject}
                              </span>
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 transition-colors duration-300">
                                {exam.type === 'multiple' ? 'Trắc nghiệm' : exam.type === 'essay' ? 'Tự luận' : 'Kết hợp'}
                              </span>
                            </div>
                            {renderDifficultyStars(exam.difficulty)}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                            {exam.title}
                          </h3>

                          {/* Teacher */}
                          <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                            {exam.teacherName}
                          </p>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-600/50 to-transparent my-4 transition-colors duration-300" />

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                              <span className="text-slate-600 dark:text-gray-300 transition-colors duration-300">{exam.duration} phút</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                              <span className="text-slate-600 dark:text-gray-300 transition-colors duration-300">{exam.exams.toLocaleString()}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Star className="h-4 w-4 text-yellow-500 transition-colors duration-300" />
                              <span className="text-slate-600 dark:text-gray-300 transition-colors duration-300">{exam.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between transition-colors duration-300">
                          <button
                            className="text-sm text-slate-600 dark:text-gray-300 font-medium hover:text-slate-800 dark:hover:text-gray-100 transition-colors duration-300 flex items-center gap-1.5"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Preview logic would go here
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span>Xem trước</span>
                          </button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500 to-blue-500
                              text-white hover:shadow-md hover:shadow-purple-500/20 transition-all"
                          >
                            Làm bài
                          </motion.button>
                        </div>
                      </Link>
                    </Card3D>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                >
                  <BookOpen className="h-16 w-16 text-slate-400 dark:text-gray-500 mb-4 transition-colors duration-300" />
                  <h3 className="text-lg font-medium text-slate-700 dark:text-gray-300 mb-2 transition-colors duration-300">Không tìm thấy đề thi</h3>
                  <p className="text-slate-500 dark:text-gray-400 max-w-md transition-colors duration-300">
                    Không có đề thi nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với bộ lọc khác.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSubject('Tất cả');
                      setSelectedType('all');
                      setSelectedDifficulty('all');
                      setActiveTab('all');
                    }}
                    className="mt-6 px-4 py-2 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Additional features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
          >
            <Monitor className="h-10 w-10 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Chế độ thi online</h3>
            <p className="text-gray-300 mb-4">
              Làm bài thi trực tuyến với giao diện hiện đại, dễ sử dụng và tính thời gian chính xác.
            </p>
            <Link
              href="#"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors inline-flex items-center gap-1"
            >
              Tìm hiểu thêm
              <ChevronDown className="h-4 w-4 rotate-270" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
          >
            <Download className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Chế độ offline</h3>
            <p className="text-gray-300 mb-4">
              Tải đề thi về máy để làm bài khi không có kết nối internet. Đồng bộ kết quả khi online.
            </p>
            <Link
              href="#"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-1"
            >
              Tìm hiểu thêm
              <ChevronDown className="h-4 w-4 rotate-270" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
          >
            <BarChart2 className="h-10 w-10 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Phân tích điểm số</h3>
            <p className="text-gray-300 mb-4">
              Theo dõi kết quả học tập, phân tích điểm mạnh điểm yếu và nhận đề xuất cải thiện.
            </p>
            <Link
              href="#"
              className="text-green-400 hover:text-green-300 font-medium transition-colors inline-flex items-center gap-1"
            >
              Tìm hiểu thêm
              <ChevronDown className="h-4 w-4 rotate-270" />
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}