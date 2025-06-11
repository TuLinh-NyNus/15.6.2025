"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  shimmer?: boolean;
  className?: string;
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
  animated?: boolean;
}

export const Skeleton = ({
  shimmer = true,
  className,
  height,
  width,
  borderRadius = "0.5rem",
  animated = true,
}: SkeletonProps) => {
  const baseStyle = {
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    borderRadius,
  };

  if (!animated) {
    return (
      <div
        className={cn("bg-slate-200 dark:bg-slate-800", className)}
        style={baseStyle}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: shimmer ? [0.5, 0.8, 0.5] : 0.5 }}
      transition={{
        repeat: shimmer ? Infinity : 0,
        duration: 1.5,
        ease: "easeInOut",
      }}
      className={cn("bg-slate-200 dark:bg-slate-800", className)}
      style={baseStyle}
    />
  );
};

export default Skeleton;

export function CardSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
      <Skeleton height={24} width="70%" />
      <Skeleton height={100} />
      <Skeleton height={20} width="30%" />
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      <Skeleton height={200} borderRadius="0" />
      <div className="p-4 space-y-3">
        <Skeleton height={24} width="80%" />
        <Skeleton height={16} width="60%" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton height={20} width={80} />
          <Skeleton height={36} width={100} borderRadius="9999px" />
        </div>
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={`${Math.random() * 40 + 60}%`}
        />
      ))}
    </div>
  );
}