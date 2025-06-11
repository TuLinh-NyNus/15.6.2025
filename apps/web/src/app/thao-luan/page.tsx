"use client";

import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Clock,
  Flame,
  BookOpen,
  School,
  GraduationCap,
  Award,
  Users,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// Components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface Discussion {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
    rank: string;
  };
  category: string;
  subCategory: string;
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
  hasImage: boolean;
  isPinned: boolean;
  isHot: boolean;
  isAnswered: boolean;
}

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
  count: number;
  subCategories: {
    id: number;
    name: string;
    count: number;
  }[];
}

// Sample data
const sampleDiscussions: Discussion[] = [
  {
    id: 1,
    title: "Cách giải phương trình bậc 2 một ẩn nhanh nhất?",
    content: "Các bạn có mẹo gì để giải nhanh phương trình bậc 2 không? Mình đang chuẩn bị thi HSG Toán cấp tỉnh...",
    author: {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "/images/avatars/avatar-1.png",
      rank: "Học sinh tiêu biểu"
    },
    category: "Toán học",
    subCategory: "Đại số",
    createdAt: "2023-10-15T14:30:00",
    likes: 24,
    comments: 12,
    tags: ["Toán 10", "Phương trình", "Đại số"],
    hasImage: false,
    isPinned: true,
    isHot: true,
    isAnswered: true
  },
  {
    id: 2,
    title: "Cách học Hóa học hữu cơ hiệu quả?",
    content: "Mình đang gặp khó khăn khi học Hóa học hữu cơ, đặc biệt là phần phản ứng và ghi nhớ công thức...",
    author: {
      id: 2,
      name: "Trần Thị B",
      avatar: "/images/avatars/avatar-2.png",
      rank: "Học sinh năng động"
    },
    category: "Hóa học",
    subCategory: "Hóa hữu cơ",
    createdAt: "2023-10-14T10:15:00",
    likes: 18,
    comments: 8,
    tags: ["Hóa 12", "Hữu cơ", "Mẹo học"],
    hasImage: true,
    isPinned: false,
    isHot: true,
    isAnswered: false
  },
  {
    id: 3,
    title: "Chia sẻ tài liệu ôn thi đại học môn Văn?",
    content: "Chào mọi người, mình vừa tổng hợp được một số tài liệu hay về môn Văn. Mình muốn chia sẻ...",
    author: {
      id: 3,
      name: "Lê Văn C",
      avatar: "/images/avatars/avatar-3.png",
      rank: "Học sinh tích cực"
    },
    category: "Ngữ văn",
    subCategory: "Ôn thi đại học",
    createdAt: "2023-10-13T16:45:00",
    likes: 45,
    comments: 23,
    tags: ["Văn 12", "Tài liệu", "Ôn thi"],
    hasImage: true,
    isPinned: false,
    isHot: false,
    isAnswered: true
  },
  {
    id: 4,
    title: "Cách sử dụng công thức Vật lý trong bài tập?",
    content: "Mình hay bị nhầm lẫn khi áp dụng công thức Vật lý vào bài tập cụ thể. Mọi người có cách nào...",
    author: {
      id: 4,
      name: "Phạm Thị D",
      avatar: "/images/avatars/avatar-4.png",
      rank: "Học sinh mới"
    },
    category: "Vật lý",
    subCategory: "Cơ học",
    createdAt: "2023-10-12T09:20:00",
    likes: 12,
    comments: 15,
    tags: ["Vật lý 11", "Công thức", "Cơ học"],
    hasImage: false,
    isPinned: false,
    isHot: false,
    isAnswered: false
  },
  {
    id: 5,
    title: "Mẹo học từ vựng tiếng Anh hiệu quả?",
    content: "Mình đang cần cải thiện vốn từ vựng tiếng Anh gấp. Các bạn có mẹo gì không? Mình đang học...",
    author: {
      id: 5,
      name: "Vũ Văn E",
      avatar: "/images/avatars/avatar-5.png",
      rank: "Học sinh tiêu biểu"
    },
    category: "Tiếng Anh",
    subCategory: "Từ vựng",
    createdAt: "2023-10-11T14:10:00",
    likes: 32,
    comments: 19,
    tags: ["Tiếng Anh", "Từ vựng", "Mẹo học"],
    hasImage: true,
    isPinned: false,
    isHot: true,
    isAnswered: true
  },
  // Thêm dữ liệu mẫu khác nếu cần
];

