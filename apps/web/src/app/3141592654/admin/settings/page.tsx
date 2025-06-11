'use client';

import { Settings, Server, Shield, Bell, Mail, Brush, Database, Key, Globe, Users, MessageSquare, BrainCircuit, Save } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';


const settingCategories = [
  {
    id: 'general',
    icon: Settings,
    title: 'Cài đặt chung',
    description: 'Cấu hình cơ bản của hệ thống',
  },
  {
    id: 'server',
    icon: Server,
    title: 'Máy chủ',
    description: 'Cài đặt máy chủ và hiệu suất',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Bảo mật',
    description: 'Cài đặt bảo mật và quyền truy cập',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Thông báo',
    description: 'Cấu hình thông báo hệ thống',
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Email',
    description: 'Cài đặt email và mẫu thông báo',
  },
  {
    id: 'appearance',
    icon: Brush,
    title: 'Giao diện',
    description: 'Tùy chỉnh giao diện người dùng',
  },
  {
    id: 'database',
    icon: Database,
    title: 'Cơ sở dữ liệu',
    description: 'Quản lý và sao lưu dữ liệu',
  },
  {
    id: 'api',
    icon: Key,
    title: 'API',
    description: 'Quản lý khóa API và tích hợp',
  },
  {
    id: 'localization',
    icon: Globe,
    title: 'Ngôn ngữ',
    description: 'Cài đặt ngôn ngữ và khu vực',
  },
  {
    id: 'users',
    icon: Users,
    title: 'Người dùng',
    description: 'Cấu hình mặc định cho người dùng',
  },
  {
    id: 'forum',
    icon: MessageSquare,
    title: 'Diễn đàn',
    description: 'Cài đặt diễn đàn và bình luận',
  },
  {
    id: 'ai',
    icon: BrainCircuit,
    title: 'ChatAI',
    description: 'Cấu hình trí tuệ nhân tạo',
  },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('general');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Cấu hình hệ thống</h1>
        </div>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300 hover:scale-105 flex items-center gap-2">
          <Save className="h-4 w-4" />
          Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Danh mục cài đặt */}
        <Card className="md:col-span-3 p-4 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <nav className="space-y-1">
            {settingCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-300",
                  activeCategory === category.id
                    ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                )}
              >
                <category.icon className="h-5 w-5" />
                <span>{category.title}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Nội dung cài đặt */}
        <div className="md:col-span-9 space-y-6">
          <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="space-y-6">
              {/* Cài đặt chung */}
              {activeCategory === 'general' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Tên trang web</label>
                    <input
                      type="text"
                      defaultValue="NyNus - Nền tảng học tập trực tuyến"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Mô tả</label>
                    <textarea
                      rows={3}
                      defaultValue="Nền tảng học tập trực tuyến hàng đầu với đầy đủ tài liệu, đề thi và công cụ hỗ trợ học tập."
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <Image src="/logo.png" alt="Logo" width={48} height={48} />
                      </div>
                      <button className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors duration-300 hover:scale-105">
                        Thay đổi
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Favicon</label>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <Image src="/favicon.ico" alt="Favicon" width={24} height={24} />
                      </div>
                      <button className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors duration-300 hover:scale-105">
                        Thay đổi
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Địa chỉ liên hệ</label>
                    <input
                      type="email"
                      defaultValue="contact@nynus.edu.vn"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Mạng xã hội</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Facebook"
                        defaultValue="https://facebook.com/nynus"
                        className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                      />
                      <input
                        type="text"
                        placeholder="Youtube"
                        defaultValue="https://youtube.com/nynus"
                        className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Bảo trì hệ thống</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Kích hoạt chế độ bảo trì</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Cài đặt máy chủ */}
              {activeCategory === 'server' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Giới hạn tải lên</label>
                    <input
                      type="number"
                      defaultValue="50"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                    <p className="text-xs text-slate-500 transition-colors duration-300">Đơn vị: MB</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Thời gian chờ</label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                    <p className="text-xs text-slate-500 transition-colors duration-300">Đơn vị: giây</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Giới hạn yêu cầu API</label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                    <p className="text-xs text-slate-500 transition-colors duration-300">Số lượng yêu cầu/phút</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Nén dữ liệu</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Kích hoạt nén GZIP</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Bộ nhớ đệm</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Kích hoạt bộ nhớ đệm</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      defaultValue="60"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                    <p className="text-xs text-slate-500 transition-colors duration-300">Thời gian lưu cache (phút)</p>
                  </div>
                </div>
              )}

              {/* Cài đặt bảo mật */}
              {activeCategory === 'security' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Chính sách mật khẩu</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Yêu cầu chữ hoa</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Yêu cầu số</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Yêu cầu ký tự đặc biệt</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      defaultValue="8"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                    <p className="text-xs text-slate-500 transition-colors duration-300">Độ dài tối thiểu</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Xác thực hai yếu tố</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Bắt buộc cho tài khoản admin</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Giới hạn đăng nhập</label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                    <p className="text-xs text-slate-500 transition-colors duration-300">Số lần thử tối đa</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Thời gian khóa</label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                    />
                    <p className="text-xs text-slate-500 transition-colors duration-300">Thời gian khóa tài khoản (phút)</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">CAPTCHA</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 transition-colors duration-300" />
                        <span className="text-slate-800 dark:text-white transition-colors duration-300">Kích hoạt CAPTCHA khi đăng nhập</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Các cài đặt khác sẽ được hiển thị tương tự */}
              {activeCategory !== 'general' && activeCategory !== 'server' && activeCategory !== 'security' && (
                <div className="flex items-center justify-center h-40">
                  <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Nội dung cài đặt {settingCategories.find(c => c.id === activeCategory)?.title.toLowerCase()} sẽ được hiển thị ở đây</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}