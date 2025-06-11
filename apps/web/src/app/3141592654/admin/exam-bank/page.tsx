'use client';

import { Database, Clock, FileText, Download, Filter, Search, Plus, FileUp } from 'lucide-react';

import { Card } from '@/components/ui/card';

const examList = [
  {
    id: 1,
    title: 'Đề thi giữa kỳ 1 Toán 12',
    subject: 'Toán học',
    grade: '12',
    duration: 45,
    questions: 40,
    totalPoints: 10,
    type: 'Trắc nghiệm',
    difficulty: 'Trung bình',
    downloads: 234,
    lastUpdated: '2024-03-07',
  },
  {
    id: 2,
    title: 'Đề thi thử THPT QG môn Vật lý',
    subject: 'Vật lý',
    grade: '12',
    duration: 50,
    questions: 40,
    totalPoints: 10,
    type: 'Trắc nghiệm',
    difficulty: 'Khó',
    downloads: 189,
    lastUpdated: '2024-03-06',
  },
  {
    id: 3,
    title: 'Kiểm tra 15 phút Hóa học 10',
    subject: 'Hóa học',
    grade: '10',
    duration: 15,
    questions: 10,
    totalPoints: 10,
    type: 'Tự luận',
    difficulty: 'Dễ',
    downloads: 156,
    lastUpdated: '2024-03-05',
  },
];

export default function ExamBankPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Ngân hàng đề thi</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Nhập từ file
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo đề thi mới
          </button>
        </div>
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
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Môn học</label>
                <select className="w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="">Tất cả</option>
                  <option value="math">Toán học</option>
                  <option value="physics">Vật lý</option>
                  <option value="chemistry">Hóa học</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Khối lớp</label>
                <select className="w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="">Tất cả</option>
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Loại đề thi</label>
                <select className="w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="">Tất cả</option>
                  <option value="multiple">Trắc nghiệm</option>
                  <option value="essay">Tự luận</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Độ khó</label>
                <select className="w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300">
                  <option value="">Tất cả</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Danh sách đề thi */}
        <div className="md:col-span-9 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi..."
              className="w-full bg-white/80 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-300"
            />
          </div>

          <div className="space-y-4">
            {examList.map((exam) => (
              <Card key={exam.id} className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">{exam.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-500 dark:text-purple-400 text-xs rounded transition-colors duration-300">
                          {exam.subject}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-500 dark:text-blue-400 text-xs rounded transition-colors duration-300">
                          Lớp {exam.grade}
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 dark:text-green-400 text-xs rounded transition-colors duration-300">
                          {exam.type}
                        </span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 text-xs rounded transition-colors duration-300">
                          {exam.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded hover:bg-blue-500/30 hover:scale-105 transition-all duration-300">
                        Sửa
                      </button>
                      <button className="p-2 bg-red-500/20 text-red-500 dark:text-red-400 rounded hover:bg-red-500/30 hover:scale-105 transition-all duration-300">
                        Xoá
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{exam.duration} phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{exam.questions} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{exam.totalPoints} điểm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{exam.downloads} lượt tải</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                      Cập nhật: {new Date(exam.lastUpdated).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-500/20 text-purple-500 dark:text-purple-400 rounded hover:bg-purple-500/30 hover:scale-105 transition-all duration-300">
                        Xem chi tiết
                      </button>
                      <button className="px-4 py-2 bg-green-500/20 text-green-500 dark:text-green-400 rounded hover:bg-green-500/30 hover:scale-105 transition-all duration-300">
                        Xuất PDF
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