const categories: Category[] = [
  {
    id: 1,
    name: "Lớp 10",
    icon: <BookOpen className="h-5 w-5" />,
    count: 245,
    subCategories: [
      { id: 1, name: "Toán học", count: 85 },
      { id: 2, name: "Vật lý", count: 42 },
      { id: 3, name: "Hóa học", count: 38 },
      { id: 4, name: "Ngữ văn", count: 56 },
      { id: 5, name: "Tiếng Anh", count: 24 }
    ]
  },
  {
    id: 2,
    name: "Lớp 11",
    icon: <School className="h-5 w-5" />,
    count: 186,
    subCategories: [
      { id: 6, name: "Toán học", count: 62 },
      { id: 7, name: "Vật lý", count: 35 },
      { id: 8, name: "Hóa học", count: 29 },
      { id: 9, name: "Ngữ văn", count: 38 },
      { id: 10, name: "Tiếng Anh", count: 22 }
    ]
  },
  {
    id: 3,
    name: "Lớp 12",
    icon: <GraduationCap className="h-5 w-5" />,
    count: 324,
    subCategories: [
      { id: 11, name: "Toán học", count: 112 },
      { id: 12, name: "Vật lý", count: 59 },
      { id: 13, name: "Hóa học", count: 47 },
      { id: 14, name: "Ngữ văn", count: 68 },
      { id: 15, name: "Tiếng Anh", count: 38 }
    ]
  },
  {
    id: 4,
    name: "Tuyển sinh 10",
    icon: <Award className="h-5 w-5" />,
    count: 157,
    subCategories: [
      { id: 16, name: "Thông tin thi", count: 45 },
      { id: 17, name: "Ôn tập", count: 72 },
      { id: 18, name: "Kinh nghiệm", count: 40 }
    ]
  },
  {
    id: 6,
    name: "Tư vấn chọn ngành",
    icon: <Users className="h-5 w-5" />,
    count: 112,
    subCategories: [
      { id: 22, name: "Ngành kỹ thuật", count: 38 },
      { id: 23, name: "Ngành kinh tế", count: 42 },
      { id: 24, name: "Ngành y dược", count: 32 }
    ]
  }
];

