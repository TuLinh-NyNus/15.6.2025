'use client';

import { BookOpen, Download, Filter, Search, Plus, FileUp, Star, BookOpenCheck, Bookmark, Tag, Calendar } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const bookList = [
  {
    id: 1,
    title: 'Sách giáo khoa Toán học 12',
    author: 'Bộ Giáo dục và Đào tạo',
    publisher: 'NXB Giáo dục',
    category: 'Sách giáo khoa',
    subject: 'Toán học',
    grade: '12',
    publishYear: '2023',
    pages: 200,
    downloads: 1245,
    rating: 4.5,
    format: 'PDF',
    size: '15.5 MB',
    status: 'Đã duyệt',
    lastUpdated: '2024-03-01',
  },
  {
    id: 2,
    title: 'Bài tập Vật lý 11',
    author: 'Nguyễn Văn A',
    publisher: 'NXB Đại học Quốc gia',
    category: 'Sách bài tập',
    subject: 'Vật lý',
    grade: '11',
    publishYear: '2023',
    pages: 150,
    downloads: 856,
    rating: 4.2,
    format: 'PDF',
    size: '12.8 MB',
    status: 'Đã duyệt',
    lastUpdated: '2024-02-28',
  },
  {
    id: 3,
    title: 'Hướng dẫn ôn tập Hóa học 10',
    author: 'Trần Thị B',
    publisher: 'NXB Giáo dục',
    category: 'Sách tham khảo',
    subject: 'Hóa học',
    grade: '10',
    publishYear: '2023',
    pages: 180,
    downloads: 634,
    rating: 4.8,
    format: 'PDF',
    size: '18.2 MB',
    status: 'Chờ duyệt',
    lastUpdated: '2024-03-05',
  },
];

const categories = ['Tất cả', 'Sách giáo khoa', 'Sách bài tập', 'Sách tham khảo', 'Đề cương', 'Tài liệu khác'];
const subjects = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý'];
const grades = ['Tất cả', '10', '11', '12'];
const formats = ['Tất cả', 'PDF', 'DOCX', 'PPTX', 'EPUB'];
const statuses = ['Tất cả', 'Đã duyệt', 'Chờ duyệt', 'Từ chối'];

export default function BooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-500 transition-colors duration-300" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Thư viện tài liệu</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Nhập từ file
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm tài liệu mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bộ lọc */}
        <Card className="md:col-span-3 p-4 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Thể loại</label>
                <select className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Môn học</label>
                <select className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Khối lớp</label>
                <select className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Định dạng</label>
                <select className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  {formats.map((format) => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Trạng thái</label>
                <select className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Sắp xếp theo</label>
                <select className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="newest">Mới nhất</option>
                  <option value="downloads">Lượt tải nhiều nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="title">Tên tài liệu (A-Z)</option>
                </select>
              </div>

              <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 mt-4">
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </Card>

        {/* Danh sách tài liệu */}
        <div className="md:col-span-9 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              className="w-full bg-white/80 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-300"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bookList.map((book) => (
              <Card key={book.id} className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">{book.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Tác giả: {book.author}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">NXB: {book.publisher}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200/50 dark:hover:bg-blue-500/30 transition-colors duration-300">
                        Sửa
                      </button>
                      <button className="p-2 bg-red-100/50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200/50 dark:hover:bg-red-500/30 transition-colors duration-300">
                        Xoá
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs rounded transition-colors duration-300">
                      {book.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded transition-colors duration-300">
                      {book.subject}
                    </span>
                    <span className="px-2 py-1 bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded transition-colors duration-300">
                      Lớp {book.grade}
                    </span>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded transition-colors duration-300",
                      book.status === 'Đã duyệt' ? 'bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                      book.status === 'Chờ duyệt' ? 'bg-yellow-100/50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                      'bg-red-100/50 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                    )}>
                      {book.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.pages} trang</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.size}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.downloads} lượt tải</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.publishYear}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                      Cập nhật: {new Date(book.lastUpdated).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200/50 dark:hover:bg-purple-500/30 transition-colors duration-300">
                        Xem chi tiết
                      </button>
                      <button className="px-4 py-2 bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200/50 dark:hover:bg-green-500/30 transition-colors duration-300">
                        Tải xuống
                      </button>
                    </div>
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