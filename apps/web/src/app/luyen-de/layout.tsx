import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luyện Đề - NyNus | Luyện đề thông minh, cá nhân hóa với AI",
  description: "Luyện đề thông minh với AI, ngân hàng câu hỏi phong phú, đề thi tùy chỉnh và gợi ý AI giúp bạn học tập hiệu quả hơn.",
};

export default function LuyenDeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 