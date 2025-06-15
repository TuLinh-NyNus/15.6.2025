'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps as NextThemeProviderProps } from "next-themes";
import * as React from "react";

// Sử dụng type từ thư viện next-themes
type ThemeProviderProps = NextThemeProviderProps;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Sử dụng attribute="class" để đảm bảo tương thích với next-themes
  // Thư viện next-themes sẽ tự động thêm/xóa class "dark" khi cần
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}