// Top users
const topUsers = [
  { id: 1, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=1", points: 1250, badge: "Người giúp đỡ" },
  { id: 2, name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?img=5", points: 980, badge: "Chuyên gia Toán" },
  { id: 3, name: "Lê Văn C", avatar: "https://i.pravatar.cc/150?img=8", points: 845, badge: "Nhà giải đề" },
  { id: 4, name: "Phạm Thị D", avatar: "https://i.pravatar.cc/150?img=9", points: 720, badge: "Cống hiến" },
  { id: 5, name: "Hoàng Văn E", avatar: "https://i.pravatar.cc/150?img=3", points: 650, badge: "Chuyên gia Anh" }
];

// Components
const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches] = useState(['hàm số bậc hai', 'ôn thi thpt', 'vào lớp 10', 'ngữ văn']);
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Tìm kiếm câu hỏi, chủ đề, người dùng..."
          className="pl-10 pr-4 h-12 bg-background/50 border-purple-500/20 focus:border-purple-500/50 focus-visible:ring-purple-500/20 transition-all rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
      </div>

      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-lg shadow-purple-500/10 z-50 p-3 overflow-hidden"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400 mb-2">Tìm kiếm gần đây</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs border-purple-500/20 hover:bg-purple-500/10"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Chủ đề phổ biến</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-300 hover:bg-purple-500/20">THPT Quốc Gia</Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20">Đại số</Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-300 hover:bg-green-500/20">Ngữ văn</Badge>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20">Tuyển sinh 10</Badge>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const DiscussionCard = ({ discussion }: { discussion: Discussion }) => {
  // showTooltip không được sử dụng trong component này
  const cardRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      const diffInDays = diffInHours / 24;
      if (diffInDays < 30) {
        return `${Math.floor(diffInDays)} ngày trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        // Xử lý click outside nếu cần trong tương lai
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative"
      ref={cardRef}
    >
      <Card className="p-4 border border-purple-500/20 bg-gradient-to-br from-background to-purple-950/10 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden group cursor-pointer">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={discussion.author.avatar}
                  alt={discussion.author.name}
                />
                <AvatarFallback className="bg-primary/10">
                  {discussion.author.name.split(' ').pop()?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{discussion.author.name}</p>
                <p className="text-xs text-gray-400">{discussion.author.rank}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatDate(discussion.createdAt)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {discussion.isPinned && (
                <Badge variant="outline" className="bg-red-500/10 text-red-300 px-1.5 py-0 text-[10px]">
                  GHIM
                </Badge>
              )}
              {discussion.isHot && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-300 px-1.5 py-0 text-[10px]">
                  HOT
                </Badge>
              )}
              {discussion.isAnswered && (
                <Badge variant="outline" className="bg-green-500/10 text-green-300 px-1.5 py-0 text-[10px]">
                  ĐÃ TRẢ LỜI
                </Badge>
              )}
            </div>

            <h3 className="font-semibold group-hover:text-purple-300 transition-colors line-clamp-2">
              {discussion.title}
            </h3>

            <p className="text-sm text-gray-400 line-clamp-2">
              {discussion.content}
            </p>
          </div>

          <div className="flex flex-wrap gap-1 mt-1">
            {discussion.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-purple-500/5 text-xs hover:bg-purple-500/10"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-gray-400 text-sm group-hover:text-purple-300 transition-colors">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{discussion.likes}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm group-hover:text-purple-300 transition-colors">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{discussion.comments}</span>
              </div>
            </div>

            <Badge className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300">
              {discussion.subCategory}
            </Badge>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
};

// Main page component
export default function ForumPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeFilter, setActiveFilter] = useState('latest'); // Biến này được sử dụng trong onValueChange của Tabs

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20">
      <main className="container px-4 pt-8 pb-16 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Diễn đàn thảo luận
              </span>
            </h1>
            <p className="text-muted-foreground">
              Nơi trao đổi kiến thức, chia sẻ kinh nghiệm và giải đáp mọi thắc mắc về học tập
            </p>
          </div>

          {/* Search bar */}
          <SearchBar />

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories */}
            <div className="hidden lg:block space-y-6">
              <Card className="p-4 border-purple-500/20 bg-background/50 backdrop-blur-md">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span>Chủ đề thảo luận</span>
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                            {category.icon}
                          </div>
                          <span className="font-medium group-hover:text-purple-300 transition-colors">
                            {category.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-purple-500/10 text-xs">
                          {category.count}
                        </Badge>
                      </div>
                      <div className="ml-8 pl-2 space-y-1 border-l border-purple-500/20">
                        {category.subCategories.map((subCat) => (
                          <div key={subCat.id} className="flex items-center justify-between text-sm text-muted-foreground hover:text-purple-300 cursor-pointer group">
                            <span className="group-hover:translate-x-1 transition-transform">
                              {subCat.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {subCat.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top users */}
              <Card className="p-4 border-purple-500/20 bg-background/50 backdrop-blur-md">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  <span>Thành viên xuất sắc</span>
                </h3>
                <div className="space-y-3">
                  {topUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-3 group">
                      <div className="relative">
                        <Avatar className="h-8 w-8 border-2 border-purple-500/30 group-hover:border-purple-500/50 transition-colors">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-purple-300 transition-colors">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="px-1 py-0 text-[9px] bg-purple-500/10 text-purple-300">
                            {user.badge}
                          </Badge>
                          <span className="text-xs text-gray-500">{user.points} điểm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground hover:text-purple-300 hover:bg-purple-500/10">
                  Xem thêm
                </Button>
              </Card>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Mobile categories dropdown */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between border-purple-500/20 bg-background/50"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Chọn chủ đề</span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="center">
                    {categories.map((category) => (
                      <DropdownMenuItem key={category.id} className="flex items-center gap-2 cursor-pointer">
                        <div className="p-1 rounded-md bg-purple-500/10 text-purple-400">
                          {category.icon}
                        </div>
                        <span>{category.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filter bar */}
              <div className="flex items-center justify-between">
                <Tabs
                  defaultValue="latest"
                  className="w-full"
                  onValueChange={setActiveFilter}
                >
                  <TabsList className="grid grid-cols-4 bg-background/50 border border-purple-500/20">
                    <TabsTrigger
                      value="latest"
                      className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Mới nhất</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="popular"
                      className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Nổi bật</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="commented"
                      className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Nhiều bình luận</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="hot"
                      className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
                    >
                      <Flame className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Hot</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <TabsContent value="latest" className="space-y-4 mt-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Thảo luận mới nhất</h3>
                        <Button variant="outline" size="sm" className="text-xs border-purple-500/20 hover:bg-purple-500/10">
                          <Filter className="h-3 w-3 mr-1" />
                          Bộ lọc
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {sampleDiscussions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((discussion) => (
                          <DiscussionCard key={discussion.id} discussion={discussion} />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="popular" className="space-y-4 mt-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Thảo luận nổi bật</h3>
                        <Button variant="outline" size="sm" className="text-xs border-purple-500/20 hover:bg-purple-500/10">
                          <Filter className="h-3 w-3 mr-1" />
                          Bộ lọc
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {sampleDiscussions.sort((a, b) => b.likes - a.likes).map((discussion) => (
                          <DiscussionCard key={discussion.id} discussion={discussion} />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="commented" className="space-y-4 mt-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Nhiều bình luận nhất</h3>
                        <Button variant="outline" size="sm" className="text-xs border-purple-500/20 hover:bg-purple-500/10">
                          <Filter className="h-3 w-3 mr-1" />
                          Bộ lọc
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {sampleDiscussions.sort((a, b) => b.comments - a.comments).map((discussion) => (
                          <DiscussionCard key={discussion.id} discussion={discussion} />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="hot" className="space-y-4 mt-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Chủ đề hot</h3>
                        <Button variant="outline" size="sm" className="text-xs border-purple-500/20 hover:bg-purple-500/10">
                          <Filter className="h-3 w-3 mr-1" />
                          Bộ lọc
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {sampleDiscussions.filter(d => d.isHot).map((discussion) => (
                          <DiscussionCard key={discussion.id} discussion={discussion} />
                        ))}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Create discussion button */}
              <div className="fixed bottom-6 right-6 z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/thao-luan/tao-bai-viet">
                    <Button
                      className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/20"
                    >
                      <MessageSquare className="h-6 w-6" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-background overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl opacity-20" />
      </div>
    </div>
  );
}