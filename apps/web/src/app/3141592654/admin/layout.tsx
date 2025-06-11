'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);

  // Chỉ run effect này ở phía client để tránh lỗi hydration
  useEffect(() => {
    setMounted(true);
    // setCurrentTheme(theme);

    // Lấy trạng thái sidebar từ localStorage nếu có
    const savedSidebarState = localStorage.getItem('admin-sidebar-collapsed');
    if (savedSidebarState !== null) {
      setIsSidebarCollapsed(savedSidebarState === 'true');
    }
  }, [theme]);

  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    // Lưu trạng thái vào localStorage
    localStorage.setItem('admin-sidebar-collapsed', String(newState));
    // console.log('Sidebar toggled to:', newState ? 'collapsed' : 'expanded');
  };

  // Tránh render nội dung phụ thuộc vào client-side cho đến khi được mounted
  // Điều này giúp tránh lỗi hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
        <div className="flex min-h-screen">
          <div className="w-64 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 transition-colors duration-300"></div>
          <main className="flex-1 p-6 ml-64">
            <div className="h-full rounded-xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
              {/* Placeholder để giữ layout ổn định trong quá trình hydration */}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300">
      <div className="flex min-h-screen">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
        <main
          className={cn(
            "flex-1 p-6 transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "ml-20" : "ml-64"
          )}
        >
          <div className="h-full rounded-xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}