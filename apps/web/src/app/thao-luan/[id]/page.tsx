"use client";

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock,
  Eye,
  MessageCircle,
  Heart,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Award
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useRef } from 'react';

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Interface for Discussion
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
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  tags: string[];
  hasImage: boolean;
  images?: string[];
  isPinned: boolean;
  isHot: boolean;
  isAnswered: boolean;
  isSolved: boolean;
}

// Interface for Comment
interface Comment {
  id: number;
  author: {
    id: number;
    name: string;
    avatar: string;
    rank: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isBestAnswer: boolean;
  replies: Comment[];
  images?: string[];
}

// Dữ liệu mẫu chi tiết bài thảo luận
const discussionDetail: Discussion = {
  id: 1,
  title: "Cách giải phương trình bậc 2 một ẩn nhanh nhất?",
  content: `Chào các bạn,

Mình đang chuẩn bị thi HSG Toán cấp tỉnh và cần cải thiện tốc độ giải các dạng bài cơ bản, trong đó có phương trình bậc 2.

Các bạn có mẹo gì để nhận biết nhanh dạng nghiệm của phương trình bậc 2 và rút gọn cách giải không? Ví dụ như khi nào thì có thể bỏ qua công thức nghiệm tổng quát mà sử dụng cách khác ngắn gọn hơn?

Mình cũng muốn biết các kỹ thuật tính nhanh delta và căn bậc hai nếu có. Cảm ơn các bạn nhiều!`,
  author: {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "/images/avatars/avatar-1.png",
    rank: "Học sinh tiêu biểu"
  },
  category: "Toán học",
  subCategory: "Đại số",
  createdAt: "2023-10-15T14:30:00",
  updatedAt: "2023-10-15T15:45:00",
  views: 342,
  likes: 24,
  comments: 12,
  bookmarks: 18,
  tags: ["Toán 10", "Phương trình", "Đại số"],
  hasImage: false,
  isPinned: true,
  isHot: true,
  isAnswered: true,
  isSolved: true
};

// Dữ liệu mẫu bình luận
const sampleComments: Comment[] = [
  {
    id: 1,
    author: {
      id: 5,
      name: "Vũ Văn E",
      avatar: "/images/avatars/avatar-5.png",
      rank: "Học sinh tiêu biểu"
    },
    content: "Một mẹo mình hay dùng là nhìn ngay vào hệ số a, b, c để xác định dạng nghiệm:\n\n1. Nếu Δ = b² - 4ac > 0: phương trình có 2 nghiệm phân biệt\n2. Nếu Δ = 0: phương trình có nghiệm kép x = -b/2a\n3. Nếu Δ < 0: phương trình vô nghiệm\n\nMột số trường hợp đặc biệt:\n- Nếu c = 0: phương trình có một nghiệm x₁ = 0 và nghiệm thứ 2 là x₂ = -b/a\n- Nếu a + b + c = 0: phương trình có nghiệm x₁ = 1\n- Nếu a - b + c = 0: phương trình có nghiệm x₂ = -1\n\nHy vọng giúp ích cho bạn!",
    createdAt: "2023-10-15T15:00:00",
    likes: 15,
    isLiked: false,
    isBestAnswer: true,
    replies: []
  },
  {
    id: 2,
    author: {
      id: 3,
      name: "Lê Văn C",
      avatar: "/images/avatars/avatar-3.png",
      rank: "Học sinh tích cực"
    },
    content: "Mình bổ sung thêm là nếu bạn gặp phương trình dạng ax² + bx + c = 0 mà a + c = b thì x₁ = 1 luôn nhé. Ngoài ra khi thi, để tính nhanh thì việc thuộc một số giá trị căn bậc hai cơ bản cũng rất quan trọng.",
    createdAt: "2023-10-15T15:30:00",
    likes: 8,
    isLiked: true,
    isBestAnswer: false,
    replies: [
      {
        id: 3,
        author: {
          id: 1,
          name: "Nguyễn Văn A",
          avatar: "/images/avatars/avatar-1.png",
          rank: "Học sinh tiêu biểu"
        },
        content: "Cảm ơn bạn nhiều! Mình sẽ ghi nhớ mẹo này.",
        createdAt: "2023-10-15T15:35:00",
        likes: 3,
        isLiked: false,
        isBestAnswer: false,
        replies: []
      }
    ]
  },
  {
    id: 4,
    author: {
      id: 2,
      name: "Trần Thị B",
      avatar: "/images/avatars/avatar-2.png",
      rank: "Học sinh năng động"
    },
    content: "Mình thấy việc phân tích thành nhân tử (nếu được) sẽ giúp giải nhanh hơn nhiều so với áp dụng công thức. Ví dụ ax² + bx + c = a(x - x₁)(x - x₂). Với các bài tập về tìm m để phương trình có nghiệm đặc biệt, sử dụng định lý Viet sẽ nhanh hơn rất nhiều.",
    createdAt: "2023-10-15T16:10:00",
    likes: 10,
    isLiked: false,
    isBestAnswer: false,
    replies: []
  },
  {
    id: 5,
    author: {
      id: 4,
      name: "Phạm Thị D",
      avatar: "/images/avatars/avatar-4.png",
      rank: "Học sinh mới"
    },
    content: "Bạn có thể chia sẻ một số ví dụ cụ thể về các dạng phương trình bậc 2 hay gặp trong các đề HSG Toán không? Mình cũng đang chuẩn bị thi HSG.",
    createdAt: "2023-10-15T16:45:00",
    likes: 5,
    isLiked: false,
    isBestAnswer: false,
    replies: [
      {
        id: 6,
        author: {
          id: 1,
          name: "Nguyễn Văn A",
          avatar: "/images/avatars/avatar-1.png",
          rank: "Học sinh tiêu biểu"
        },
        content: "Mình sẽ tổng hợp và chia sẻ trong bài viết mới sớm nhé!",
        createdAt: "2023-10-15T17:00:00",
        likes: 4,
        isLiked: true,
        isBestAnswer: false,
        replies: []
      }
    ]
  }
];

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Components
const CommentItem = ({ comment, level = 0 }: { comment: Comment, level?: number }) => {
  const [showReplies, setShowReplies] = useState(true);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleReply = () => {
    // Just toggle the reply form for demo
    setIsReplying(!isReplying);
  };

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      // In a real app, you would submit the reply to the server
      alert('Trả lời đã được gửi!');
      setReplyText('');
      setIsReplying(false);
    }
  };

  return (
    <div className={`relative ${level > 0 ? 'ml-8 mt-3 border-l-2 border-gray-700/20 pl-4' : 'mt-6'}`}>
      <div className="flex gap-3">
        <div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            {comment.author.rank === "Chuyên gia môn Toán" && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-300 text-[10px]">
                {comment.author.rank}
              </Badge>
            )}
            <span className="text-muted-foreground text-xs">{formatDate(comment.createdAt)}</span>

            {comment.isBestAnswer && (
              <Badge className="bg-green-500/20 text-green-300 ml-auto">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Câu trả lời hay nhất
              </Badge>
            )}
          </div>

          <div className="text-sm text-foreground">
            <div dangerouslySetInnerHTML={{ __html: comment.content }} />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`flex items-center gap-1 text-xs ${isLiked ? 'text-red-400' : 'text-muted-foreground'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-400' : ''}`} />
              <span>{likes}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 text-xs text-muted-foreground"
              onClick={handleReply}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Trả lời</span>
            </motion.button>
          </div>

          {isReplying && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <Textarea
                placeholder="Viết câu trả lời của bạn..."
                value={replyText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                className="min-h-[100px] bg-background/50 text-sm border-purple-500/20 focus-visible:ring-purple-500/30"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Gửi trả lời
                </Button>
              </div>
            </motion.div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-1">
              <button
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Ẩn {comment.replies.length} trả lời</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Xem {comment.replies.length} trả lời</span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {comment.replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} level={level + 1} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main page component
export default function DiscussionDetailPage({ params: _params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [likes, setLikes] = useState(discussionDetail.likes);
  const [bookmarks, setBookmarks] = useState(discussionDetail.bookmarks);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks - 1);
    } else {
      setBookmarks(bookmarks + 1);
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      alert('Bình luận đã được gửi!');
      setCommentText('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20">
      <main className="container px-4 pt-6 pb-16 mx-auto max-w-5xl">
        <div className="flex flex-col gap-6">
          {/* Back button */}
          <div>
            <Link href="/thao-luan" className="inline-flex items-center text-sm text-muted-foreground hover:text-purple-400 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại diễn đàn
            </Link>
          </div>

          {/* Discussion card */}
          <Card className="p-6 border-purple-500/20 bg-background/50 backdrop-blur-md overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={discussionDetail.author.avatar} alt={discussionDetail.author.name} />
                    <AvatarFallback>{discussionDetail.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold">{discussionDetail.title}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="font-medium">{discussionDetail.author.name}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(discussionDetail.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300">
                          {discussionDetail.subCategory}
                        </Badge>

                        {discussionDetail.isPinned && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-300">
                            GHIM
                          </Badge>
                        )}

                        {discussionDetail.isHot && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-300">
                            HOT
                          </Badge>
                        )}

                        {discussionDetail.isSolved && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-300">
                            ĐÃ GIẢI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Báo cáo</DropdownMenuItem>
                    <DropdownMenuItem>Chia sẻ</DropdownMenuItem>
                    <DropdownMenuItem>Theo dõi chủ đề</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <div className="mt-2">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: discussionDetail.content }} />
                </div>

                {discussionDetail.hasImage && discussionDetail.images && (
                  <div className="mt-4 space-y-4">
                    {discussionDetail.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Ảnh minh họa ${index + 1}`}
                        className="max-w-full h-auto rounded-lg border border-gray-800/30"
                        width={800}
                        height={600}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {discussionDetail.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-purple-500/5 text-xs hover:bg-purple-500/10"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats and actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-4 border-t border-gray-800/20">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{discussionDetail.views} lượt xem</span>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{discussionDetail.comments} bình luận</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 ${isLiked ? 'text-red-400 border-red-400/30' : 'border-gray-800/30'}`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-red-400' : ''}`} />
                    <span>{likes}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 ${isBookmarked ? 'text-yellow-400 border-yellow-400/30' : 'border-gray-800/30'}`}
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-yellow-400' : ''}`} />
                    <span>{bookmarks}</span>
                  </Button>

                  <Button variant="outline" size="sm" className="gap-2 border-gray-800/30">
                    <Share2 className="h-4 w-4" />
                    <span>Chia sẻ</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Comments section */}
          <Card className="p-6 border-purple-500/20 bg-background/50 backdrop-blur-md">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Bình luận ({comments.length})</h2>
                <Button variant="outline" size="sm" className="text-xs border-purple-500/20 hover:bg-purple-500/10">
                  Mới nhất
                </Button>
              </div>

              {/* Write comment */}
              <div className="my-4">
                <Textarea
                  placeholder="Viết bình luận của bạn..."
                  value={commentText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
                  className="min-h-[120px] bg-background/50 border-purple-500/20 focus-visible:ring-purple-500/30"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-muted-foreground">
                    Hỗ trợ định dạng markdown
                  </div>
                  <Button
                    onClick={handleSubmitComment}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    disabled={!commentText.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Gửi bình luận
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-800/20" />

              {/* Comments list */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </Card>

          {/* Related discussions */}
          <Card className="p-6 border-purple-500/20 bg-background/50 backdrop-blur-md">
            <h3 className="font-semibold mb-4">Bài viết liên quan</h3>
            <div className="space-y-3">
              <motion.div
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-500/5 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-5 w-5 text-purple-400 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Làm thế nào để tìm nghiệm của phương trình bậc hai?</h4>
                  <p className="text-xs text-muted-foreground">Đăng bởi: Hoàng Văn E • 2 ngày trước</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-500/5 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-5 w-5 text-purple-400 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Tìm hiểu về hàm số bậc hai và ứng dụng</h4>
                  <p className="text-xs text-muted-foreground">Đăng bởi: Trần Thị B • 5 ngày trước</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-purple-500/5 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-5 w-5 text-purple-400 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">Phương pháp giải nhanh các bài toán về hàm số</h4>
                  <p className="text-xs text-muted-foreground">Đăng bởi: Lê Văn C • 1 tuần trước</p>
                </div>
              </motion.div>
            </div>
          </Card>
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