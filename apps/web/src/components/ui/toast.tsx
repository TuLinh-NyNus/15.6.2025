'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type ToastActionElement = React.ReactElement<unknown>;

const toastVariants = cva(
  'pointer-events-auto relative flex w-full items-center justify-between space-x-1 overflow-hidden rounded-md border p-1.5 pr-5 shadow-lg transition-all text-xs', // Giảm kích thước padding và font
  {
    variants: {
      variant: {
        default: 'bg-background',
        destructive: 'border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-500 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning: 'border-yellow-500 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        info: 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants> & { onClose?: () => void }
>(({ className, variant, children, onClose, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-0.5 top-0.5 rounded-md p-0.5 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1"
        >
          <X className="h-2.5 w-2.5" /> {/* Giảm kích thước biểu tượng X */}
        </button>
      )}
    </div>
  );
});
Toast.displayName = 'Toast';

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-2 gap-1 sm:flex-col md:max-w-[280px]">
      {/* Đặt vị trí cố định ở góc dưới bên phải, giảm padding, thêm gap giữa các thông báo, giảm chiều rộng tối đa */}
      {children}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ToastViewport({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <div className="font-medium text-xs">{children}</div>; // Giảm kích thước font
}

export function ToastDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-xs opacity-90">{children}</div>;
}

export function ToastClose({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className="absolute right-0.5 top-0.5 rounded-md p-0.5 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1"
    >
      <X className="h-2.5 w-2.5" /> {/* Giảm kích thước biểu tượng X */}
    </button>
  );
}

export function ToastAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}