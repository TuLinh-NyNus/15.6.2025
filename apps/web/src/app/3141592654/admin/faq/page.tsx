'use client';

import { HelpCircle, Filter, Search, Plus, MessageSquare, ThumbsUp, Edit, Trash, Check, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';


const faqList = [
  {
    id: 1,
    question: 'Làm thế nào để tôi có thể tải xuống tài liệu học tập?',
    answer: 'Bạn có thể tải xuống tài liệu học tập bằng cách truy cập vào trang tài liệu, chọn tài liệu bạn muốn tải và nhấn vào nút "Tải xuống". Lưu ý rằng bạn cần đăng nhập để có thể tải tài liệu.',
    category: 'Tài liệu học tập',
    status: 'Đã duyệt',
    priority: 'Cao',
    views: 1245,
    helpful: 98,
    createdAt: '2024-02-15',
    updatedAt: '2024-02-20',
  },
  {
    id: 2,
    question: 'Làm cách nào để tôi đăng ký làm bài kiểm tra trực tuyến?',
    answer: 'Để đăng ký làm bài kiểm tra trực tuyến, bạn cần đăng nhập vào tài khoản, sau đó vào mục "Đề thi & Kiểm tra", chọn bài kiểm tra phù hợp và nhấn "Đăng ký". Sau khi đăng ký thành công, bạn có thể bắt đầu làm bài theo thời gian quy định.',
    category: 'Đề thi & Kiểm tra',
    status: 'Đã duyệt',
    priority: 'Trung bình',
    views: 876,
    helpful: 92,
    createdAt: '2024-02-18',
    updatedAt: '2024-02-19',
  },
  {
    id: 3,
    question: 'Tôi quên mật khẩu thì phải làm gì?',
    answer: 'Nếu bạn quên mật khẩu, vui lòng truy cập trang đăng nhập và nhấn vào liên kết "Quên mật khẩu". Hệ thống sẽ gửi một email đặt lại mật khẩu đến địa chỉ email đã đăng ký của bạn. Làm theo hướng dẫn trong email để đặt lại mật khẩu của bạn.',
    category: 'Tài khoản',
    status: 'Đã duyệt',
    priority: 'Cao',
    views: 2150,
    helpful: 213,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
  },
  {
    id: 4,
    question: 'Làm thế nào để tham gia vào diễn đàn thảo luận?',
    answer: '',
    category: 'Diễn đàn',
    status: 'Chờ duyệt',
    priority: 'Thấp',
    views: 45,
    helpful: 0,
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
  },
  {
    id: 5,
    question: 'Các khóa học trên NyNus có mất phí không?',
    answer: '',
    category: 'Khóa học',
    status: 'Chờ duyệt',
    priority: 'Trung bình',
    views: 67,
    helpful: 0,
    createdAt: '2024-03-06',
    updatedAt: '2024-03-06',
  }
];

const categories = ['Tất cả', 'Tài khoản', 'Tài liệu học tập', 'Đề thi & Kiểm tra', 'Khóa học', 'Diễn đàn', 'ChatAI'];
const statusOptions = ['Tất cả', 'Đã duyệt', 'Chờ duyệt', 'Từ chối'];
const priorityOptions = ['Tất cả', 'Cao', 'Trung bình', 'Thấp'];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã duyệt':
        return 'bg-green-500/20 text-green-600 dark:text-green-400';
      case 'Chờ duyệt':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'Từ chối':
        return 'bg-red-500/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-600 dark:text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Cao':
        return 'bg-red-500/20 text-red-600 dark:text-red-400';
      case 'Trung bình':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'Thấp':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Quản lý câu hỏi thường gặp (FAQ)</h1>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-md">
          <Plus className="h-4 w-4 text-white transition-colors duration-300" />
          Thêm câu hỏi mới
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-slate-300 dark:border-slate-700 space-x-4 transition-colors duration-300">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative",
            activeTab === 'all'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          Tất cả câu hỏi
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative flex items-center gap-2",
            activeTab === 'pending'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          Chờ duyệt
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 transition-colors duration-300 shadow-sm">2</span>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative",
            activeTab === 'approved'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          Đã duyệt
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative",
            activeTab === 'rejected'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          Đã từ chối
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bộ lọc */}
        <Card className="md:col-span-3 p-4 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
              <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300 transition-colors duration-300" />
              Bộ lọc
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Trạng thái</label>
                <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Mức độ ưu tiên</label>
                <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Sắp xếp theo</label>
                <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="most_viewed">Xem nhiều nhất</option>
                  <option value="most_helpful">Hữu ích nhất</option>
                </select>
              </div>

              <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-300 mt-4 shadow-md">
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </Card>

        {/* Danh sách câu hỏi */}
        <div className="md:col-span-9 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full bg-white/80 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-300"
            />
          </div>

          <div className="space-y-4">
            {faqList.map((faq) => (
              <Card key={faq.id} className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-yellow-50/50 dark:hover:from-pink-900/10 dark:hover:to-yellow-900/10 hover:scale-[1.01] transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs rounded hover:bg-purple-500/30 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm">
                          {faq.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(faq.status)} hover:opacity-80 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm`}>
                          {faq.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(faq.priority)} hover:opacity-80 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm`}>
                          Ưu tiên: {faq.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-start gap-2 transition-colors duration-300">
                        <HelpCircle className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span>{faq.question}</span>
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-500/30 hover:scale-105 transition-all duration-300 shadow-sm">
                        <Edit className="h-4 w-4 transition-colors duration-300" />
                      </button>
                      <button className="p-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-500/30 hover:scale-105 transition-all duration-300 shadow-sm">
                        <Trash className="h-4 w-4 transition-colors duration-300" />
                      </button>
                    </div>
                  </div>

                  {faq.answer ? (
                    <div className="pl-7 text-slate-600 dark:text-slate-300 transition-colors duration-300 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-lg">
                      <p className="text-sm">{faq.answer}</p>
                    </div>
                  ) : (
                    <div className="pl-7">
                      <div className="flex items-center gap-4">
                        <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-sm">
                          <MessageCircle className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-colors duration-300" />
                          Trả lời
                        </button>
                        <div className="flex gap-2">
                          <button className="p-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded hover:bg-green-500/30 hover:scale-105 transition-all duration-300 shadow-sm">
                            <Check className="h-4 w-4 transition-colors duration-300" />
                          </button>
                          <button className="p-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-500/30 hover:scale-105 transition-all duration-300 shadow-sm">
                            <X className="h-4 w-4 transition-colors duration-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
                        <span>{faq.views} lượt xem</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
                        <span>{faq.helpful} lượt thích</span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                      Cập nhật: {new Date(faq.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}