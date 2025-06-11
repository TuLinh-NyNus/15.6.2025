'use client';

import { BrainCircuit, RefreshCw, Filter, Search, FileText, BarChart2, Settings, MessageSquare, Users, Star, UploadCloud, Database, Clock, AlertTriangle, User } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';


const chatSessions = [
  {
    id: 1,
    user: {
      id: 'USR1234',
      name: 'Nguyễn Văn A',
      avatar: '/avatars/user1.png'
    },
    topic: 'Hỏi về phương trình bậc 2',
    messages: 8,
    feedback: 4.5,
    startTime: '2024-03-06T14:30:00',
    endTime: '2024-03-06T14:42:25',
    status: 'Hoàn thành',
    flags: []
  },
  {
    id: 2,
    user: {
      id: 'USR4567',
      name: 'Trần Thị B',
      avatar: '/avatars/user2.png'
    },
    topic: 'Giải bài tập về quang học',
    messages: 15,
    feedback: 5,
    startTime: '2024-03-07T09:15:00',
    endTime: '2024-03-07T09:35:12',
    status: 'Hoàn thành',
    flags: []
  },
  {
    id: 3,
    user: {
      id: 'USR7890',
      name: 'Lê Văn C',
      avatar: '/avatars/user3.png'
    },
    topic: 'Cách thiết lập phương trình hóa học',
    messages: 6,
    feedback: 3,
    startTime: '2024-03-07T10:20:00',
    endTime: '2024-03-07T10:28:45',
    status: 'Hoàn thành',
    flags: ['Câu hỏi không rõ ràng']
  },
  {
    id: 4,
    user: {
      id: 'USR2468',
      name: 'Phạm Thị D',
      avatar: '/avatars/user4.png'
    },
    topic: 'Luyện đề thi THPTQG môn Văn',
    messages: 20,
    feedback: null,
    startTime: '2024-03-07T13:45:00',
    endTime: null,
    status: 'Đang diễn ra',
    flags: []
  },
  {
    id: 5,
    user: {
      id: 'USR1357',
      name: 'Hoàng Văn E',
      avatar: '/avatars/user5.png'
    },
    topic: 'Câu hỏi về lịch sử Việt Nam thế kỷ 20',
    messages: 12,
    feedback: 2,
    startTime: '2024-03-06T16:10:00',
    endTime: '2024-03-06T16:25:30',
    status: 'Hoàn thành',
    flags: ['Phản hồi không chính xác', 'Cần đào tạo lại AI về chủ đề này']
  }
];

const performanceMetrics = [
  { id: 1, name: 'Phiên chat hoàn thành', value: '1,435', trend: '+12.5%', icon: MessageSquare, color: 'blue' },
  { id: 2, name: 'Trung bình đánh giá', value: '4.2/5', trend: '+0.3', icon: Star, color: 'yellow' },
  { id: 3, name: 'Người dùng hoạt động', value: '852', trend: '+8.7%', icon: Users, color: 'green' },
  { id: 4, name: 'Từ khóa phổ biến', value: '245', trend: '+24', icon: FileText, color: 'purple' },
];

