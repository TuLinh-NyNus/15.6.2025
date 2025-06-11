'use client';

import { MessageSquare, Filter, Search, Users, AlertTriangle, Eye, ThumbsUp, MessagesSquare, Clock, Tag, Check, X, Edit, Flag, Shield } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';


const forumPosts = [
  {
    id: 1,
    title: 'Phương pháp giải các bài toán về hàm số bậc hai',
    author: {
      id: 'USR1234',
      name: 'Nguyễn Văn A',
      avatar: '/avatars/user1.png',
      role: 'Học sinh',
    },
    category: 'Toán học',
    tags: ['Đại số', 'Hàm số', 'Lớp 10'],
    content: 'Xin chào mọi người, mình đang gặp khó khăn trong việc giải các bài toán liên quan đến hàm số bậc hai. Mình muốn hỏi có phương pháp nào hiệu quả để xác định dấu của hàm số và vẽ đồ thị không?...',
    views: 245,
    likes: 18,
    comments: 12,
    createdAt: '2024-03-05T08:30:00',
    status: 'Đã duyệt',
    flagged: false
  },
  {
    id: 2,
    title: 'Cách viết đoạn văn nghị luận xã hội hay',
    author: {
      id: 'USR4567',
      name: 'Trần Thị B',
      avatar: '/avatars/user2.png',
      role: 'Học sinh',
    },
    category: 'Ngữ văn',
    tags: ['Nghị luận xã hội', 'Kỹ năng viết', 'Lớp 12'],
    content: 'Các bạn ơi, mình sắp thi học kỳ môn Văn và cần cải thiện kỹ năng viết đoạn văn nghị luận xã hội. Mình muốn biết có mẹo nào để viết đoạn văn thật hay và gây ấn tượng với giáo viên không?...',
    views: 189,
    likes: 27,
    comments: 15,
    createdAt: '2024-03-06T14:15:00',
    status: 'Đã duyệt',
    flagged: false
  },
  {
    id: 3,
    title: 'Tổng hợp công thức Vật lý lớp 12',
    author: {
      id: 'USR7890',
      name: 'Lê Văn C',
      avatar: '/avatars/user3.png',
      role: 'Giáo viên',
    },
    category: 'Vật lý',
    tags: ['Công thức', 'Lớp 12', 'Ôn thi'],
    content: 'Chào các em, thầy đã tổng hợp các công thức Vật lý lớp 12 quan trọng để các em tiện ôn tập cho kỳ thi sắp tới. Các em có thể tham khảo và đặt câu hỏi nếu có thắc mắc...',
    views: 536,
    likes: 84,
    comments: 23,
    createdAt: '2024-03-04T10:20:00',
    status: 'Đã duyệt',
    flagged: false
  },
  {
    id: 4,
    title: '[HỎI ĐÁP] Giải bài tập hóa học lớp 11',
    author: {
      id: 'USR2468',
      name: 'Phạm Thị D',
      avatar: '/avatars/user4.png',
      role: 'Học sinh',
    },
    category: 'Hóa học',
    tags: ['Bài tập', 'Hóa học', 'Lớp 11'],
    content: 'Mình đang gặp khó khăn với bài tập về phản ứng oxi hóa - khử trong sách giáo khoa Hóa học lớp 11 trang 45. Có ai giúp mình giải bài này được không?...',
    views: 98,
    likes: 4,
    comments: 7,
    createdAt: '2024-03-07T09:45:00',
    status: 'Chờ duyệt',
    flagged: false
  },
  {
    id: 5,
    title: 'Làm thế nào để cải thiện điểm số môn Tiếng Anh?',
    author: {
      id: 'USR1357',
      name: 'Hoàng Văn E',
      avatar: '/avatars/user5.png',
      role: 'Học sinh',
    },
    category: 'Tiếng Anh',
    tags: ['Học tập', 'Phương pháp', 'Cải thiện'],
    content: 'Mình đang gặp khó khăn với môn Tiếng Anh, đặc biệt là phần ngữ pháp và viết. Mình muốn hỏi có ai có kinh nghiệm cải thiện điểm số môn này không? Mình cần những lời khuyên thực tế...',
    views: 124,
    likes: 11,
    comments: 9,
    createdAt: '2024-03-06T16:30:00',
    status: 'Chờ duyệt',
    flagged: false
  },
  {
    id: 6,
    title: 'Điểm trúng tuyển các trường đại học năm 2023',
    author: {
      id: 'USR8642',
      name: 'Vũ Thị F',
      avatar: '/avatars/user6.png',
      role: 'Học sinh',
    },
    category: 'Tư vấn',
    tags: ['Đại học', 'Tuyển sinh', 'Điểm chuẩn'],
    content: 'Mình đã nghe từ các nguồn không chính thức rằng điểm chuẩn đại học năm nay sẽ cao hơn nhiều so với những năm trước do đề thi dễ. Có ai biết thông tin chính xác không? Tôi đang hoang mang vì...',
    views: 315,
    likes: 42,
    comments: 27,
    createdAt: '2024-03-05T13:10:00',
    status: 'Bị từ chối',
    flagged: true,
    flagReason: 'Thông tin chưa được kiểm chứng, có thể gây hoang mang'
  }
];

