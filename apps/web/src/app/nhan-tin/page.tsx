'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, Paperclip, Loader2, ChevronRight, MessageSquare, Clock, Settings, Sparkles, Bot } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
}

// Mẫu dữ liệu cuộc hội thoại
const sampleConversations: Conversation[] = [
  {
    id: '1',
    title: 'Giải bài tập Toán 10 - Chương 3',
    lastMessage: 'Cám ơn bạn đã giải thích chi tiết về cách giải bài toán...',
    timestamp: new Date('2023-10-15T14:30:00'),
    isActive: true
  },
  {
    id: '2',
    title: 'Ôn thi đại học - Hóa học',
    lastMessage: 'Các phản ứng oxi hóa - khử trong hóa học hữu cơ...',
    timestamp: new Date('2023-10-14T09:15:00')
  },
  {
    id: '3',
    title: 'Luyện đề Vật lý 12',
    lastMessage: 'Bài tập về chuyển động thẳng đều và chuyển động...',
    timestamp: new Date('2023-10-12T16:45:00')
  },
  {
    id: '4',
    title: 'Ôn tập Ngữ văn lớp 11',
    lastMessage: 'Phân tích tác phẩm "Người lái đò sông Đà"...',
    timestamp: new Date('2023-10-10T11:20:00')
  },
  {
    id: '5',
    title: 'Bài tập Tiếng Anh - Grammar',
    lastMessage: 'Các dạng thì trong tiếng Anh và cách sử dụng...',
    timestamp: new Date('2023-10-08T13:40:00')
  }
];