export default function ChatAIPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-green-500/20 text-green-400';
      case 'Đang diễn ra':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getTimeElapsed = (start: string, end: string | null) => {
    if (!end) return 'Đang diễn ra';

    const startTime = new Date(start);
    const endTime = new Date(end);
    const elapsedMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);

    return `${minutes} phút ${seconds} giây`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Quản lý ChatAI</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 flex items-center gap-2 hover:scale-105">
            <RefreshCw className="h-4 w-4" />
            Cập nhật dữ liệu đào tạo
          </button>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-300 flex items-center gap-2 hover:scale-105">
            <Settings className="h-4 w-4" />
            Cấu hình ChatAI
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-300 dark:border-slate-700 space-x-4 transition-colors duration-300">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative flex items-center gap-2",
            activeTab === 'overview'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <BarChart2 className="h-4 w-4" />
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative flex items-center gap-2",
            activeTab === 'sessions'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Phiên Chat
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative flex items-center gap-2",
            activeTab === 'training'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <Database className="h-4 w-4" />
          Dữ liệu huấn luyện
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative flex items-center gap-2",
            activeTab === 'settings'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <Settings className="h-4 w-4" />
          Cài đặt
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.id} className="p-4 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300 hover:scale-105">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{metric.name}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">{metric.value}</p>
                    <p className={`text-xs ${metric.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-colors duration-300`}>
                      {metric.trend} so với tháng trước
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg bg-${metric.color}-500/20 transition-colors duration-300`}>
                    <metric.icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400 transition-colors duration-300`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* ChatAI Activity Chart */}
          <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Hoạt động ChatAI (7 ngày qua)</h2>
            <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg flex items-center justify-center transition-colors duration-300">
              <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Biểu đồ hoạt động ChatAI sẽ được hiển thị ở đây</p>
            </div>
          </Card>

          {/* Popular Topics & Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Chủ đề phổ biến</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full transition-colors duration-300">1</span>
                    <span className="text-slate-800 dark:text-white transition-colors duration-300">Toán học THPT</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full transition-colors duration-300">2</span>
                    <span className="text-slate-800 dark:text-white transition-colors duration-300">Vật lý đại cương</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">24%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full transition-colors duration-300">3</span>
                    <span className="text-slate-800 dark:text-white transition-colors duration-300">Hóa học cơ bản</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full transition-colors duration-300">4</span>
                    <span className="text-slate-800 dark:text-white transition-colors duration-300">Ngữ văn & văn học</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full transition-colors duration-300">5</span>
                    <span className="text-slate-800 dark:text-white transition-colors duration-300">Lịch sử Việt Nam</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">11%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Vấn đề cần cải thiện</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
                  <div>
                    <p className="text-slate-800 dark:text-white text-sm transition-colors duration-300">Thiếu sự chính xác trong câu trả lời về Lịch sử</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">12 báo cáo trong tháng này</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
                  <div>
                    <p className="text-slate-800 dark:text-white text-sm transition-colors duration-300">Hiệu suất chậm trong giờ cao điểm</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">8 báo cáo trong tháng này</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
                  <div>
                    <p className="text-slate-800 dark:text-white text-sm transition-colors duration-300">Một số câu hỏi về Hóa học không được trả lời</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">5 báo cáo trong tháng này</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bộ lọc */}
            <Card className="md:col-span-3 p-4 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
                  <Filter className="h-5 w-5" />
                  Bộ lọc
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Trạng thái</label>
                    <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                      <option value="all">Tất cả</option>
                      <option value="active">Đang diễn ra</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Đánh giá</label>
                    <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                      <option value="all">Tất cả</option>
                      <option value="5">5 sao</option>
                      <option value="4">4 sao trở lên</option>
                      <option value="3">3 sao trở lên</option>
                      <option value="2">2 sao trở xuống</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Có cờ báo vấn đề</label>
                    <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                      <option value="all">Tất cả</option>
                      <option value="flagged">Có vấn đề</option>
                      <option value="no-flags">Không có vấn đề</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Thời gian</label>
                    <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                      <option value="all">Tất cả</option>
                      <option value="today">Hôm nay</option>
                      <option value="week">7 ngày qua</option>
                      <option value="month">30 ngày qua</option>
                    </select>
                  </div>

                  <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:scale-105 mt-4">
                    Áp dụng bộ lọc
                  </button>
                </div>
              </div>
            </Card>

            {/* Danh sách phiên chat */}
            <div className="md:col-span-9 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phiên chat..."
                  className="w-full bg-white/80 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-300"
                />
              </div>

              <div className="space-y-4">
                {chatSessions.map((session) => (
                  <Card key={session.id} className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300 hover:scale-105">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">{session.user.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">ID: {session.user.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          {session.feedback && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span className="text-white">{session.feedback}/5</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-800/30 p-4 rounded-lg transition-colors duration-300">
                        <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">{session.topic}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                          <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{session.messages} tin nhắn</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                          <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                            {getTimeElapsed(session.startTime, session.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                          <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                            {new Date(session.startTime).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {session.flags.length > 0 && (
                        <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-lg transition-colors duration-300">
                          <p className="text-red-600 dark:text-red-400 text-sm font-medium transition-colors duration-300">Các vấn đề được báo cáo:</p>
                          <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">
                            {session.flags.map((flag, index) => (
                              <li key={index}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors duration-300 hover:scale-105">
                          Xem chi tiết
                        </button>
                        {session.flags.length > 0 && (
                          <button className="px-4 py-2 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-200 dark:hover:bg-yellow-500/30 transition-colors duration-300 hover:scale-105">
                            Chỉnh sửa đào tạo
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Dữ liệu huấn luyện</h2>

            <div className="space-y-6">
              <div className="bg-slate-100 dark:bg-slate-800/30 p-5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-slate-800 dark:text-white transition-colors duration-300">Tài liệu học tập</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors duration-300 flex items-center gap-1 text-sm hover:scale-105">
                      <UploadCloud className="h-4 w-4" />
                      Tải lên
                    </button>
                    <button className="px-3 py-1.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors duration-300 flex items-center gap-1 text-sm hover:scale-105">
                      <RefreshCw className="h-4 w-4" />
                      Cập nhật
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-700/30 p-4 rounded-lg transition-colors duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">Sách giáo khoa</p>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full transition-colors duration-300">Đã cập nhật</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">145 tài liệu được đào tạo</p>
                    <p className="text-xs text-slate-500 mt-1 transition-colors duration-300">Cập nhật: 05/03/2024</p>
                  </div>

                  <div className="bg-white dark:bg-slate-700/30 p-4 rounded-lg transition-colors duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">Đề thi và đáp án</p>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full transition-colors duration-300">Đã cập nhật</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">287 tài liệu được đào tạo</p>
                    <p className="text-xs text-slate-500 mt-1 transition-colors duration-300">Cập nhật: 03/03/2024</p>
                  </div>

                  <div className="bg-white dark:bg-slate-700/30 p-4 rounded-lg transition-colors duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">Tài liệu tham khảo</p>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full transition-colors duration-300">Cần cập nhật</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">68 tài liệu được đào tạo</p>
                    <p className="text-xs text-slate-500 mt-1 transition-colors duration-300">Cập nhật: 15/02/2024</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/30 p-5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-slate-800 dark:text-white transition-colors duration-300">Logs và phản hồi học tập</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors duration-300 flex items-center gap-1 text-sm hover:scale-105">
                      <Database className="h-4 w-4" />
                      Xuất dữ liệu
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-700/30 p-4 rounded-lg transition-colors duration-300">
                  <p className="text-slate-800 dark:text-white transition-colors duration-300">Cải tiến dữ liệu dựa trên phản hồi</p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-full transition-colors duration-300">Ưu tiên cao</span>
                        <span className="text-slate-800 dark:text-white text-sm transition-colors duration-300">Cập nhật thông tin về lịch sử Việt Nam thế kỷ 20</span>
                      </div>
                      <button className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded transition-colors duration-300 hover:scale-105">Đang xử lý</button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full transition-colors duration-300">Ưu tiên trung bình</span>
                        <span className="text-slate-800 dark:text-white text-sm transition-colors duration-300">Bổ sung tài liệu giải toán nâng cao lớp 12</span>
                      </div>
                      <button className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded transition-colors duration-300 hover:scale-105">Hoàn thành</button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-full transition-colors duration-300">Ưu tiên thấp</span>
                        <span className="text-slate-800 dark:text-white text-sm transition-colors duration-300">Thêm bài giảng về vật lý quang học</span>
                      </div>
                      <button className="px-2 py-1 bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 text-xs rounded transition-colors duration-300 hover:scale-105">Chưa xử lý</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 transition-colors duration-300">Cài đặt ChatAI</h2>

            <div className="space-y-6">
              <div className="bg-slate-100 dark:bg-slate-800/30 p-5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <h3 className="text-md font-medium text-slate-800 dark:text-white mb-4 transition-colors duration-300">Cấu hình hệ thống</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-800 dark:text-white transition-colors duration-300">Chế độ trả lời chi tiết</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">ChatAI sẽ cung cấp câu trả lời chi tiết, dài hơn</p>
                    </div>
                    <div className="h-6 w-12 bg-purple-100 dark:bg-purple-500/20 rounded-full p-1 cursor-pointer transition-colors duration-300">
                      <div className="h-4 w-4 bg-purple-500 rounded-full transform translate-x-6 transition-transform duration-300"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-800 dark:text-white transition-colors duration-300">Bộ lọc nội dung</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">Lọc nội dung không phù hợp trong các câu hỏi và trả lời</p>
                    </div>
                    <div className="h-6 w-12 bg-purple-100 dark:bg-purple-500/20 rounded-full p-1 cursor-pointer transition-colors duration-300">
                      <div className="h-4 w-4 bg-purple-500 rounded-full transform translate-x-6 transition-transform duration-300"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-800 dark:text-white transition-colors duration-300">Ghi lại tất cả các cuộc trò chuyện</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">Lưu trữ lịch sử chat để phân tích và cải thiện</p>
                    </div>
                    <div className="h-6 w-12 bg-purple-100 dark:bg-purple-500/20 rounded-full p-1 cursor-pointer transition-colors duration-300">
                      <div className="h-4 w-4 bg-purple-500 rounded-full transform translate-x-6 transition-transform duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800/30 p-5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <h3 className="text-md font-medium text-slate-800 dark:text-white mb-4 transition-colors duration-300">Giới hạn sử dụng</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-slate-800 dark:text-white transition-colors duration-300">Số lượng tin nhắn tối đa mỗi phiên</label>
                    <div className="flex gap-2">
                      <input type="number" value="50" className="w-20 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300" />
                      <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:scale-105">
                        Cập nhật
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-800 dark:text-white transition-colors duration-300">Thời gian tối đa mỗi phiên (phút)</label>
                    <div className="flex gap-2">
                      <input type="number" value="30" className="w-20 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300" />
                      <button className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:scale-105">
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300 hover:scale-105 mt-4">
                Lưu tất cả cài đặt
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}