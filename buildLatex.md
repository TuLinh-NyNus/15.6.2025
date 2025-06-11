# Phương án tối ưu biên dịch LaTeX trong ứng dụng

## Vấn đề
Hiện tại, ứng dụng đang xử lý nội dung LaTeX bằng các hàm tự viết, dẫn đến:
- Mất nhiều thời gian để fix bug
- Không tối ưu và không hợp lý
- Khó xử lý các môi trường phức tạp như `tikzpicture`

## Giải pháp đề xuất
Sử dụng kết hợp **KaTeX và TikZJax** để render LaTeX trên trình duyệt.

### 1. KaTeX cho công thức toán học
KaTeX là thư viện render LaTeX nhẹ và nhanh hơn MathJax (khoảng 1/10 kích thước).

#### Cài đặt
```bash
pnpm add katex react-katex
```

#### Component KaTeX Renderer
```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KatexRendererProps {
  content: string;
  className?: string;
}

export default function KatexRenderer({ content, className = '' }: KatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      // Trích xuất nội dung từ môi trường ex nếu có
      let processedContent = content;
      const exMatch = content.match(/\\begin\{ex\}.*?\n([\s\S]*?)\\end\{ex\}/);
      if (exMatch && exMatch[1]) {
        processedContent = exMatch[1];
      }
      
      // Loại bỏ các phần không cần thiết
      processedContent = processedContent
        .replace(/\[TL\.\d+\]/g, '')
        .replace(/%.*?\n/g, '\n');
      
      // Render với KaTeX
      katex.render(processedContent, containerRef.current, {
        displayMode: true,
        throwOnError: false,
        errorColor: '#f44336',
        macros: {
          // Định nghĩa các lệnh LaTeX tùy chỉnh
          '\\choice': '\\text{Lựa chọn}',
          '\\choiceTF': '\\text{Lựa chọn Đúng/Sai}',
          '\\True': '\\text{✓}',
          '\\loigiai': '\\text{Lời giải}'
        }
      });
    } catch (error) {
      console.error('Lỗi khi render LaTeX:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="error">Lỗi khi render LaTeX</div>`;
      }
    }
  }, [content]);

  return <div ref={containerRef} className={`katex-renderer ${className}`}></div>;
}
```

### 2. TikZJax cho hình ảnh TikZ
TikZJax cho phép render TikZ trực tiếp trên trình duyệt.

#### Cài đặt
Thêm TikZJax vào layout:

```tsx
// apps/web/src/app/layout.tsx
<head>
  {/* Thêm TikZJax */}
  <script src="https://tikzjax.com/v1/tikzjax.js"></script>
  <link rel="stylesheet" href="https://tikzjax.com/v1/fonts.css" />
</head>
```

#### Component TikZ Renderer
```tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface TikzRendererProps {
  content: string;
}

export default function TikzRenderer({ content }: TikzRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !window.tikzjax) return;

    try {
      // Trích xuất tất cả các môi trường tikzpicture
      const tikzRegex = /\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/g;
      let match;
      let tikzContent = '';

      while ((match = tikzRegex.exec(content)) !== null) {
        tikzContent += `\\begin{tikzpicture}${match[1]}\\end{tikzpicture}\n\n`;
      }

      if (tikzContent) {
        // Tạo script element cho TikZJax
        const script = document.createElement('script');
        script.type = 'text/tikz';
        script.textContent = tikzContent;
        
        // Xóa nội dung cũ
        containerRef.current.innerHTML = '';
        
        // Thêm script vào container
        containerRef.current.appendChild(script);
        
        // Kích hoạt TikZJax
        if (window.tikzjax) {
          window.tikzjax.parse(containerRef.current);
        }
      } else {
        containerRef.current.innerHTML = '<p>Không tìm thấy mã TikZ</p>';
      }
    } catch (error) {
      console.error('Lỗi khi render TikZ:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="error">Lỗi khi render TikZ</div>`;
      }
    }
  }, [content]);

  return <div ref={containerRef} className="tikz-container"></div>;
}
```

### 3. Component kết hợp
Tạo một component kết hợp cả KaTeX và TikZJax:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import KatexRenderer from './KatexRenderer';
import TikzRenderer from './TikzRenderer';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export default function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  const [hasTikz, setHasTikz] = useState(false);
  const [mathContent, setMathContent] = useState(content);
  const [tikzContent, setTikzContent] = useState('');

  useEffect(() => {
    // Kiểm tra xem có môi trường tikzpicture không
    const tikzRegex = /\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/g;
    const hasTikzEnvironment = tikzRegex.test(content);
    setHasTikz(hasTikzEnvironment);

    if (hasTikzEnvironment) {
      // Trích xuất nội dung TikZ
      let tikzMatches = '';
      let match;
      const regex = new RegExp(tikzRegex);
      
      while ((match = regex.exec(content)) !== null) {
        tikzMatches += `\\begin{tikzpicture}${match[1]}\\end{tikzpicture}\n\n`;
      }
      
      setTikzContent(tikzMatches);
      
      // Thay thế môi trường tikzpicture bằng placeholder
      const contentWithoutTikz = content.replace(tikzRegex, '[[TIKZ_PLACEHOLDER]]');
      setMathContent(contentWithoutTikz);
    } else {
      setMathContent(content);
    }
  }, [content]);

  return (
    <div className={`latex-renderer ${className}`}>
      <KatexRenderer content={mathContent} />
      {hasTikz && <TikzRenderer content={tikzContent} />}
    </div>
  );
}
```

## Lợi ích của giải pháp
1. **Hiệu suất cao**: KaTeX render nhanh hơn MathJax khoảng 10 lần
2. **Nhẹ nhàng**: Không cần tự viết logic xử lý phức tạp
3. **Hỗ trợ TikZ**: Có thể render các hình vẽ TikZ trực tiếp
4. **Client-side**: Không cần cài đặt LaTeX trên server
5. **Dễ bảo trì**: Sử dụng các thư viện được cộng đồng hỗ trợ rộng rãi

## Các bước triển khai
1. Cài đặt KaTeX: `pnpm add katex react-katex`
2. Thêm TikZJax vào layout
3. Tạo các component renderer
4. Thay thế logic hiện tại trong `NynusLatexRenderer.tsx` bằng giải pháp mới

## Giải pháp thay thế (nếu cần)
Nếu TikZJax không đáp ứng được yêu cầu, có thể xem xét:

1. **Server-side rendering**: Sử dụng dịch vụ chuyển đổi LaTeX sang SVG/PNG
2. **LaTeX.js**: Hỗ trợ nhiều môi trường LaTeX phức tạp
3. **QuickLaTeX**: Dịch vụ trực tuyến để render LaTeX

## Kết luận
Giải pháp kết hợp KaTeX và TikZJax là phương án tối ưu nhất để biên dịch LaTeX trong ứng dụng, giúp giảm thời gian phát triển, tăng hiệu suất và dễ bảo trì.