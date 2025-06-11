"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Minh Trí",
    role: "Học sinh lớp 12",
    avatar: "/images/avatars/student-1.jpg",
    text: "NyNus đã giúp tôi tăng 2 điểm trong kỳ thi thử THPT Quốc gia. Chatbot AI giải thích rất chi tiết và dễ hiểu, giống như có gia sư riêng vậy!",
    rating: 5,
    school: "THPT Lê Hồng Phong"
  },
  {
    id: 2,
    name: "Trần Thanh Thảo",
    role: "Giáo viên Toán",
    avatar: "/images/avatars/teacher-1.jpg",
    text: "Tôi đã giới thiệu NyNus cho học sinh của mình và thấy sự tiến bộ rõ rệt. Hệ thống phân tích khả năng từng em rất chính xác, giúp tôi điều chỉnh phương pháp giảng dạy hiệu quả hơn.",
    rating: 5,
    school: "THPT Nguyễn Thị Minh Khai"
  },
  {
    id: 3,
    name: "Lê Hoàng Nam",
    role: "Phụ huynh",
    avatar: "/images/avatars/parent-1.jpg",
    text: "Con trai tôi trước đây rất sợ môn Toán, nhưng từ khi sử dụng NyNus, cháu đã hứng thú học tập hơn nhiều. Đặc biệt là tính năng thi đấu trực tuyến tạo động lực học tập rất tốt.",
    rating: 4,
    relation: "Phụ huynh học sinh lớp 9"
  },
  {
    id: 4,
    name: "Phạm Anh Tuấn",
    role: "Học sinh lớp 10",
    avatar: "/images/avatars/student-2.jpg",
    text: "Tôi thích cách NyNus giải thích các khái niệm phức tạp bằng hình ảnh trực quan. Đề thi thử rất sát với đề thi thật, giúp tôi chuẩn bị tốt cho các kỳ thi quan trọng.",
    rating: 5,
    school: "THPT Chuyên Lê Hồng Phong"
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const visibleCount = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : 1;
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (activeIndex + i) % testimonials.length;
      result.push(testimonials[index]);
    }
    return result;
  };

  // Generate dummy avatar if image not available
  const generateAvatar = (name: string) => {
    const initials = name.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
        {initials}
      </div>
    );
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-slate-100/95 dark:bg-slate-900/95 transition-colors duration-300"></div>
      <div className="absolute top-0 inset-0 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-5"></div>
      <div className="absolute -top-[10%] right-[20%] w-1/3 h-2/3 bg-blue-500/5 blur-[150px] rounded-full"></div>
      <div className="absolute -bottom-[10%] left-[20%] w-1/3 h-2/3 bg-purple-500/5 blur-[150px] rounded-full"></div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100/50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 backdrop-blur-sm mb-4 transition-colors duration-300">
            <Star className="h-4 w-4 mr-2 fill-purple-600 dark:fill-purple-400 transition-colors duration-300" /> Cảm nhận của người dùng
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 dark:text-white transition-colors duration-300">
            Học sinh, giáo viên và phụ huynh nói gì về chúng tôi
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg transition-colors duration-300">
            Khám phá trải nghiệm học tập đột phá cùng cộng đồng người dùng NyNus
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex justify-between items-center mb-8">
            <p className="text-slate-800 dark:text-white text-lg transition-colors duration-300"><span className="text-purple-600 dark:text-purple-400 font-bold transition-colors duration-300">+12,000</span> người dùng hài lòng</p>
            <div className="flex gap-2">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-white transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700 dark:text-white transition-colors duration-300" />
              </button>
              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-white transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5 text-slate-700 dark:text-white transition-colors duration-300" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleTestimonials().map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-6 rounded-2xl transition-colors duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 transition-colors duration-300">
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        // Fallback to generateAvatar
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          generateAvatar(testimonial.name);
                        }}
                      />
                    ) : generateAvatar(testimonial.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white transition-colors duration-300">{testimonial.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{testimonial.role}</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative pl-5 border-l-2 border-purple-600">
                  <Quote className="absolute top-0 left-5 text-purple-400/20 dark:text-purple-400/20 rotate-180 h-8 w-8 transition-colors duration-300" />
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm transition-colors duration-300">{testimonial.text}</p>
                </div>
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-500 transition-colors duration-300">
                  {testimonial.school || testimonial.relation}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;