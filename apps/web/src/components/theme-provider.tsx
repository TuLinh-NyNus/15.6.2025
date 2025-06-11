'use client';

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

// Định nghĩa lại interface để phù hợp với thư viện next-themes
interface ThemeProviderProps {
  children: React.ReactNode;
  forcedTheme?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  // Định nghĩa kiểu cụ thể cho attribute
  attribute?: string | {
    light?: string;
    dark?: string;
    system?: string;
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Sử dụng attribute="class" để đảm bảo tương thích với next-themes
  // Thư viện next-themes sẽ tự động thêm/xóa class "dark" khi cần
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}