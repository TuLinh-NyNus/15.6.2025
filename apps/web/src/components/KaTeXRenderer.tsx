'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export function KaTeXRenderer({ content, className = '' }: KaTeXRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      try {
        // Xử lý nội dung LaTeX đặc biệt từ câu hỏi
        let processedContent = content;

        // Bước 1: Trích xuất phần nội dung chính từ môi trường ex
        const exMatch = content.match(/\\begin\{ex\}.*?\n([\s\S]*?)\\end\{ex\}/);
        if (exMatch && exMatch[1]) {
          processedContent = exMatch[1];
        }

        console.log('Nội dung LaTeX gốc:', content.substring(0, 100) + '...');
        console.log('Nội dung sau khi trích xuất:', processedContent.substring(0, 100) + '...');

        // Bước 2: Loại bỏ các phần không cần thiết
        processedContent = processedContent
          .replace(/\[TL\.\d+\]/g, '') // Loại bỏ [TL.xxxxx]
          .replace(/%.*?\n/g, '\n') // Loại bỏ các comment
          .replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, '<div class="center-content">$1</div>') // Xử lý môi trường center
          .replace(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/g, '<div class="tikz-image">[Hình ảnh TikZ]</div>'); // Thay thế tikzpicture

        // Bước 3: Xử lý các lệnh đặc biệt
        // Xử lý các lệnh LaTeX phổ biến
        processedContent = processedContent
          .replace(/\\textbf\{([^{}]*)\}/g, '<strong>$1</strong>') // \textbf
          .replace(/\\textit\{([^{}]*)\}/g, '<em>$1</em>') // \textit
          .replace(/\\underline\{([^{}]*)\}/g, '<u>$1</u>') // \underline
          .replace(/\\hspace\{[^{}]*\}/g, '&nbsp;&nbsp;') // \hspace
          .replace(/\\vspace\{[^{}]*\}/g, '<div style="margin: 1em 0;"></div>') // \vspace
          .replace(/\\newline/g, '<br/>') // \newline
          .replace(/\\\\/g, '<br/>'); // \\

        // Bước 4: Xử lý các môi trường đặc biệt
        // Xử lý môi trường choice và choiceTF
        if (processedContent.includes('\\choiceTF') || processedContent.includes('\\choice')) {
          // Tách phần nội dung và phần đáp án
          const parts = processedContent.split(/\\(choiceTF|choice)/);
          if (parts.length > 1) {
            const mainContent = parts[0];
            let choicesContent = parts[1];

            // Nếu có phần loigiai, tách ra
            let solutionContent = '';
            if (choicesContent.includes('\\loigiai{')) {
              const solutionParts = choicesContent.split('\\loigiai{');
              choicesContent = solutionParts[0];
              if (solutionParts.length > 1) {
                // Tìm dấu } cuối cùng của loigiai
                let braceCount = 1;
                let endIndex = 0;
                for (let i = 0; i < solutionParts[1].length; i++) {
                  if (solutionParts[1][i] === '{') braceCount++;
                  if (solutionParts[1][i] === '}') braceCount--;
                  if (braceCount === 0) {
                    endIndex = i;
                    break;
                  }
                }
                solutionContent = solutionParts[1].substring(0, endIndex);
              }
            }

            // Xử lý các lựa chọn
            const choices = choicesContent.match(/\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g) || [];
            let choicesHtml = '<div class="choices">';

            choices.forEach((choice, index) => {
              // Kiểm tra xem lựa chọn có phải là đáp án đúng không
              const isCorrect = choice.includes('\\True');
              // Loại bỏ lệnh \True
              const choiceContent = choice
                .replace(/^\{|\}$/g, '') // Loại bỏ dấu { } bao quanh
                .replace(/\\True\s*/g, ''); // Loại bỏ \True

              // Sử dụng KaTeX để render nội dung toán học trong đáp án
              let renderedContent = choiceContent;
              try {
                // Tìm và render các công thức toán học trong đáp án
                renderedContent = choiceContent.replace(/\$(.*?)\$/g, (match, formula) => {
                  try {
                    return katex.renderToString(formula, {
                      throwOnError: false,
                      output: 'html'
                    });
                  } catch (err) {
                    console.error('Lỗi khi render công thức trong đáp án:', err);
                    return match; // Giữ nguyên nếu có lỗi
                  }
                });
              } catch (err) {
                console.error('Lỗi khi xử lý đáp án:', err);
              }

              const label = String.fromCharCode(65 + index); // A, B, C, D...
              choicesHtml += `<div class="choice-item ${isCorrect ? 'correct' : ''}">
                <span class="choice-label">${label}</span>
                ${isCorrect ? '<span class="correct-mark">✓</span> ' : ''}
                <span class="choice-content">${renderedContent}</span>
              </div>`;
            });

            choicesHtml += '</div>';

            // Xử lý phần lời giải với KaTeX
            let solutionHtml = '';
            if (solutionContent) {
              // Xử lý các công thức toán học trong lời giải
              let renderedSolution = solutionContent;
              try {
                renderedSolution = solutionContent.replace(/\$(.*?)\$/g, (match, formula) => {
                  try {
                    return katex.renderToString(formula, {
                      throwOnError: false,
                      output: 'html'
                    });
                  } catch (err) {
                    console.error('Lỗi khi render công thức trong lời giải:', err);
                    return match; // Giữ nguyên nếu có lỗi
                  }
                });
              } catch (err) {
                console.error('Lỗi khi xử lý lời giải:', err);
              }

              solutionHtml = `<div class="solution">
                <h3>Lời giải:</h3>
                <div class="solution-content">${renderedSolution}</div>
              </div>`;
            }

            // Kết hợp tất cả các phần
            processedContent = `${mainContent}${choicesHtml}${solutionHtml}`;
          }
        }

        // Bước 5: Render các công thức toán học còn lại với KaTeX
        processedContent = processedContent.replace(/\$(.*?)\$/g, (match, formula) => {
          try {
            return katex.renderToString(formula, {
              throwOnError: false,
              output: 'html'
            });
          } catch (err) {
            console.error('Lỗi khi render công thức:', err);
            return match; // Giữ nguyên nếu có lỗi
          }
        });

        // Set the processed content
        container.innerHTML = `<div class="katex-preview">${processedContent}</div>`;
      } catch (error) {
        console.error('Error processing or rendering LaTeX:', error);

        // Fallback if processing fails
        container.innerHTML = `
          <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
            <p class="text-red-500 font-medium mb-2">Lỗi khi render nội dung LaTeX</p>
            <p class="text-slate-400 text-sm">Nội dung LaTeX quá phức tạp hoặc chứa cú pháp không được hỗ trợ. Vui lòng xem nội dung gốc.</p>
          </div>
          <div class="mt-4">
            <button class="px-3 py-1 bg-slate-700 text-white rounded-md text-sm" onclick="document.querySelector('[data-viewmode-toggle]').click()">
              Xem nội dung gốc
            </button>
          </div>
        `;
      }
    }
  }, [content]);

  return (
    <div ref={containerRef} className={`katex-container ${className}`}>
      <div className="loading-placeholder">Đang tải nội dung...</div>
    </div>
  );
}
