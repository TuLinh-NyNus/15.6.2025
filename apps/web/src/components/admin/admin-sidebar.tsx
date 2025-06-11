'use client';

import { ChevronLeft, ChevronRight, LayoutDashboard, Users, BookOpen, FileText, GraduationCap, HelpCircle, BrainCircuit, MessageSquare, BarChart2, Settings, Database, MessagesSquare, Moon, Sun, LogOut, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
  hidden?: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/3141592654/admin/dashboard'
  },
  {
    title: 'Quản lý người dùng',
    icon: Users,
    href: '/3141592654/admin/users'
  },
  {
    title: 'Sách & Tài liệu',
    icon: BookOpen,
    href: '/3141592654/admin/books'
  },
  {
    title: 'Đề thi & Kiểm tra',
    icon: FileText,
    href: '/3141592654/admin/exams'
  },
  {
    title: 'Khóa học',
    icon: GraduationCap,
    href: '/3141592654/admin/courses'
  },
  {
    title: 'Ngân hàng câu hỏi',
    icon: HelpCircle,
    href: '/3141592654/admin/questions'
  },
  {
    title: 'Tra cứu MapID',
    icon: Map,
    href: '/3141592654/admin/questions/map-id',
    hidden: true // Ẩn mục này khỏi menu
  },
  {
    title: 'Ngân hàng đề thi',
    icon: Database,
    href: '/3141592654/admin/exam-bank'
  },
  {
    title: 'Câu hỏi FAQ',
    icon: MessageSquare,
    href: '/3141592654/admin/faq'
  },
  {
    title: 'ChatAI',
    icon: BrainCircuit,
    href: '/3141592654/admin/chat-ai'
  },
  {
    title: 'Diễn đàn',
    icon: MessagesSquare,
    href: '/3141592654/admin/forum'
  },
  {
    title: 'Thống kê & Báo cáo',
    icon: BarChart2,
    href: '/3141592654/admin/analytics'
  },
  {
    title: 'Cấu hình hệ thống',
    icon: Settings,
    href: '/3141592654/admin/settings'
  }
];

export function AdminSidebar({ isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className={cn(
        "fixed left-0 flex flex-col h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300",
          isCollapsed && "justify-center"
        )}
      >
        <h1 className={cn(
          "font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-opacity duration-300",
          isCollapsed ? "opacity-0 w-0" : "opacity-100"
        )}>
          NyNus Admin
        </h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCollapse();
                }}
                className={cn(
                  "text-white transition-all",
                  isCollapsed
                    ? "w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full shadow-md shadow-purple-500/20 animate-pulse"
                    : "w-8 h-8 bg-purple-500/20 hover:bg-purple-500/40 active:bg-purple-500/60"
                )}
                aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              >
                {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-2 px-2">
          {menuItems.filter(item => !item.hidden).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg transition-all duration-200 h-10",
                "hover:bg-slate-200/70 dark:hover:bg-slate-800/50 transition-colors duration-300",
                pathname === item.href ? "bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400",
                isCollapsed
                  ? "justify-center px-0"
                  : "px-3 gap-3"
              )}
            >
              <div className={cn(
                "flex items-center justify-center",
                isCollapsed ? "w-full h-full" : "w-6 h-6"
              )}>
                <item.icon size={isCollapsed ? 24 : 20} />
              </div>
              <span className={cn(
                "transition-all duration-300",
                isCollapsed ? "hidden" : "block"
              )}>
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer với các nút chức năng */}
      <div className={cn(
        "mt-auto border-t border-slate-200 dark:border-slate-800 p-4 transition-colors duration-300",
        isCollapsed ? "flex flex-col items-center space-y-2" : "grid grid-cols-2 gap-2"
      )}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                onClick={toggleTheme}
                className={cn(
                  "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-300",
                  isCollapsed ? "w-12 h-12" : "w-full h-8 py-1 px-2 flex justify-center gap-2"
                )}
              >
                {theme === 'dark' ? <Sun className={isCollapsed ? "h-5 w-5" : "h-3.5 w-3.5"} /> : <Moon className={isCollapsed ? "h-5 w-5" : "h-3.5 w-3.5"} />}
                {!isCollapsed && <span className="text-xs font-medium whitespace-nowrap">Giao diện</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? "right" : "top"}>
              <p>Chuyển đổi giao diện sáng/tối</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCollapsed ? "ghost" : "outline"}
                size={isCollapsed ? "icon" : "default"}
                onClick={handleLogout}
                className={cn(
                  "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-600/20 transition-colors duration-300",
                  isCollapsed
                    ? "w-12 h-12"
                    : "w-full h-8 py-1 px-2 flex items-center justify-center gap-2 bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300"
                )}
              >
                <LogOut className={isCollapsed ? "h-5 w-5" : "h-3.5 w-3.5"} />
                {!isCollapsed && <span className="text-xs font-medium whitespace-nowrap">Đăng xuất</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? "right" : "top"}>
              <p>Đăng xuất</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}