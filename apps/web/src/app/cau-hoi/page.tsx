'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, X, History, Tag, Sparkles, ArrowRight, Zap, Flame, Image as ImageIcon, Command } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef, useMemo } from 'react';

interface SearchSuggestion {
  id: string;
  type: 'course' | 'tutorial' | 'livestream' | 'document';
  title: string;
  icon: string;
  tags?: string[];
}

const recentSearches = [
  "Phương trình bậc 2",
  "Giải tích 12",
  "Hình học không gian",
];

const quickLinks: SearchSuggestion[] = [
  {
    id: '1',
    type: 'course',
    title: 'Toán học 10 - Chương trình cơ bản',
    icon: '📚',
    tags: ['#Toán10', '#CơBản']
  },
  {
    id: '2',
    type: 'tutorial',
    title: 'Hướng dẫn giải phương trình bậc 2',
    icon: '📝',
    tags: ['#Đại số', '#Toán10']
  },
  {
    id: '3',
    type: 'livestream',
    title: 'Live - Ôn tập Toán thi đại học',
    icon: '🎥',
    tags: ['#ÔnThi', '#ĐạiHọc']
  },
];

const trendingSearches = [
  "Ôn thi THPT Quốc Gia",
  "Vật lý 12",
  "Tiếng Anh giao tiếp",
  "Luyện đề ĐGNL"
];

const filterCategories = [
  { id: 'all', name: 'Tất cả' },
  { id: 'courses', name: 'Khóa học' },
  { id: 'documents', name: 'Tài liệu' },
  { id: 'questions', name: 'Câu hỏi' },
  { id: 'tutorials', name: 'Bài giảng' },
];

