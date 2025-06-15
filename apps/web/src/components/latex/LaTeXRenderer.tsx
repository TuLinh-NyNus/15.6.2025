'use client';

import React, { useEffect, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
// Không cần import QuestionType vì chúng ta luôn hiển thị dạng trắc nghiệm
import './latex-styles.css';
import { extractFromLatex } from '@/lib/utils/latex-parser';

// Component con để xử lý hiệu ứng hover cho đáp án
interface AnswerBoxProps {
  answerClass: string;
  iconStyle: React.CSSProperties;
  label: string;
  content: string;
  renderMathWithKaTeX: (text: string) => string;
}

function AnswerBox({
  answerClass,
  iconStyle,
  label,
  content,
  renderMathWithKaTeX
}: AnswerBoxProps) {
  // Sử dụng CSS classes thay vì inline styles để tận dụng các hiệu ứng hover
  return (
    <div className={`answer-box ${answerClass}`}>
      <div className="answer-icon" style={iconStyle}>{label}</div>
      <div
        className="answer-content"
        dangerouslySetInnerHTML={{ __html: renderMathWithKaTeX(content) }}
      />
    </div>
  );
}

interface LaTeXRendererProps {
  content: string;
  className?: string;
  showSolution?: boolean;
}

export default function LaTeXRenderer({
  content,
  className = '',
  showSolution = true
}: LaTeXRendererProps) {
  // Không cần theo dõi loại câu hỏi vì chúng ta luôn hiển thị đáp án dạng trắc nghiệm
  const [showSolutionState, setShowSolutionState] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Trích xuất dữ liệu từ nội dung LaTeX
  const extractData = () => {
    try {
      // Kiểm tra xem nội dung có phải là LaTeX hợp lệ không
      if (!content.includes('\\begin{ex}') || !content.includes('\\end{ex}')) {
        // Nếu không phải LaTeX hợp lệ, tạo một đối tượng dữ liệu đơn giản
        const simpleData = {
          content: content,
          type: 'essay',
          answers: [],
          solution: null
        };
        setExtractedData(simpleData);
        // Không cần đặt loại câu hỏi
        console.log('Hiển thị nội dung đơn giản không phải LaTeX:', simpleData);
        return;
      }

      // Trích xuất nội dung câu hỏi từ môi trường ex
      const questionMatch = content.match(/\\begin\{ex\}([\s\S]*?)\\end\{ex\}/);
      if (!questionMatch) {
        throw new Error('Không tìm thấy nội dung câu hỏi trong môi trường ex');
      }

      const questionContent = questionMatch[1];

      // Trích xuất phần nội dung câu hỏi (trước phần đáp án)
      let questionText = '';
      if (questionContent.includes('\\choice')) {
        questionText = questionContent.split('\\choice')[0].trim();
      } else if (questionContent.includes('\\choiceTF')) {
        questionText = questionContent.split('\\choiceTF')[0].trim();
      } else {
        // Nếu không có phần đáp án, toàn bộ nội dung là câu hỏi
        questionText = questionContent.trim();
      }

      // Trích xuất các đáp án
      let answers: any[] = [];
      let correctAnswerIndices: number[] = [];
      let questionType = 'essay';

      // Kiểm tra loại câu hỏi
      if (questionContent.includes('\\choice')) {
        questionType = 'multiple-choice';

        // Trích xuất các đáp án từ phần sau \choice
        const choiceContent = questionContent.split('\\choice')[1];
        const answerLines = choiceContent.split('\n').filter(line => line.trim() !== '');

        answers = answerLines.map((line, index) => {
          const isCorrect = line.includes('\\True');
          if (isCorrect) {
            correctAnswerIndices.push(index);
          }

          // Loại bỏ \True khỏi nội dung đáp án
          let answerContent = line.replace('\\True', '').trim();

          // Loại bỏ dấu ngoặc nhọn ở đầu và cuối nếu có
          if (answerContent.startsWith('{') && answerContent.endsWith('}')) {
            answerContent = answerContent.substring(1, answerContent.length - 1).trim();
          }

          return {
            id: `answer-${index}`,
            content: answerContent,
            isCorrect: isCorrect
          };
        });
      } else if (questionContent.includes('\\choiceTF')) {
        questionType = 'true-false';

        // Trích xuất các đáp án từ phần sau \choiceTF
        const choiceContent = questionContent.split('\\choiceTF')[1];
        const answerLines = choiceContent.split('\n').filter(line => line.trim() !== '');

        answers = answerLines.map((line, index) => {
          const isCorrect = line.includes('\\True');
          if (isCorrect) {
            correctAnswerIndices.push(index);
          }

          // Loại bỏ \True khỏi nội dung đáp án
          let answerContent = line.replace('\\True', '').trim();

          // Loại bỏ dấu ngoặc nhọn ở đầu và cuối nếu có
          if (answerContent.startsWith('{') && answerContent.endsWith('}')) {
            answerContent = answerContent.substring(1, answerContent.length - 1).trim();
          }

          return {
            id: `answer-${index}`,
            content: answerContent,
            isCorrect: isCorrect
          };
        });
      }

      // Hàm trích xuất nội dung trong cặp dấu ngoặc cân bằng
      const extractBalancedBraces = (text: string, startPos: number): string => {
        let pos = startPos;

        // Bỏ qua khoảng trắng
        while (pos < text.length && /\s/.test(text[pos])) {
          pos++;
        }

        // Kiểm tra xem có phải dấu { không
        if (pos >= text.length || text[pos] !== '{') {
          throw new Error(`Không tìm thấy dấu '{' tại vị trí ${pos}`);
        }

        const contentStart = pos + 1; // Bắt đầu sau dấu {
        let balance = 1;
        pos++;

        let inComment = false;
        let escaped = false;

        // Tìm dấu } tương ứng bằng cách đếm dấu ngoặc
        while (pos < text.length && balance > 0) {
          const char = text[pos];

          // Xử lý comment LaTeX
          if (char === '%' && !escaped) {
            inComment = true;
          } else if (char === '\n' && inComment) {
            inComment = false;
          }

          // Bỏ qua xử lý khi trong comment
          if (!inComment) {
            if (char === '\\' && !escaped) {
              escaped = true;
            } else {
              if (!escaped) {
                if (char === '{') {
                  balance++;
                } else if (char === '}') {
                  balance--;
                }
              }
              escaped = false;
            }
          }

          pos++;
        }

        if (balance !== 0) {
          throw new Error("Dấu ngoặc không cân bằng");
        }

        // Trả về nội dung giữa dấu { và } (không bao gồm dấu ngoặc)
        return text.substring(contentStart, pos - 1).trim();
      };

      // Trích xuất lời giải
      let solution = null;

      // Tìm vị trí bắt đầu của lệnh \loigiai
      const loigiaiMatch = content.match(/\\loigiai\s*\{/);
      if (loigiaiMatch && loigiaiMatch.index !== undefined) {
        try {
          // Vị trí của dấu { sau \loigiai
          const startPos = loigiaiMatch.index + loigiaiMatch[0].length - 1;

          // Trích xuất nội dung trong cặp dấu ngoặc cân bằng
          solution = extractBalancedBraces(content, startPos);
        } catch (error) {
          console.error('Lỗi khi trích xuất lời giải với phương pháp cân bằng dấu ngoặc:', error);

          // Fallback: Sử dụng regex đơn giản nếu phương pháp cân bằng thất bại
          const solutionMatch = content.match(/\\loigiai\s*\{([\s\S]*?)\}/);
          if (solutionMatch) {
            solution = solutionMatch[1].trim();
            console.warn('Đã sử dụng regex đơn giản để trích xuất lời giải, có thể không chính xác với dấu ngoặc lồng nhau');
          }
        }
      }

      // Tạo đối tượng dữ liệu
      const extractedData = {
        content: questionText,
        type: questionType,
        answers: answers,
        correctAnswer: correctAnswerIndices.map(index => `answer-${index}`),
        solution: solution
      };

      setExtractedData(extractedData);
      console.log('Dữ liệu trích xuất từ LaTeX (đã xử lý):', extractedData);

      // Không cần xác định loại câu hỏi vì chúng ta luôn hiển thị dạng trắc nghiệm
    } catch (err) {
      console.error('Lỗi khi trích xuất dữ liệu:', err);

      // Thử sử dụng extractFromLatex nếu phương pháp trực tiếp thất bại
      try {
        const data = extractFromLatex(content);

        if (data) {
          // Xử lý dữ liệu trích xuất
          const processedData = {
            ...data,
            // Đảm bảo answers là mảng và có định dạng đúng
            answers: Array.isArray(data.answers) ? data.answers.map((answer: any, index: number) => {
              // Nếu answer là string, chuyển đổi thành object
              if (typeof answer === 'string') {
                // Loại bỏ dấu ngoặc nhọn ở đầu và cuối nếu có
                let cleanAnswer = answer.trim();
                if (cleanAnswer.startsWith('{') && cleanAnswer.endsWith('}')) {
                  cleanAnswer = cleanAnswer.substring(1, cleanAnswer.length - 1).trim();
                }

                return {
                  id: `answer-${index}`,
                  content: cleanAnswer,
                  isCorrect: Array.isArray(data.correctAnswer)
                    ? data.correctAnswer.includes(`answer-${index}`)
                    : data.correctAnswer === `answer-${index}`
                };
              }
              // Nếu answer là object, đảm bảo nó có id và content
              let content = answer.content || answer.text || '';

              // Loại bỏ dấu ngoặc nhọn ở đầu và cuối nếu có
              if (content.startsWith('{') && content.endsWith('}')) {
                content = content.substring(1, content.length - 1).trim();
              }

              return {
                id: answer.id || `answer-${index}`,
                content: content,
                isCorrect: answer.isCorrect || false
              };
            }) : [],
            // Đảm bảo correctAnswer luôn là mảng
            correctAnswer: Array.isArray(data.correctAnswer)
              ? data.correctAnswer
              : data.correctAnswer ? [data.correctAnswer] : []
          };

          setExtractedData(processedData);
          console.log('Dữ liệu trích xuất từ extractFromLatex:', processedData);

          // Không cần xác định loại câu hỏi vì chúng ta luôn hiển thị dạng trắc nghiệm

          return;
        }
      } catch (extractError) {
        console.error('Lỗi khi sử dụng extractFromLatex:', extractError);
      }

      // Tạo một đối tượng dữ liệu đơn giản khi gặp lỗi
      const fallbackData = {
        content: content,
        type: 'essay',
        answers: [],
        solution: null
      };
      setExtractedData(fallbackData);
      // Không cần đặt loại câu hỏi
      console.log('Sử dụng dữ liệu dự phòng khi gặp lỗi:', fallbackData);
    }
  };

  // Hàm xử lý nội dung đáp án để loại bỏ dấu ngoặc nhọn ở đầu và cuối
  const processAnswerContent = (content: string): string => {
    if (!content) return '';

    // Loại bỏ dấu ngoặc nhọn ở đầu và cuối nếu có
    let processedContent = content.trim();
    if (processedContent.startsWith('{') && processedContent.endsWith('}')) {
      processedContent = processedContent.substring(1, processedContent.length - 1).trim();
    }

    return processedContent;
  };

  // Render công thức toán học bằng KaTeX
  const renderMathWithKaTeX = (text: string) => {
    if (!text) return '';

    // Định nghĩa các macro cho KaTeX
    const katexMacros = {
      // Các vector và mũi tên
      '\\vec': '\\overrightarrow{#1}',
      '\\vect': '\\overrightarrow{#1}',
      // Không định nghĩa lại \overrightarrow để tránh vòng lặp vô hạn

      // Các phân số
      '\\dfrac': '{\\displaystyle\\frac{#1}{#2}}', // Sử dụng displaystyle để phân số lớn hơn

      // Các dấu ngoặc
      '\\leftx': '\\left',
      '\\rightx': '\\right',

      // Các ký hiệu logic
      '\\iff': '\\Leftrightarrow',
      '\\implies': '\\Rightarrow',
      '\\impliedby': '\\Leftarrow',

      // Các ký hiệu đặc biệt
      '\\True': '\\text{✓}',
      '\\choice': '\\text{Lựa chọn}',
      '\\choiceTF': '\\text{Lựa chọn Đúng/Sai}',
      '\\loigiai': '\\text{Lời giải}',

      // Các môi trường
      '\\heva': '\\left\\{\\begin{aligned}#1\\end{aligned}\\right.',
      '\\hoac': '\\left[\\begin{array}{l}#1\\end{array}\\right.',

      // Định nghĩa trực tiếp cho cases để đảm bảo hiển thị đúng
      '\\cases': '\\begin{cases}#1\\end{cases}',

      // Không định nghĩa \\ để tránh vòng lặp vô hạn với môi trường aligned
      // '\\\\': '\\newline ', // Định nghĩa \\ là xuống dòng

      // Các ký hiệu toán học thường dùng
      '\\R': '\\mathbb{R}',
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\C': '\\mathbb{C}',

      // Các toán tử
      '\\norm': '\\left\\lVert#1\\right\\rVert',
      '\\abs': '\\left|#1\\right|',
      '\\set': '\\left\\{#1\\right\\}',
      '\\tuple': '\\left(#1\\right)',
      '\\degree': '^{\\circ}',

      // Các ký hiệu hình học
      '\\triangle': '\\triangle',
      '\\angle': '\\angle',
      '\\parallel': '\\parallel',
      '\\perp': '\\perp',
      '\\overline': '\\overline{#1}'
    };

    // Xử lý văn bản trước khi render công thức
    // Chuyển đổi \\ thành <br> khi nằm ngoài công thức toán học và môi trường LaTeX
    let processedText = text.replace(/\\{2}(?!(\$|\\begin))/g, '<br>');

    // Loại bỏ các lệnh LaTeX không liên quan đến nội dung câu hỏi
    processedText = processedText
      .replace(/\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g, '$1') // Loại bỏ môi trường ex
      .replace(/%\s*\[\s*Nguồn:?\s*([^\]]*)\s*\]/gi, '') // Loại bỏ thông tin nguồn
      .replace(/\\choice\s*\n/g, '') // Loại bỏ lệnh \choice
      .replace(/\\choiceTF\s*\n/g, '') // Loại bỏ lệnh \choiceTF
      .replace(/\\True\s*/g, '') // Loại bỏ lệnh \True
      .replace(/\\loigiai\s*\{[\s\S]*?\}/g, '') // Loại bỏ phần lời giải
      // Loại bỏ questionID trong nội dung (dạng [2P6N1-2] hoặc [TL.242428])
      .replace(/%?\s*\[\s*([0-9][A-Z0-9]{3,5}(?:-[A-Z0-9])?)\s*\]\s*%?/g, '')
      // Loại bỏ subcount trong nội dung (dạng [TL.242428] hoặc [SC.123456])
      .replace(/%?\s*\[\s*([A-Z]{2,4}\.[0-9]{1,6})\s*\]\s*%?/g, '')
      // Loại bỏ định dạng đặc biệt như %[2P6N1-2] [TL.242428]
      .replace(/%\s*\[\s*([^\]]+)\s*\]\s*\[\s*([^\]]+)\s*\]/g, '')

    // Hàm helper để render công thức với KaTeX
    const renderFormula = (formula: string, isDisplayMode = false) => {
      try {
        // Tiền xử lý công thức
        let processedFormula = formula
          .replace(/\\leftx/g, '\\left')
          .replace(/\\rightx/g, '\\right')
          // Xử lý các ký tự đặc biệt
          .replace(/< *br *>/g, '\\\\') // Thay thế <br> bằng \\ trong công thức
          .replace(/\\iff/g, '\\Leftrightarrow') // Thay thế \iff bằng \Leftrightarrow nếu cần
          .replace(/\\implies/g, '\\Rightarrow') // Thay thế \implies bằng \Rightarrow nếu cần
          // Xử lý các ký tự < và > khi không phải là toán tử
          .replace(/< *([a-zA-Z][a-zA-Z0-9]*) *>/g, '\\text{<$1>}') // Thay thế <br> thành \text{<br>}
          // Đảm bảo các dấu < và > được hiển thị đúng khi là toán tử
          .replace(/ < /g, ' \\lt ') // Thay thế < bằng \lt khi là toán tử
          .replace(/ > /g, ' \\gt ') // Thay thế > bằng \gt khi là toán tử
          // Xử lý đặc biệt cho dấu chấm phẩy trong vector
          .replace(/\\overrightarrow\{([^}]+)\}\s*=\s*\(\s*([^;,]+)\s*;\s*([^;,]+)\s*;\s*([^;,]+)\s*\)/g,
                   '\\overrightarrow{$1} = ($2\\text{;}$3\\text{;}$4)')
          .replace(/\\vec\{([^}]+)\}\s*=\s*\(\s*([^;,]+)\s*;\s*([^;,]+)\s*;\s*([^;,]+)\s*\)/g,
                   '\\vec{$1} = ($2\\text{;}$3\\text{;}$4)')
          // Xử lý đặc biệt cho môi trường \hoac với 2 dòng
          .replace(/\\hoac\{([^}]*?)&([^}]*?)\\\\([^}]*?)&([^}]*?)\}/g,
                   '\\left[\\begin{array}{l}$2\\\\$4\\end{array}\\right.')
          // Xử lý đặc biệt cho môi trường \hoac với nhiều dòng
          .replace(/\\hoac\{((?:[^}]*?&[^}]*?\\\\)+[^}]*?&[^}]*?)\}/g,
                   (_match, content: string) => {
                     // Tách các dòng và loại bỏ & ở đầu mỗi dòng
                     const lines = content.split('\\\\').map((line: string) => line.replace(/^\s*&\s*/, ''));
                     // Tạo nội dung mới cho array
                     const newContent = lines.join('\\\\');
                     return `\\left[\\begin{array}{l}${newContent}\\end{array}\\right.`;
                   })
          // Xử lý đặc biệt cho môi trường \hoac đơn giản
          .replace(/\\hoac\{([^}]+)\}/g,
                   (_match, content: string) => {
                     // Nếu nội dung có dấu & và \\, xử lý như cases
                     if (content.includes('&') && content.includes('\\\\')) {
                       // Tách các dòng và loại bỏ & ở đầu mỗi dòng
                       const lines = content.split('\\\\').map((line: string) => line.replace(/^\s*&\s*/, ''));
                       // Tạo nội dung mới cho array
                       const newContent = lines.join('\\\\');
                       return `\\left[\\begin{array}{l}${newContent}\\end{array}\\right.`;
                     }
                     // Nếu không, sử dụng định nghĩa mặc định
                     return `\\left[\\begin{array}{l}${content}\\end{array}\\right.`;
                   })

        // Kiểm tra xem công thức có phức tạp không
        const isComplexFormula =
          processedFormula.includes('\\dfrac') ||
          processedFormula.includes('\\frac') ||
          processedFormula.includes('\\sqrt') ||
          processedFormula.includes('\\left[') ||
          processedFormula.includes('\\right]') ||
          processedFormula.length > 50; // Công thức dài thường phức tạp

        // Render công thức bằng KaTeX
        return katex.renderToString(processedFormula, {
          throwOnError: false,
          displayMode: isDisplayMode || isComplexFormula, // Sử dụng displayMode cho công thức phức tạp
          output: 'html',
          macros: katexMacros,
          strict: false,
          trust: true, // Cho phép các lệnh nâng cao
          minRuleThickness: 0.08, // Tăng độ dày của đường kẻ phân số
          fleqn: false, // Căn giữa công thức
          leqno: false, // Không đánh số công thức
          errorColor: '#f44336', // Màu đỏ cho lỗi
          maxSize: 10, // Tăng kích thước tối đa cho các phần tử
          maxExpand: 5000 // Tăng giới hạn mở rộng macro để xử lý các công thức phức tạp như aligned
        });
      } catch (error) {
        console.error('Lỗi khi render công thức toán học:', error);
        console.error('Công thức gây lỗi:', formula);
        return `<span class="text-red-500">[Lỗi công thức: ${error instanceof Error ? error.message : 'Không xác định'}]</span>`;
      }
    };

    // Xử lý các môi trường LaTeX \begin{...}...\end{...}
    // Chỉ trích xuất nội dung của môi trường ex, để KaTeX xử lý trực tiếp các môi trường khác
    processedText = processedText.replace(/\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g, '$1');

    // Xử lý các công thức toán học dạng display mode trong \[...\]
    processedText = processedText.replace(/\\\[([\s\S]*?)\\\]/g, (_match, formula) => {
      return renderFormula(formula, true); // Sử dụng displayMode=true cho công thức dạng display mode
    });
    // Xử lý các công thức toán học trong dấu $...$
    return processedText.replace(/\$([\s\S]*?)\$/g, (_match, formula) => {
      return renderFormula(formula);
    });
  };

  // Render câu hỏi theo mẫu giao diện
  const renderQuestion = () => {
    if (!extractedData) return null;

    // Tạo các đáp án mẫu nếu không có đáp án hoặc số lượng đáp án không đủ
    let answers = [];

    if (extractedData.answers && extractedData.answers.length > 0) {
      answers = extractedData.answers;

      // Nếu số lượng đáp án ít hơn 4, thêm các đáp án mẫu
      if (answers.length < 4) {
        const sampleAnswers = [
          { id: 'answer-0', content: '$(x + 4)^2 + y^2 = \\sqrt{10}$', isCorrect: false },
          { id: 'answer-1', content: '$(x - 4)^2 + y^2 = 10$', isCorrect: true },
          { id: 'answer-2', content: '$(x + 4)^2 + y^2 = 10$', isCorrect: false },
          { id: 'answer-3', content: '$(x - 4)^2 + y^2 = \\sqrt{10}$', isCorrect: false }
        ].map(answer => ({
          ...answer,
          content: processAnswerContent(answer.content)
        }));

        // Thêm các đáp án mẫu còn thiếu
        for (let i = answers.length; i < 4; i++) {
          answers.push(sampleAnswers[i]);
        }
      }
    } else {
      // Nếu không có đáp án, sử dụng đáp án mẫu
      answers = [
        { id: 'answer-0', content: '$(x + 4)^2 + y^2 = \\sqrt{10}$', isCorrect: false },
        { id: 'answer-1', content: '$(x - 4)^2 + y^2 = 10$', isCorrect: true },
        { id: 'answer-2', content: '$(x + 4)^2 + y^2 = 10$', isCorrect: false },
        { id: 'answer-3', content: '$(x - 4)^2 + y^2 = \\sqrt{10}$', isCorrect: false }
      ].map(answer => ({
        ...answer,
        content: processAnswerContent(answer.content)
      }));
    }

    // Lời giải mẫu nếu không có lời giải
    const sampleSolution = 'Điểm $I$ thuộc trục hoành $Ox$ nên $I(a; 0)$.\nTa có $R = IA = \\sqrt{(1 - a)^2 + (1 - 0)^2} = \\sqrt{10}$\n.\nVậy $(C)$ : $(x - 4)^2 + y^2 = 10$.';

    return (
      <div className="question-container">
        {/* Phần câu hỏi */}
        <div className="question-box">
          <div className="question-icon">?</div>
          <div
            className="question-content"
            dangerouslySetInnerHTML={{ __html: renderMathWithKaTeX(extractedData.content) }}
          />
        </div>

        {/* Phần đáp án */}
        <div className="answers-container">
          {answers.slice(0, 4).map((answer: any, index: number) => {
            const label = String.fromCharCode(65 + index); // A, B, C, D (chữ in hoa)
            const answerClass = `answer-${label.toLowerCase()}`; // Vẫn giữ class là a, b, c, d

            // Kiểm tra xem đáp án có phải là đáp án đúng không
            let isCorrect = false;
            if (extractedData.correctAnswer) {
              if (Array.isArray(extractedData.correctAnswer)) {
                // Nếu correctAnswer là mảng, kiểm tra xem answer.id có trong mảng không
                isCorrect = extractedData.correctAnswer.includes(answer.id);
              } else if (typeof extractedData.correctAnswer === 'string') {
                // Nếu correctAnswer là string, so sánh trực tiếp với answer.id
                isCorrect = extractedData.correctAnswer === answer.id;
              } else if (answer.isCorrect) {
                // Nếu answer có thuộc tính isCorrect, sử dụng nó
                isCorrect = answer.isCorrect;
              }
            } else if (answer.isCorrect) {
              // Nếu không có correctAnswer nhưng answer có thuộc tính isCorrect
              isCorrect = answer.isCorrect;
            }

            // Tạo style inline để đảm bảo màu sắc đồng nhất - tất cả đều dùng màu tím
            const iconStyle = { backgroundColor: '#9333ea' }; // Màu tím cho tất cả các đáp án

            return (
              <AnswerBox
                key={answer.id || index}
                answerClass={`${answerClass} ${isCorrect ? 'correct' : ''}`}
                iconStyle={iconStyle}
                label={label}
                content={processAnswerContent(answer.content || answer.text || '')}
                renderMathWithKaTeX={renderMathWithKaTeX}
              />
            );
          })}
        </div>

        {/* Phần lời giải */}
        <div className="solution-container">
          <div className="solution-header">
            <h3>Lời giải:</h3>
            <button
              onClick={() => setShowSolutionState(!showSolutionState)}
            >
              {showSolutionState ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          {showSolutionState && (
            <div
              className="solution-content"
              dangerouslySetInnerHTML={{ __html: renderMathWithKaTeX(extractedData.solution || sampleSolution) }}
            />
          )}
        </div>
      </div>
    );
  };

  // Trích xuất dữ liệu khi component được mount hoặc nội dung thay đổi
  useEffect(() => {
    extractData();
  }, [content]);

  // Hiển thị lời giải nếu showSolution = true
  useEffect(() => {
    setShowSolutionState(showSolution);
  }, [showSolution]);

  // Hiển thị trạng thái loading
  if (!extractedData) {
    return (
      <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
        <p className="text-yellow-400 font-medium mb-2">Đang tải nội dung...</p>
      </div>
    );
  }

  return (
    <div className={`latex-renderer ${className}`}>
      {renderQuestion()}
    </div>
  );
}
