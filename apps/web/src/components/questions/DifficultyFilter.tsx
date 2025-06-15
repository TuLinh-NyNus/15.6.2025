'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Zap, Target, Flame } from 'lucide-react';

export interface DifficultyLevel {
  value: 'easy' | 'medium' | 'hard';
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
}

const difficultyLevels: DifficultyLevel[] = [
  {
    value: 'easy',
    label: 'Dễ',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: <Zap className="h-4 w-4" />,
    description: 'Câu hỏi cơ bản, phù hợp cho người mới bắt đầu'
  },
  {
    value: 'medium',
    label: 'Trung bình',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: <Target className="h-4 w-4" />,
    description: 'Câu hỏi có độ khó vừa phải, cần kiến thức nền tảng'
  },
  {
    value: 'hard',
    label: 'Khó',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: <Flame className="h-4 w-4" />,
    description: 'Câu hỏi nâng cao, đòi hỏi tư duy phân tích cao'
  }
];

interface DifficultyFilterProps {
  selectedDifficulties: string[];
  onDifficultyChange: (difficulties: string[]) => void;
  className?: string;
}

export default function DifficultyFilter({
  selectedDifficulties,
  onDifficultyChange,
  className = ''
}: DifficultyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDifficultyToggle = (difficulty: string) => {
    const newDifficulties = selectedDifficulties.includes(difficulty)
      ? selectedDifficulties.filter(d => d !== difficulty)
      : [...selectedDifficulties, difficulty];
    
    onDifficultyChange(newDifficulties);
  };

  const getSelectedLabel = () => {
    if (selectedDifficulties.length === 0) return 'Tất cả độ khó';
    if (selectedDifficulties.length === 1) {
      const level = difficultyLevels.find(d => d.value === selectedDifficulties[0]);
      return level?.label || 'Độ khó';
    }
    return `${selectedDifficulties.length} độ khó`;
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2.5 
          bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600
          rounded-lg shadow-sm hover:shadow-md transition-all duration-200
          text-slate-700 dark:text-slate-200 min-w-[160px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{getSelectedLabel()}</span>
          {selectedDifficulties.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 
              text-purple-600 dark:text-purple-400 text-xs rounded-full">
              {selectedDifficulties.length}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50
              bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600
              rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 
                px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                Chọn độ khó câu hỏi
              </div>
              
              {difficultyLevels.map((level, index) => (
                <motion.button
                  key={level.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleDifficultyToggle(level.value)}
                  className="w-full flex items-center gap-3 px-3 py-3
                    hover:bg-slate-50 dark:hover:bg-slate-700/50 
                    transition-colors duration-150 group"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${level.bgColor}`}>
                    <span className={level.color}>
                      {level.icon}
                    </span>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {level.label}
                      </span>
                      {selectedDifficulties.includes(level.value) && (
                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {level.description}
                    </p>
                  </div>
                </motion.button>
              ))}
              
              {selectedDifficulties.length > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onDifficultyChange([])}
                  className="w-full px-3 py-2 mt-2 text-sm text-slate-500 dark:text-slate-400
                    hover:text-slate-700 dark:hover:text-slate-200 
                    border-t border-slate-200 dark:border-slate-700
                    transition-colors duration-150"
                >
                  Xóa tất cả bộ lọc
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
