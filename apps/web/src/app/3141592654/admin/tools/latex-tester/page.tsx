'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { LatexBracketTester } from '@/components/questions/LatexBracketTester';
import { Button } from '@/components/ui/button';


export default function LatexTesterPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Công cụ kiểm tra LaTeX</h1>
        </div>
      </div>

      <p className="text-gray-500">
        Công cụ này giúp kiểm tra và trích xuất nội dung từ các dấu ngoặc lồng nhau trong LaTeX.
        Nó phân tích cú pháp và xác minh tính hợp lệ của các lệnh và môi trường LaTeX.
      </p>

      <LatexBracketTester />

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Hướng dẫn sử dụng</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Nhập nội dung LaTeX vào ô văn bản</li>
          <li>Nhập tên lệnh LaTeX cần tìm (ví dụ: <code>\loigiai</code>, <code>\question</code>)</li>
          <li>Nhập tên môi trường LaTeX cần tìm (ví dụ: <code>ex</code>, <code>choice</code>)</li>
          <li>Nhấn nút &quot;Kiểm tra LaTeX&quot; để phân tích</li>
          <li>Xem kết quả ở các tab bên dưới</li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-2">Ví dụ LaTeX hợp lệ</h3>
        <pre className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-x-auto text-xs font-mono">
{`\\begin{ex}%[Nguồn: &quot;Đề thi thử THPT QG 2023&quot;]%[1P1V1-6]%[PT.45]
Một vật dao động điều hòa với phương trình x = 5cos(2πt + π/3) (cm). Tốc độ của vật tại thời điểm t = 1/12 (s) là
\\choice
{5π cm/s}
{25π cm/s}
{*10π cm/s}
{15π cm/s}
\\loigiai{
Vận tốc của vật: $v = \\frac{dx}{dt} = -5.2\\pi.\\sin(2\\pi t + \\pi/3)$ (cm/s)

Tại $t = \\frac{1}{12}$ (s):
$v = -5.2\\pi.\\sin(2\\pi.\\frac{1}{12} + \\pi/3) = -5.2\\pi.\\sin(\\frac{\\pi}{6} + \\frac{\\pi}{3}) = -5.2\\pi.\\sin(\\frac{\\pi}{2}) = -5.2\\pi.1 = -10\\pi$ (cm/s)

Vận tốc của vật có độ lớn là $|v| = 10\\pi$ (cm/s)
}
\\end{ex}`}
        </pre>

        <h3 className="text-lg font-medium mt-4 mb-2">Ví dụ lời giải phức tạp với nhiều dấu ngoặc lồng nhau</h3>
        <pre className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-x-auto text-xs font-mono">
{`\\begin{ex}%[1D7V2-8]%[PT.46]
Cho hai hàm số $f(x)=ax^2+bx+c$ và $g(x)=mx^2+nx+p$ (với $a, m \\neq 0$), biết $\\forall x \\in \\mathbb{R}: f'(x).g(x)=f(x).g'(x)$. Khi đó, tỉ số giữa hai hàm số này là
\\choice
{một hằng số khác 0}
{một số vô tỷ}
{*một hằng số}
{một hàm bậc 3}
\\loigiai{
	Gọi $v(t)=p t^2+q t+r$ đi qua $O(0;0);I\\left(\\dfrac{1}{2};8\\right)$ và $M(1;0)$ ta có hệ phương trình
	\\[\\heva{&r=0\\\\&\\dfrac{1}{4}p+\\dfrac{1}{2}q+r=8\\\\&
			p+q+r=0} \\Leftrightarrow \\heva{& r=0 \\\\& q=32 \\\\& p=-32.}\\]
	Vậy $v(t)=-32t^2+32t$.\\\\
	Gia tốc vật là $a=v'(t)=-64t+32$.\\\\
	Lúc $t=0{,}25$(h) thì gia tốc là $a=16$ (km/h$^2$).
}
\\end{ex}`}
        </pre>

        <h3 className="text-lg font-medium mt-4 mb-2">Các định dạng Subcount được hỗ trợ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <p className="font-medium mb-2">Định dạng 1: Comment pattern</p>
            <code className="block text-xs">%[PT.45]%</code>
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Định dạng thông thường nhất, nằm trong comment LaTeX</p>
          </div>

          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <p className="font-medium mb-2">Định dạng 2: Subcount macro</p>
            <code className="block text-xs">{'\\{Subcount: PT.45\\}'}</code>
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Sử dụng macro Subcount trong văn bản LaTeX</p>
          </div>

          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <p className="font-medium mb-2">Định dạng 3: Subcnt</p>
            <code className="block text-xs">Subcnt: PT.45</code>
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">Định dạng ngắn gọn, thường dùng trong text</p>
          </div>
        </div>
      </div>
    </div>
  );
}