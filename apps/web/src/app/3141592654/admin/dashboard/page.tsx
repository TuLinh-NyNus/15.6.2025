'use client';

import { Users, BookOpen, FileText, MessageSquare } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const statsCards = [
  {
    title: 'Tổng người dùng',
    value: '12,345',
    icon: Users,
    trend: '+12%',
    trendUp: true,
  },
  {
    title: 'Sách & Tài liệu',
    value: '5,678',
    icon: BookOpen,
    trend: '+8%',
    trendUp: true,
  },
  {
    title: 'Đề thi & Kiểm tra',
    value: '2,468',
    icon: FileText,
    trend: '+15%',
    trendUp: true,
  },
  {
    title: 'Hoạt động diễn đàn',
    value: '1,234',
    icon: MessageSquare,
    trend: '-3%',
    trendUp: false,
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="p-4 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{card.title}</p>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 transition-colors duration-300">{card.value}</h2>
                <p className={cn(
                  "text-sm mt-1",
                  card.trendUp ? "text-green-400" : "text-red-400"
                )}>
                  {card.trend} so với tuần trước
                </p>
              </div>
              <card.icon className="h-8 w-8 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Thống kê hoạt động</h2>
        <div className="h-[400px] w-full bg-slate-200/50 dark:bg-slate-700/30 rounded-lg flex items-center justify-center transition-colors duration-300">
          <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Biểu đồ thống kê sẽ được hiển thị ở đây</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-100/80 dark:bg-slate-700/30 transition-colors duration-300">
                <div className="h-10 w-10 rounded-full bg-purple-100/80 dark:bg-purple-500/20 flex items-center justify-center transition-colors duration-300">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-800 dark:text-white transition-colors duration-300">Người dùng mới đăng ký</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">2 phút trước</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Thông báo hệ thống</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-100/80 dark:bg-slate-700/30 transition-colors duration-300">
                <div className="h-10 w-10 rounded-full bg-blue-100/80 dark:bg-blue-500/20 flex items-center justify-center transition-colors duration-300">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-800 dark:text-white transition-colors duration-300">Cập nhật hệ thống mới</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">1 giờ trước</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}