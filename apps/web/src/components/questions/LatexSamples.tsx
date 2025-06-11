'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LatexSamplesProps {
  onSelectSample: (sample: string) => void;
}

export function LatexSamples({ onSelectSample }: LatexSamplesProps) {
  const [copied, setCopied] = useState<string | null>(null);

  // Mẫu câu hỏi trắc nghiệm
  const multipleChoiceSample = `\\begin{ex}%[Nguồn: "Đề thi thử THPT QG 2023"]%[1P1V1-6]
Một vật dao động điều hòa với phương trình x = 5cos(2πt + π/3) (cm). Tốc độ của vật tại thời điểm t = 1/12 (s) là
\\choice
{25π cm/s}
{5π cm/s}
{10π cm/s}
{\\True 5\\sqrt{3}π cm/s}
\\loigiai{
Ta có: x = 5cos(2πt + π/3) (cm)
Vận tốc: v = -5.2π.sin(2πt + π/3) = -10π.sin(2πt + π/3) (cm/s)
Tại t = 1/12 (s): v = -10π.sin(2π.1/12 + π/3) = -10π.sin(π/6 + π/3) = -10π.sin(π/2) = -10π (cm/s)
Tốc độ: |v| = 10π (cm/s)
}
\\end{ex}`;

  // Mẫu câu hỏi true/false
  const trueFalseSample = `\\begin{ex}%[Nguồn: "Đề thi thử THPT QG 2023"]%[2H2T3-4]%[TL.123456]
Cho các phát biểu sau về kim loại:
\\choiceTF
{\\True Kim loại có tính dẻo}
{Kim loại có nhiệt độ nóng chảy thấp}
{\\True Kim loại dẫn điện tốt}
{Tất cả kim loại đều tác dụng với dung dịch axit}
\\loigiai{
(1) Đúng. Kim loại có tính dẻo, có thể kéo thành sợi, dát thành lá mỏng.
(2) Sai. Nhiều kim loại có nhiệt độ nóng chảy cao, ví dụ: W (3410°C), Mo (2620°C).
(3) Đúng. Kim loại dẫn điện tốt do có các electron tự do.
(4) Sai. Một số kim loại không tác dụng với dung dịch axit, ví dụ: Au, Pt không tác dụng với HCl.
}
\\end{ex}`;

  // Mẫu câu hỏi trả lời ngắn
  const shortAnswerSample = `\\begin{ex}%[Nguồn: "Đề thi HSG tỉnh 2022"]%[3T3C2-1]
Tính giá trị của biểu thức $P = \\frac{\\sqrt{2}+\\sqrt{3}}{\\sqrt{2}-\\sqrt{3}}$
\\shortans{'$-5-2\\sqrt{6}$'}
\\loigiai{
$P = \\frac{\\sqrt{2}+\\sqrt{3}}{\\sqrt{2}-\\sqrt{3}} = \\frac{(\\sqrt{2}+\\sqrt{3})(\\sqrt{2}+\\sqrt{3})}{(\\sqrt{2}-\\sqrt{3})(\\sqrt{2}+\\sqrt{3})}$
$= \\frac{(\\sqrt{2})^2 + 2\\sqrt{2}\\sqrt{3} + (\\sqrt{3})^2}{(\\sqrt{2})^2 - (\\sqrt{3})^2}$
$= \\frac{2 + 2\\sqrt{6} + 3}{2 - 3} = \\frac{5 + 2\\sqrt{6}}{-1} = -5 - 2\\sqrt{6}$
}
\\end{ex}`;

  // Mẫu câu hỏi tự luận
  const essaySample = `\\begin{ex}%[Nguồn: "Đề thi HSG Quốc gia 2023"]%[3T4C5-2]
Cho hàm số $f(x) = x^3 - 3x^2 + mx + n$ có đồ thị cắt trục hoành tại ba điểm phân biệt và có tiếp tuyến tại một trong ba điểm đó song song với trục hoành. Tìm giá trị của $m$ và $n$.
\\loigiai{
Gọi $a, b, c$ là ba nghiệm của phương trình $f(x) = 0$.
Ta có $f(x) = (x-a)(x-b)(x-c)$.
Giả sử tiếp tuyến tại điểm $(a, 0)$ song song với trục hoành.
Khi đó $f'(a) = 0$.
Ta có $f'(x) = 3x^2 - 6x + m$.
Từ $f'(a) = 0$, suy ra $3a^2 - 6a + m = 0$ hay $m = 6a - 3a^2$.
Mặt khác, $f(x) = x^3 - 3x^2 + mx + n = (x-a)(x-b)(x-c)$.
So sánh hệ số, ta có $a + b + c = 3$ và $abc = -n$.
Từ $f'(x) = 3x^2 - 6x + m$, ta có $f'(x) = 3(x-a)(x-d)$ với $d$ là nghiệm còn lại của $f'(x) = 0$.
So sánh hệ số, ta có $a + d = 2$ nên $d = 2 - a$.
Vì $f'(x) = 3(x-a)(x-d) = 3(x-a)(x-(2-a)) = 3(x-a)(x-2+a)$, nên $m = 3(a-(2-a)) = 3(2a-2) = 6a - 6$.
Từ $m = 6a - 3a^2 = 6a - 6$, suy ra $3a^2 = 6$, nên $a^2 = 2$, do đó $a = \\pm\\sqrt{2}$.
Vì $a + b + c = 3$ và $a$ là nghiệm của $f(x) = 0$, nên $b + c = 3 - a$.
Mặt khác, từ $f(x) = (x-a)(x-b)(x-c) = (x-a)(x^2 - (b+c)x + bc)$, so sánh với $f(x) = x^3 - 3x^2 + mx + n$, ta có:
$-(b+c) = -3$ (đúng vì $b+c = 3-a$ và $a$ là nghiệm của $f'(x) = 0$)
$bc = m$ và $-abc = n$.
Từ $m = 6a - 6$ và $a^2 = 2$, ta có:
Nếu $a = \\sqrt{2}$, thì $m = 6\\sqrt{2} - 6$.
Nếu $a = -\\sqrt{2}$, thì $m = -6\\sqrt{2} - 6$.
Vì $a, b, c$ là ba nghiệm phân biệt, nên $a \\neq b$ và $a \\neq c$.
Từ $bc = m$ và $b + c = 3 - a$, ta có $b$ và $c$ là nghiệm của phương trình $t^2 - (3-a)t + m = 0$.
Để $b \\neq c$, ta cần $\\Delta = (3-a)^2 - 4m > 0$.
Thay $a = \\sqrt{2}$ và $m = 6\\sqrt{2} - 6$, ta có:
$\\Delta = (3-\\sqrt{2})^2 - 4(6\\sqrt{2} - 6) = 9 - 6\\sqrt{2} + 2 - 24\\sqrt{2} + 24 = 35 - 30\\sqrt{2}$.
Vì $\\sqrt{2} < 1.5$, nên $30\\sqrt{2} < 45$, do đó $\\Delta = 35 - 30\\sqrt{2} > 35 - 45 = -10 < 0$.
Vậy trường hợp $a = \\sqrt{2}$ không thỏa mãn.
Thay $a = -\\sqrt{2}$ và $m = -6\\sqrt{2} - 6$, ta có:
$\\Delta = (3+\\sqrt{2})^2 - 4(-6\\sqrt{2} - 6) = 9 + 6\\sqrt{2} + 2 + 24\\sqrt{2} + 24 = 35 + 30\\sqrt{2} > 0$.
Vậy $a = -\\sqrt{2}$, $m = -6\\sqrt{2} - 6$.
Từ $n = -abc$ và $bc = m$, ta có $n = -am = -(-\\sqrt{2})(-6\\sqrt{2} - 6) = -\\sqrt{2}(-6\\sqrt{2} - 6) = 6\\cdot 2 + 6\\sqrt{2} = 12 + 6\\sqrt{2}$.
Vậy $m = -6\\sqrt{2} - 6$ và $n = 12 + 6\\sqrt{2}$.
}
\\end{ex}`;

  // Xử lý khi người dùng chọn mẫu
  const handleSelectSample = (sample: string) => {
    onSelectSample(sample);
  };

  // Xử lý khi người dùng sao chép mẫu
  const handleCopy = (sample: string, id: string) => {
    navigator.clipboard.writeText(sample);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <Tabs defaultValue="multiple-choice">
        <TabsList className="w-full">
          <TabsTrigger value="multiple-choice">Trắc nghiệm</TabsTrigger>
          <TabsTrigger value="true-false">Đúng/Sai</TabsTrigger>
          <TabsTrigger value="short-answer">Trả lời ngắn</TabsTrigger>
          <TabsTrigger value="essay">Tự luận</TabsTrigger>
        </TabsList>
        {/* Loại câu hỏi trắc nghiệm */}
        <TabsContent value="multiple-choice">
          <Card className="p-4">
            <div className="relative">
              <pre className="font-mono text-sm bg-black text-white p-4 rounded overflow-x-auto whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                {multipleChoiceSample}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(multipleChoiceSample, 'multiple-choice')}
              >
                {copied === 'multiple-choice' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => handleSelectSample(multipleChoiceSample)}
            >
              Sử dụng mẫu này
            </Button>
          </Card>
        </TabsContent>
        {/* Loại câu hỏi true/false */}
        <TabsContent value="true-false">
          <Card className="p-4">
            <div className="relative">
              <pre className="font-mono text-sm bg-black text-white p-4 rounded overflow-x-auto whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                {trueFalseSample}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(trueFalseSample, 'true-false')}
              >
                {copied === 'true-false' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => handleSelectSample(trueFalseSample)}
            >
              Sử dụng mẫu này
            </Button>
          </Card>
        </TabsContent>
        {/* Loại câu hỏi trả lời ngắn */}
        <TabsContent value="short-answer">
          <Card className="p-4">
            <div className="relative">
              <pre className="font-mono text-sm bg-black text-white p-4 rounded overflow-x-auto whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                {shortAnswerSample}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(shortAnswerSample, 'short-answer')}
              >
                {copied === 'short-answer' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => handleSelectSample(shortAnswerSample)}
            >
              Sử dụng mẫu này
            </Button>
          </Card>
        </TabsContent>
        {/* Loại câu hỏi tự luận */}
        <TabsContent value="essay">
          <Card className="p-4">
            <div className="relative">
              <pre className="font-mono text-sm bg-black text-white p-4 rounded overflow-x-auto whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                {essaySample}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(essaySample, 'essay')}
              >
                {copied === 'essay' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => handleSelectSample(essaySample)}
            >
              Sử dụng mẫu này
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 