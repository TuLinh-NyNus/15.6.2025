'use client';

import { motion } from 'framer-motion';
import { Calendar, User, Eye, BookOpen, MessageSquare } from 'lucide-react';
import DifficultyBadge, { DifficultyType } from './DifficultyBadge';

interface QuestionSearchItemProps {
  question: {
    id: string;
    content: string;
    difficulty: DifficultyType;
    type: string;
    tags: string[];
    createdAt: string;
    creator?: {
      name: string;
    };
    usageCount?: number;
    viewCount?: number;
  };
  index?: number;
  onClick?: () => void;
}

const typeLabels: Record<string, string> = {
  'MC': 'Trắc nghiệm',
  'MULTIPLE_CHOICE': 'Trắc nghiệm',
  'TF': 'Đúng/Sai',
  'TRUE_FALSE': 'Đúng/Sai',
  'SA': 'Tự luận ngắn',
  'SHORT_ANSWER': 'Tự luận ngắn',
  'ES': 'Tự luận dài',
  'ESSAY': 'Tự luận dài',
  'MA': 'Nhiều đáp án',
  'MULTIPLE_ANSWER': 'Nhiều đáp án'
};

export default function QuestionSearchItem({ 
  question, 
  index = 0, 
  onClick 
}: QuestionSearchItemProps) {
  const typeLabel = typeLabels[question.type] || question.type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2, shadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      onClick={onClick}
      className="group p-5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 
        hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Question Content */}
          <div className="mb-3">
            <p className="text-slate-800 dark:text-white font-medium leading-relaxed line-clamp-3 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
              {question.content}
            </p>
          </div>

          {/* Question Meta */}
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{typeLabel}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{question.createdAt}</span>
            </div>

            {question.creator && (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{question.creator.name}</span>
              </div>
            )}

            {question.viewCount && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{question.viewCount}</span>
              </div>
            )}

            {question.usageCount && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Sử dụng {question.usageCount} lần</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {question.tags.slice(0, 4).map(tag => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 
                    text-xs rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 
                    hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
                >
                  #{tag}
                </motion.span>
              ))}
              {question.tags.length > 4 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  +{question.tags.length - 4} thêm
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Difficulty & Actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <DifficultyBadge
            difficulty={question.difficulty}
            size="sm"
            variant="default"
          />

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 
                  hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle view action
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 
                  hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle bookmark action
                }}
              >
                <BookOpen className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Progress bar animation on hover */}
      <motion.div
        className="h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-4 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
