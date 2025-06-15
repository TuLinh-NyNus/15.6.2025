'use client';

import { motion } from 'framer-motion';
import { Zap, Target, Flame } from 'lucide-react';

export type DifficultyType = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  gradient: string;
}

const difficultyConfig: Record<DifficultyType, DifficultyConfig> = {
  easy: {
    label: 'Dễ',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: <Zap className="h-3 w-3" />,
    gradient: 'from-green-400 to-green-600'
  },
  medium: {
    label: 'Trung bình',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: <Target className="h-3 w-3" />,
    gradient: 'from-orange-400 to-orange-600'
  },
  hard: {
    label: 'Khó',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: <Flame className="h-3 w-3" />,
    gradient: 'from-red-400 to-red-600'
  }
};

interface DifficultyBadgeProps {
  difficulty: DifficultyType | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'gradient';
  showIcon?: boolean;
  className?: string;
}

export default function DifficultyBadge({
  difficulty,
  size = 'md',
  variant = 'default',
  showIcon = true,
  className = ''
}: DifficultyBadgeProps) {
  // Default to medium if difficulty is null/undefined
  const difficultyType: DifficultyType = difficulty || 'medium';
  const config = difficultyConfig[difficultyType];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  };

  if (variant === 'minimal') {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-1 ${sizeClasses[size]} 
          ${config.color} font-medium ${className}`}
      >
        {showIcon && (
          <span className={iconSizes[size]}>
            {config.icon}
          </span>
        )}
        {config.label}
      </motion.span>
    );
  }

  if (variant === 'gradient') {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center gap-1.5 ${sizeClasses[size]}
          bg-gradient-to-r ${config.gradient} text-white font-medium rounded-full
          shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
      >
        {showIcon && (
          <span className={iconSizes[size]}>
            {config.icon}
          </span>
        )}
        {config.label}
      </motion.span>
    );
  }

  // Default variant
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]}
        ${config.bgColor} ${config.color} ${config.borderColor}
        border font-medium rounded-full transition-all duration-200 ${className}`}
    >
      {showIcon && (
        <span className={iconSizes[size]}>
          {config.icon}
        </span>
      )}
      {config.label}
    </motion.span>
  );
}

// Export difficulty levels for use in other components
export const DIFFICULTY_LEVELS: DifficultyType[] = ['easy', 'medium', 'hard'];

export const getDifficultyConfig = (difficulty: DifficultyType) => {
  return difficultyConfig[difficulty];
};

// Utility function to get difficulty color for styling
export const getDifficultyColor = (difficulty: DifficultyType | null | undefined) => {
  const difficultyType: DifficultyType = difficulty || 'medium';
  return difficultyConfig[difficultyType].color;
};

// Utility function to get difficulty background for styling
export const getDifficultyBackground = (difficulty: DifficultyType | null | undefined) => {
  const difficultyType: DifficultyType = difficulty || 'medium';
  return difficultyConfig[difficultyType].bgColor;
};
