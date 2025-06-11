'use client';

import { FileText, Clock, Users, Filter, Search, Plus, FileUp, Download, BarChart2, FileDown, Eye, Trash2, Edit, ChevronDown, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const examList = [
  {
    id: 1,
    title: 'Đề thi giữa kỳ 1 Toán 12',
    subject: 'Toán học',
    grade: '12',
    type: 'Thi giữa kỳ',
    duration: 45,
    questions: 40,
    totalPoints: 10,
    format: 'Trắc nghiệm',
    difficulty: 'Trung bình',
    downloads: 234,
    attempts: 156,
    avgScore: 7.5,
    status: 'Đang diễn ra',
    lastUpdated: '2024-03-15',
  },
  {
    id: 2,
    title: 'Đề thi thử THPT QG môn Vật lý 2024',
    subject: 'Vật lý',
    grade: '12',
    type: 'Thi thử',
    duration: 50,
    questions: 40,
    totalPoints: 10,
    format: 'Trắc nghiệm',
    difficulty: 'Khó',
    downloads: 189,
    attempts: 145,
    avgScore: 6.8,
    status: 'Sắp diễn ra',
    lastUpdated: '2024-03-14',
  },
  {
    id: 3,
    title: 'Kiểm tra 15 phút Hóa học 10',
    subject: 'Hóa học',
    grade: '10',
    type: 'Kiểm tra',
    duration: 15,
    questions: 10,
    totalPoints: 10,
    format: 'Tự luận',
    difficulty: 'Dễ',
    downloads: 156,
    attempts: 134,
    avgScore: 8.2,
    status: 'Đã kết thúc',
    lastUpdated: '2024-03-13',
  },
];

const subjects = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý'];
const grades = ['Tất cả', '10', '11', '12'];
const types = ['Tất cả', 'Kiểm tra', 'Thi giữa kỳ', 'Thi cuối kỳ', 'Thi thử'];
const formats = ['Tất cả', 'Trắc nghiệm', 'Tự luận', 'Kết hợp'];
const difficulties = ['Tất cả', 'Dễ', 'Trung bình', 'Khó'];
const statuses = ['Tất cả', 'Sắp diễn ra', 'Đang diễn ra', 'Đã kết thúc'];

interface FilterState {
  subject: string;
  grade: string;
  type: string;
  format: string;
  difficulty: string;
  status: string;
  dateRange: string;
  search: string;
}

interface SortState {
  field: 'title' | 'date' | 'downloads' | 'attempts' | 'avgScore';
  direction: 'asc' | 'desc';
}

export default function ExamPage() {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    subject: 'Tất cả',
    grade: 'Tất cả',
    type: 'Tất cả',
    format: 'Tất cả',
    difficulty: 'Tất cả',
    status: 'Tất cả',
    dateRange: 'all',
    search: '',
  });
  const [sort, setSort] = useState<SortState>({
    field: 'date',
    direction: 'desc',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field: SortState['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Sẽ sử dụng hàm này trong tương lai khi cần hiển thị thống kê
  // const toggleStats = () => {
  //   setShowStats(!showStats);
  // };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Quản lý đề thi & kiểm tra</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Nhập đề thi
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transition-colors duration-300">
              <button className="w-full px-4 py-2 text-left text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Nhập từ Excel
              </button>
              <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Nhập từ Word
              </button>
              <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Nhập từ PDF
              </button>
            </div>
          </div>

          <div className="relative group">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Xuất đề thi
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Xuất ra Excel
              </button>
              <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Xuất ra Word
              </button>
              <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Xuất ra PDF
              </button>
            </div>
          </div>

          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo đề thi mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Tổng số đề thi</p>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Lượt làm bài</p>
              <p className="text-2xl font-bold text-white">2,845</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-purple-500/10 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Download className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Lượt tải về</p>
              <p className="text-2xl font-bold text-white">1,234</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-orange-500/10 border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <BarChart2 className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Điểm trung bình</p>
              <p className="text-2xl font-bold text-white">7.5</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-3 p-4 bg-slate-800/50 border-slate-700">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Môn học</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Khối lớp</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Loại đề thi</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Hình thức</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {formats.map((format) => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Độ khó</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Trạng thái</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Sắp xếp theo</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  <option value="newest">Mới nhất</option>
                  <option value="downloads">Lượt tải nhiều nhất</option>
                  <option value="attempts">Lượt làm bài nhiều nhất</option>
                  <option value="avgScore">Điểm trung bình cao nhất</option>
                </select>
              </div>

              <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-4">
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </Card>

        <div className="md:col-span-9 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đề thi..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400"
                />
              </div>
              <button
                onClick={toggleAdvancedFilters}
                className={cn(
                  "p-2 rounded-lg border transition-colors flex items-center gap-2",
                  showAdvancedFilters
                    ? "bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50"
                )}
              >
                <SlidersHorizontal className="h-5 w-5" />
                Bộ lọc nâng cao
              </button>
            </div>

            {showAdvancedFilters && (
              <Card className="p-4 bg-slate-800/50 border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Thời gian</label>
                    <select
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <option value="all">Tất cả thời gian</option>
                      <option value="today">Hôm nay</option>
                      <option value="week">Tuần này</option>
                      <option value="month">Tháng này</option>
                      <option value="quarter">3 tháng gần đây</option>
                      <option value="year">Năm nay</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Sắp xếp theo</label>
                    <div className="flex items-center gap-2">
                      <select
                        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                        value={sort.field}
                        onChange={(e) => handleSortChange(e.target.value as SortState['field'])}
                      >
                        <option value="title">Tên đề thi</option>
                        <option value="date">Ngày cập nhật</option>
                        <option value="downloads">Lượt tải</option>
                        <option value="attempts">Lượt làm bài</option>
                        <option value="avgScore">Điểm trung bình</option>
                      </select>
                      <button
                        onClick={() => handleSortChange(sort.field)}
                        className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-600/50"
                      >
                        <ArrowUpDown className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Hiển thị</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white">
                      <option value="10">10 mục</option>
                      <option value="20">20 mục</option>
                      <option value="50">50 mục</option>
                      <option value="100">100 mục</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(filters).map(([key, value]) => {
                    if (key === 'search' || key === 'dateRange' || value === 'Tất cả') return null;
                    return (
                      <span
                        key={key}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full flex items-center gap-2"
                      >
                        {value}
                        <button
                          onClick={() => handleFilterChange(key as keyof FilterState, 'Tất cả')}
                          className="hover:text-purple-300"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {examList.map((exam) => (
              <Card key={exam.id} className="bg-slate-800/50 border-slate-700">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                          {exam.subject}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          Lớp {exam.grade}
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          {exam.type}
                        </span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                          {exam.format}
                        </span>
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                          {exam.difficulty}
                        </span>
                        <span className={cn(
                          "px-2 py-1 text-xs rounded",
                          exam.status === 'Đang diễn ra' ? 'bg-green-500/20 text-green-400' :
                          exam.status === 'Sắp diễn ra' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        )}>
                          {exam.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{exam.duration} phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{exam.questions} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{exam.downloads} lượt tải</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{exam.attempts} lượt làm bài</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-400">
                        Điểm TB: {exam.avgScore}
                      </span>
                      <span className="text-sm text-slate-400">
                        Cập nhật: {new Date(exam.lastUpdated).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                        onClick={() => {
                          setSelectedExam(exam.id);
                          setShowStats(!showStats);
                        }}
                      >
                        <BarChart2 className="h-4 w-4" />
                        Thống kê
                      </button>
                      <div className="relative group">
                        <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors flex items-center gap-2">
                          <FileDown className="h-4 w-4" />
                          Xuất đề thi
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors">
                            Xuất ra Word
                          </button>
                          <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 transition-colors">
                            Xuất ra PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedExam === exam.id && showStats && (
                  <div className="px-6 pb-6">
                    <Card className="p-4 bg-slate-700/30 border-slate-600">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Thống kê chi tiết</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Điểm cao nhất:</span>
                              <span className="text-green-400">9.5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Điểm thấp nhất:</span>
                              <span className="text-red-400">4.0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Điểm trung bình:</span>
                              <span className="text-blue-400">{exam.avgScore}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Số lượt đạt:</span>
                              <span className="text-green-400">120 (76.9%)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Số lượt không đạt:</span>
                              <span className="text-red-400">36 (23.1%)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Thời gian làm TB:</span>
                              <span className="text-purple-400">35 phút</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-slate-400">Phân bố điểm</h5>
                          <div className="grid grid-cols-10 gap-1 h-20">
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '30%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '45%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '60%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '80%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '100%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '90%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '70%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '50%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '35%' }}></div>
                            <div className="bg-purple-500/20 rounded-t" style={{ height: '20%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>0</span>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                            <span>6</span>
                            <span>7</span>
                            <span>8</span>
                            <span>9</span>
                            <span>10</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}