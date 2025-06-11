"use client";

import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FAQItem = ({ question, answer, isOpen, toggleOpen }: FAQItemProps) => {
  return (
    <div className="rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-200 hover:shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
      <button
        className={`w-full p-6 flex items-center justify-between text-left font-medium ${
          isOpen ? "bg-slate-100/80 dark:bg-slate-800/80" : "bg-white/70 dark:bg-slate-800/50"
        } transition-colors duration-300`}
        onClick={toggleOpen}
      >
        <div className="flex items-center">
          <HelpCircle className={`h-5 w-5 mr-3 ${isOpen ? "text-blue-400" : "text-slate-400"}`} />
          <span className="text-slate-800 dark:text-white transition-colors duration-300">{question}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-6 text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
          {answer}
        </div>
      )}
    </div>
  );
};

const faqData = [
  {
    id: 1,
    question: "NyNus hỗ trợ học sinh những cấp học nào?",
    answer: "NyNus hỗ trợ học sinh từ lớp 9 đến lớp 12, với trọng tâm là ôn luyện cho các kỳ thi quan trọng như thi vào lớp 10 và thi tốt nghiệp THPT Quốc gia."
  },
  {
    id: 2,
    question: "Làm thế nào để bắt đầu sử dụng nền tảng?",
    answer: "Bạn chỉ cần đăng ký tài khoản, sau đó hệ thống sẽ đánh giá năng lực và gợi ý lộ trình học tập phù hợp. Bạn có thể bắt đầu với các bài học miễn phí hoặc nâng cấp tài khoản để mở khóa tất cả nội dung."
  },
  {
    id: 3,
    question: "Phần mềm sử dụng trí tuệ nhân tạo như thế nào?",
    answer: "AI của chúng tôi phân tích dữ liệu học tập của bạn để xác định điểm mạnh, điểm yếu và đề xuất các bài học, đề thi phù hợp. Ngoài ra, chatbot AI có thể giải thích các bài tập khó và hướng dẫn phương pháp giải chi tiết, giống như một gia sư cá nhân."
  },
  {
    id: 4,
    question: "Tôi có thể truy cập NyNus trên thiết bị nào?",
    answer: "NyNus hoạt động trên tất cả các thiết bị có kết nối internet, bao gồm máy tính, tablet và điện thoại di động. Giao diện được tối ưu cho mọi kích thước màn hình."
  },
  {
    id: 5,
    question: "Làm thế nào để liên hệ với đội ngũ hỗ trợ?",
    answer: "Bạn có thể liên hệ qua email support@nynus.edu.vn, hotline 1900-xxxx hoặc chat trực tiếp trên website. Đội ngũ hỗ trợ sẵn sàng giúp đỡ từ 8h đến 22h hàng ngày, kể cả cuối tuần."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-100/95 to-blue-100/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-900/20 -z-10 transition-colors duration-300"></div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-5">
        <div className="absolute -top-[30%] -left-[10%] w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-1/2 h-1/2 bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Wave decoration on top */}
      <div className="absolute top-0 left-0 w-full h-24 bg-[url('/images/wave-light-top.svg')] dark:bg-[url('/images/wave-dark-top.svg')] bg-cover bg-top bg-no-repeat -z-10 transition-colors duration-300"></div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 backdrop-blur-sm mb-4 transition-colors duration-300">
            <HelpCircle className="h-4 w-4 mr-2" /> Hỗ trợ & Hướng dẫn
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-white transition-colors duration-300">
            Câu hỏi thường gặp
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
            Những thắc mắc phổ biến về nền tảng học tập NyNus
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                toggleOpen={() => toggleFAQ(index)}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors duration-300">
              Không tìm thấy câu trả lời bạn cần?
            </p>
            <button className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
              <MessageCircle className="h-5 w-5 mr-2" /> Liên hệ ngay
            </button>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-[url('/images/wave-light-bottom.svg')] dark:bg-[url('/images/wave-dark-bottom.svg')] bg-cover bg-bottom bg-no-repeat transition-colors duration-300"></div>
    </section>
  );
};

export default FAQ;