// Mẫu dữ liệu tin nhắn
const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Xin chào! Tôi là trợ lý AI của NyNus. Tôi có thể giúp gì cho bạn hôm nay?',
    sender: 'ai',
    timestamp: new Date('2023-10-15T14:25:00')
  },
  {
    id: '2',
    content: 'Chào bạn, tôi cần giúp đỡ về bài tập Toán lớp 10, chương 3 về phương trình bậc hai.',
    sender: 'user',
    timestamp: new Date('2023-10-15T14:26:00')
  },
  {
    id: '3',
    content: 'Tôi rất sẵn lòng giúp bạn với phương trình bậc hai! Đây là một chủ đề quan trọng trong chương trình Toán 10. \n\nPhương trình bậc hai có dạng tổng quát: ax² + bx + c = 0, trong đó a ≠ 0.\n\nĐể giải phương trình này, bạn có thể:\n\n1. Sử dụng công thức delta: Δ = b² - 4ac\n   - Nếu Δ < 0: Phương trình vô nghiệm\n   - Nếu Δ = 0: Phương trình có nghiệm kép x = -b/(2a)\n   - Nếu Δ > 0: Phương trình có hai nghiệm phân biệt x₁ = (-b + √Δ)/(2a) và x₂ = (-b - √Δ)/(2a)\n\n2. Phân tích thành nhân tử (nếu có thể)\n\n3. Sử dụng các công thức nghiệm đặc biệt\n\nBạn có bài toán cụ thể nào cần giải không?',
    sender: 'ai',
    timestamp: new Date('2023-10-15T14:28:00')
  },
  {
    id: '4',
    content: 'Cám ơn bạn đã giải thích chi tiết. Tôi hiểu rồi. Cám ơn nhiều!',
    sender: 'user',
    timestamp: new Date('2023-10-15T14:30:00')
  }
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [inputValue, setInputValue] = useState('');
  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [showConversations, setShowConversations] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newUserMessage]);
    setInputValue('');

    // Add loading indicator
    setTimeout(() => {
      const loadingMessage: Message = {
        id: 'loading',
        content: '',
        sender: 'ai',
        timestamp: new Date(),
        isLoading: true
      };

      setMessages(prev => [...prev, loadingMessage]);

      // Simulate AI response after 1-2 seconds
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Không có gì! Rất vui khi được giúp bạn hiểu thêm về phương trình bậc hai. Nếu bạn có bất kỳ câu hỏi nào khác về toán học hoặc các môn học khác, đừng ngại hỏi nhé! Chúc bạn học tập tốt.',
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => prev.filter(msg => !msg.isLoading).concat(aiResponse));
      }, 1500);
    }, 500);

    // Update conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          lastMessage: inputValue,
          timestamp: new Date()
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: (Date.now()).toString(),
      title: 'Cuộc hội thoại mới',
      lastMessage: 'Bắt đầu cuộc trò chuyện mới...',
      timestamp: new Date(),
      isActive: true
    };

    setConversations([
      newConversation,
      ...conversations.map(conv => ({...conv, isActive: false}))
    ]);

    setActiveConversation(newConversation.id);
    setMessages([{
      id: '1',
      content: 'Xin chào! Tôi là trợ lý AI của NyNus. Tôi có thể giúp gì cho bạn hôm nay?',
      sender: 'ai',
      timestamp: new Date()
    }]);
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
    setConversations(conversations.map(conv => ({
      ...conv,
      isActive: conv.id === id
    })));
    // Trong thực tế sẽ load tin nhắn từ API dựa vào ID cuộc hội thoại
  };

  const formatMessageDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: vi });
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  return (
    <main className="container mx-auto py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-1 overflow-hidden rounded-xl border shadow-lg bg-background dark:bg-zinc-900/60 dark:border-zinc-800">
        {/* Conversations sidebar */}
        <AnimatePresence initial={false}>
          {showConversations && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r dark:border-zinc-800 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-lg font-medium">Tin nhắn</h2>
                <Button size="sm" variant="outline" onClick={createNewConversation}>
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Mới</span>
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation.id)}
                      className={cn(
                        "p-3 rounded-lg mb-2 cursor-pointer transition-colors",
                        conversation.isActive
                          ? "bg-purple-500/10 dark:bg-purple-500/20"
                          : "hover:bg-muted/80 dark:hover:bg-zinc-800/70"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium line-clamp-1 flex-1">{conversation.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(conversation.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t dark:border-zinc-800">
                <Button variant="outline" className="w-full" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt trợ lý
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Chat header */}
          <div className="p-4 border-b dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-2 lg:hidden"
                onClick={() => setShowConversations(!showConversations)}
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", showConversations ? "rotate-180" : "")} />
              </Button>

              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">AI</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">Trợ lý NyNus</h2>
                  <div className="flex items-center text-xs text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1"></span>
                    <span>Đang hoạt động</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Lịch sử chat</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chi tiết hội thoại</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "mb-6",
                    message.sender === 'user' ? "flex justify-end" : "flex justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex max-w-[85%]",
                      message.sender === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className={cn(
                      "h-8 w-8 mt-0.5",
                      message.sender === 'user' ? "ml-3" : "mr-3"
                    )}>
                      {message.sender === 'user' ? (
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600">HS</AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600">AI</AvatarFallback>
                      )}
                    </Avatar>

                    <div>
                      <div
                        className={cn(
                          "rounded-lg p-3.5",
                          message.sender === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/40 dark:bg-zinc-800"
                        )}
                      >
                        {message.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>NyNus đang nhập...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-line">{message.content}</div>
                        )}
                      </div>

                      <div
                        className={cn(
                          "text-xs text-muted-foreground mt-1",
                          message.sender === 'user' ? "text-right" : "text-left"
                        )}
                      >
                        {formatMessageDate(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <motion.div
            className="p-4 border-t dark:border-zinc-800 bg-background dark:bg-zinc-900/60"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end relative">
                <div className="flex flex-1 items-end overflow-hidden rounded-lg border bg-background dark:bg-zinc-800/50 dark:border-zinc-700">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn của bạn..."
                    className="min-h-[52px] max-h-[200px] flex-1 resize-none border-0 focus-visible:ring-0 px-3 py-3 bg-transparent"
                  />

                  <div className="flex items-center pr-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                            <Paperclip className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Đính kèm file</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="ml-2 h-[52px] w-[52px] rounded-full bg-primary hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-2 flex items-center text-xs text-muted-foreground justify-between">
                <div className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Trợ lý AI được đào tạo trên nội dung giáo dục</span>
                </div>
                <div className="flex items-center">
                  <Bot className="h-3 w-3 mr-1" />
                  <span>Powered by NyNus AI</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}