const aiSuggestions = [
  "Làm thế nào để giải phương trình bậc 3?",
  "Cách viết đoạn văn tiếng Anh hay",
  "Tìm giá trị lớn nhất của hàm số f(x) = x³ - 3x",
  "Hướng dẫn giải toán tích phân"
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [typingEffect, setTypingEffect] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [showKeyboardShortcut, setShowKeyboardShortcut] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme } = useTheme();

  // Typing effect for placeholder
  useEffect(() => {
    const placeholders = [
      "Tìm kiếm câu hỏi...",
      "Tìm tài liệu học tập...",
      "Tìm bài giảng video...",
      "Tìm kiếm khóa học..."
    ];

    if (!isFocused) {
      const interval = setInterval(() => {
        const currentPlaceholder = placeholders[typingIndex];

        if (typingEffect.length < currentPlaceholder.length) {
          setTypingEffect(currentPlaceholder.substring(0, typingEffect.length + 1));
        } else {
          setTimeout(() => {
            setTypingEffect('');
            setTypingIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
          }, 1500);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [typingEffect, typingIndex, isFocused]);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }

      if (event.key === 'Escape' && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice search simulation
  const handleVoiceSearch = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setSearchTerm('Toán học');
    }, 2000);
  };

  // Auto-complete suggestions based on search term
  const autoCompleteSuggestions = useMemo(() => {
    if (!searchTerm) return [];

    const suggestions = [
      `${searchTerm} lớp 10`,
      `${searchTerm} cơ bản`,
      `${searchTerm} nâng cao`,
      `Hướng dẫn ${searchTerm}`,
      `Bài tập ${searchTerm}`,
    ];

    return suggestions;
  }, [searchTerm]);

  // Particle effect for background
  const ParticleBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-purple-500 opacity-20"
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
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: `${Math.random() * 15 + 5}px`,
            height: `${Math.random() * 15 + 5}px`,
          }}
        />
      ))}
    </div>
  );

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-50 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 overflow-hidden transition-colors duration-300">
      <ParticleBackground />

      <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-slate-800 dark:text-white mb-4 transition-colors duration-300"
        >
          CÂU HỎI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-center text-slate-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto transition-colors duration-300"
        >
          Tìm kiếm câu hỏi từ cộng đồng học tập, tài liệu hoặc bài giảng của các giảng viên
        </motion.p>

        {/* Keyboard shortcut hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
          className="flex items-center justify-center gap-2 mb-8 text-sm text-slate-500 dark:text-gray-400 transition-colors duration-300"
        >
          <span>Nhấn</span>
          <kbd className="px-2 py-1 bg-slate-200 dark:bg-gray-800 rounded-md border border-slate-300 dark:border-gray-700 text-xs text-slate-700 dark:text-white transition-colors duration-300">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-slate-200 dark:bg-gray-800 rounded-md border border-slate-300 dark:border-gray-700 text-xs text-slate-700 dark:text-white transition-colors duration-300">
            K
          </kbd>
          <span>để tìm kiếm nhanh</span>
        </motion.div>

        <div
          ref={searchRef}
          className="relative max-w-3xl mx-auto"
        >
          {/* Filter Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-6"
          >
            {filterCategories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(category.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                  ${activeFilter === category.id
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors duration-300'}`}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>

          {/* Search Input */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`relative ${isFocused
              ? 'ring-2 ring-purple-500 ring-opacity-60 shadow-lg shadow-purple-500/20'
              : 'hover:shadow-md hover:shadow-purple-500/10 transition-shadow duration-300'}`}
            onMouseEnter={() => setShowKeyboardShortcut(true)}
            onMouseLeave={() => setShowKeyboardShortcut(false)}
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder={isFocused ? "Tìm kiếm câu hỏi, bài giảng, tài liệu..." : typingEffect}
                className="w-full h-16 pl-12 pr-40 rounded-xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl
                  text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 border border-slate-300/50 dark:border-slate-700/50
                  focus:outline-none focus:border-purple-500/50 transition-all duration-300
                  hover:bg-white/90 dark:hover:bg-slate-800/70"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-gray-400 transition-colors duration-300">
                <Search className="h-5 w-5" />
              </div>

              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setSearchTerm('')}
                    className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 rounded-full transition-colors duration-300"
                  >
                    <X className="h-4 w-4 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {}}
                  className="p-2 rounded-full transition-colors hover:bg-slate-200/70 dark:hover:bg-slate-700/50 text-slate-500 dark:text-gray-400 duration-300"
                >
                  <ImageIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-full transition-colors
                    ${isListening
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/50 text-slate-500 dark:text-gray-400 transition-colors duration-300'}`}
                >
                  <Mic className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Keyboard shortcut hint */}
              <AnimatePresence>
                {showKeyboardShortcut && !isFocused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-4 bottom-0 transform translate-y-full mt-2 px-2 py-1
                      bg-slate-200 dark:bg-gray-800 rounded text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1 transition-colors duration-300"
                  >
                    <Command className="h-3 w-3" />
                    <span>+</span>
                    <span>K</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl
                    border border-slate-300/50 dark:border-slate-700/50 shadow-xl z-50 transition-colors duration-300"
                >
                  {/* Auto-complete */}
                  {searchTerm && autoCompleteSuggestions.length > 0 && (
                    <div className="px-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                        <Zap className="h-4 w-4 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                        <span>Gợi ý tự động</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {autoCompleteSuggestions.map((suggestion, index) => (
                          <motion.button
                            key={suggestion}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSearchTerm(suggestion)}
                            className="flex items-center gap-2 p-2 text-left text-sm text-slate-700 dark:text-gray-300
                              bg-slate-200/50 dark:bg-slate-700/30 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-300"
                          >
                            <Search className="h-3.5 w-3.5 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                            <span>{suggestion}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions */}
                  <div className="px-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                      <svg className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>AI có thể giúp bạn</span>
                    </div>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={suggestion}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSearchTerm(suggestion)}
                          className="flex w-full items-center justify-between p-2 rounded-lg
                            bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-500/10 dark:to-blue-500/10
                            hover:from-purple-200/50 hover:to-blue-200/50 dark:hover:from-purple-500/20 dark:hover:to-blue-500/20
                            text-left text-slate-700 dark:text-gray-300 transition-colors duration-300 group"
                        >
                          <span className="text-sm">{suggestion}</span>
                          <ArrowRight className="h-4 w-4 text-purple-400 transform transition-transform group-hover:translate-x-1" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {!searchTerm && recentSearches.length > 0 && (
                    <div className="px-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                        <History className="h-4 w-4 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                        <span>Tìm kiếm gần đây</span>
                      </div>
                      {recentSearches.map((search, index) => (
                        <motion.button
                          key={search}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSearchTerm(search)}
                          className="block w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300
                            hover:bg-slate-200/70 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-300"
                        >
                          {search}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Trending Searches */}
                  {!searchTerm && (
                    <div className="px-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                        <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400 transition-colors duration-300" />
                        <span>Xu hướng tìm kiếm</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((search, index) => (
                          <motion.button
                            key={search}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSearchTerm(search)}
                            className="px-3 py-1.5 bg-orange-100/50 dark:bg-orange-500/10 hover:bg-orange-200/50 dark:hover:bg-orange-500/20
                              text-orange-600 dark:text-orange-300 text-sm rounded-full transition-colors duration-300"
                          >
                            {search}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                      <Sparkles className="h-4 w-4 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                      <span>Gợi ý cho bạn</span>
                    </div>
                    {quickLinks.map((link, index) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-start gap-3 p-3 hover:bg-slate-200/70 dark:hover:bg-slate-700/50
                          rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                      >
                        <span className="text-2xl">{link.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-slate-700 dark:text-gray-200 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                            {link.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {link.tags?.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5
                                  bg-purple-100/50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs rounded-full
                                  group-hover:bg-purple-200/50 dark:group-hover:bg-purple-500/20 transition-colors duration-300"
                              >
                                <Tag className="h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Background blur effect when focused */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}