const categories = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý', 'Tin học', 'Tư vấn'];
const statusOptions = ['Tất cả', 'Đã duyệt', 'Chờ duyệt', 'Bị từ chối'];

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã duyệt':
        return 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400';
      case 'Chờ duyệt':
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'Bị từ chối':
        return 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Giáo viên':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'Học sinh':
        return 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessagesSquare className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Quản lý diễn đàn</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:scale-105 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Cài đặt kiểm duyệt
          </button>
        </div>
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
          Tất cả bài viết
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
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 transition-colors duration-300">2</span>
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
        <button
          onClick={() => setActiveTab('flagged')}
          className={cn(
            "pb-2 px-1 font-medium transition-colors duration-300 relative flex items-center gap-2",
            activeTab === 'flagged'
              ? "text-slate-800 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-500"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          Bị báo cáo
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors duration-300">1</span>
        </button>
      </div>

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
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Vai trò tác giả</label>
                <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="all">Tất cả</option>
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Sắp xếp theo</label>
                <select className="w-full bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="most_viewed">Xem nhiều nhất</option>
                  <option value="most_liked">Nhiều lượt thích nhất</option>
                  <option value="most_commented">Nhiều bình luận nhất</option>
                </select>
              </div>

              <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:scale-105 mt-4">
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </Card>

        {/* Danh sách bài viết */}
        <div className="md:col-span-9 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="w-full bg-white/80 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-300"
            />
          </div>

          <div className="space-y-4">
            {forumPosts.map((post) => (
              <Card key={post.id} className={`p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300 ${post.flagged ? 'border-l-4 border-l-red-500 dark:border-l-red-500' : ''} hover:scale-105`}>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs rounded transition-colors duration-300">
                          {post.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded transition-colors duration-300 ${getRoleColor(post.author.role)}`}>
                          {post.author.role}
                        </span>
                        {post.flagged && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs rounded flex items-center gap-1 transition-colors duration-300">
                            <AlertTriangle className="h-3 w-3" />
                            Bị báo cáo
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">{post.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors duration-300 hover:scale-105">
                        <Edit className="h-4 w-4" />
                      </button>
                      {post.status === 'Chờ duyệt' && (
                        <>
                          <button className="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors duration-300 hover:scale-105">
                            <Check className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors duration-300 hover:scale-105">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">{post.author.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">ID: {post.author.id}</p>
                    </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800/30 p-4 rounded-lg transition-colors duration-300">
                    <p className="text-slate-800 dark:text-white text-sm transition-colors duration-300">{post.content.substring(0, 200)}...</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs rounded-full flex items-center gap-1 transition-colors duration-300">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {post.flagged && post.flagReason && (
                    <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-lg transition-colors duration-300">
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 transition-colors duration-300">
                        <Flag className="h-4 w-4" />
                        Lý do báo cáo:
                      </p>
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1 transition-colors duration-300">{post.flagReason}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{post.views} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{post.likes} thích</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{post.comments} bình luận</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors duration-300 hover:scale-105">
                      Xem chi tiết
                    </button>
                    {post.flagged && (
                      <button className="px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors duration-300 hover:scale-105">
                        Xử lý báo cáo
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
  );
}