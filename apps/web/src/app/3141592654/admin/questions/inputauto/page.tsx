'use client';

import { ArrowLeft, FileInput, Save, Loader2, Table, BookOpen, ChevronDown, ChevronUp, Eye, EyeOff, FileUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import logger from '@/lib/utils/logger';
import { extractFromLatex } from '@/lib/utils/latex-parser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Định nghĩa kiểu dữ liệu cho câu hỏi đã tách với đầy đủ 16 trường
interface ParsedQuestion {
  // 1. RawContent: Nội dung gốc LaTex của câu hỏi
  raw_content: string;

  // 2. QuestionID: Mục đích dùng để phân loại câu hỏi
  questionID: {
    fullId: string;
    grade: { value: string; description: string };
    subject: { value: string; description: string };
    chapter: { value: string; description: string };
    level: { value: string; description: string };
    lesson: { value: string; description: string };
    form: { value: string; description: string };
  };

  // 3. Subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi
  subcount: {
    prefix: string;
    number: string;
    fullId: string;
  };

  // 4. Type: Loại câu hỏi (MC, TF, SA, ES)
  type: string;

  // 5. Source: Nguồn câu hỏi
  source: string;

  // 6. Content: Nội dung câu hỏi đã xử lý
  content: string;

  // 7. Answers: Danh sách đáp án của câu hỏi để chọn
  answers: Array<{
    id?: string | number;
    text?: string;
    content?: string;
    isCorrect: boolean;
  }>;

  // 8. CorrectAnswer: Đáp án đúng
  correctAnswer: string | string[];

  // 9. Solution: Lời giải câu hỏi
  solution: string;

  // 10. Images: Danh sách hình ảnh
  images: {
    questionImage: string | null;
    solutionImage: string | null;
  };

  // 11. Tags: Nhãn phân loại
  tags: string[];

  // 12. UsageCount: Số lần sử dụng
  usageCount: number;

  // 13. Creator: Thông tin người tạo
  creator: {
    id: string;
    name: string;
  };

  // 14. Status: Trạng thái câu hỏi
  status: {
    code: string;
    lastUpdated: string;
  };

  // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
  examRefs: string[];

  // 16. Feedback: Số lần câu hỏi này được feedback
  feedback: {
    averageDifficulty: number;
    clarity: number;
    correctnessRate: number;
    feedbackCount: number;
    comments: string[];
  };

  // Trường bổ sung
  form: string; // Giữ lại để tương thích ngược
  difficulty?: string;

  [key: string]: any;
}

export default function InputAutoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [bulkInput, setBulkInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedDetails, setExpandedDetails] = useState<number[]>([]);
  const [showAllFields, setShowAllFields] = useState(false);

  // State cho phần tải lên file
  const [activeTab, setActiveTab] = useState('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'folder'>('file');

  // Hàm để toggle hiển thị chi tiết của một câu hỏi
  const toggleDetails = (index: number) => {
    setExpandedDetails(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Hàm để toggle hiển thị tất cả các trường
  const toggleAllFields = () => {
    setShowAllFields(prev => !prev);
  };

  // Hàm xử lý khi click vào nút chọn file
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Hàm xử lý khi chọn file hoặc folder
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Lọc chỉ lấy các file .tex
      const texFiles = Array.from(files).filter(file => file.name.endsWith('.tex'));

      if (texFiles.length === 0) {
        setError('Không tìm thấy file LaTeX (.tex) nào');
        return;
      }

      setSelectedFiles(texFiles);
      setFileNames(texFiles.map(file => file.name));

      // Hiển thị thông báo số lượng file đã chọn
      if (texFiles.length === 1) {
        setSuccess(`Đã chọn 1 file: ${texFiles[0].name}`);
      } else {
        setSuccess(`Đã chọn ${texFiles.length} file LaTeX`);
      }
    }
  };

  // Hàm xử lý khi kéo file vào vùng drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Hàm xử lý khi kéo file ra khỏi vùng drop
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Hàm xử lý khi thả file vào vùng drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Lọc chỉ lấy các file .tex
      const texFiles = Array.from(files).filter(file => file.name.endsWith('.tex'));

      if (texFiles.length === 0) {
        setError('Không tìm thấy file LaTeX (.tex) nào');
        return;
      }

      setSelectedFiles(texFiles);
      setFileNames(texFiles.map(file => file.name));

      // Hiển thị thông báo số lượng file đã chọn
      if (texFiles.length === 1) {
        setSuccess(`Đã chọn 1 file: ${texFiles[0].name}`);
      } else {
        setSuccess(`Đã chọn ${texFiles.length} file LaTeX`);
      }
    }
  };

  // Hàm đọc nội dung file LaTeX
  const readLatexFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Vui lòng chọn file LaTeX');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Đọc nội dung tất cả các file
      let allContent = '';
      let processedFiles = 0;
      let totalQuestions = 0;

      for (const file of selectedFiles) {
        try {
          // Đọc nội dung file
          const fileContent = await readFileAsText(file);

          // Đếm số câu hỏi trong file (dựa trên số lượng \begin{ex})
          const questionCount = (fileContent.match(/\\begin\{ex\}/g) || []).length;

          // Thêm vào nội dung tổng hợp
          allContent += fileContent + '\n\n';

          processedFiles++;
          totalQuestions += questionCount;

          // Cập nhật thông báo tiến trình
          setSuccess(`Đang xử lý: ${processedFiles}/${selectedFiles.length} file, tìm thấy ${totalQuestions} câu hỏi`);
        } catch (fileError) {
          logger.error(`Lỗi khi đọc file ${file.name}:`, fileError);
          // Tiếp tục xử lý các file khác
        }
      }

      if (allContent.trim() === '') {
        throw new Error('Không thể đọc nội dung từ bất kỳ file nào');
      }

      // Cập nhật nội dung vào bulkInput để sử dụng logic xử lý hiện có
      setBulkInput(allContent);

      // Tự động tách trường sau khi đọc file
      await handleParseQuestions(allContent);

      setSuccess(`Đã xử lý thành công ${processedFiles} file với tổng cộng ${totalQuestions} câu hỏi`);
    } catch (error) {
      logger.error('Lỗi khi đọc file LaTeX:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đọc file. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Hàm đọc file dưới dạng text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Không thể đọc nội dung file'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
      reader.readAsText(file);
    });
  };

  // Hàm xử lý tách trường
  const handleParseQuestions = async (inputContent?: string) => {
    const content = inputContent || bulkInput;
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Kiểm tra xem đầu vào có phải là LaTeX không
      const isLatexInput = content.includes('\\begin{ex}') && content.includes('\\end{ex}');

      // Tách các câu hỏi dựa trên định dạng đầu vào
      let questionBlocks = [];

      if (isLatexInput) {
        // Nếu là LaTeX, sử dụng regex để tách các khối câu hỏi
        const latexRegex = /\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g;
        let match;
        while ((match = latexRegex.exec(content)) !== null) {
          if (match[0].trim()) {
            questionBlocks.push(match[0].trim());
          }
        }
        console.log('Tách được', questionBlocks.length, 'câu hỏi LaTeX');
      } else {
        // Nếu không phải LaTeX, sử dụng các phương pháp tách thông thường

        // Cách 1: Tách bằng dòng trống kép
        const byDoubleEmptyLine = content.split(/\n\s*\n\s*\n/).filter(block => block.trim());

        // Cách 2: Tách bằng dấu hiệu câu hỏi mới (ví dụ: "Câu 1:", "Câu 2:")
        const questionNumberRegex = /(?=\n\s*Câu\s+\d+[.:]\s*)/i;
        const byQuestionNumber = content.split(questionNumberRegex).filter(block => block.trim());

        // Cách 3: Tách bằng dấu hiệu ID câu hỏi
        const questionIdRegex = /(?=\n\s*ID\s*:\s*[\w-]+\s*)/i;
        const byQuestionId = content.split(questionIdRegex).filter(block => block.trim());

        // Cách 4: Tách bằng dấu hiệu đáp án (A., B., C., D.)
        const answerRegex = /(?=\n\s*A[.)]\s*)/i;
        const byAnswerStart = content.split(answerRegex).filter(block => block.trim());

        // Chọn phương pháp tách tốt nhất (có nhiều khối nhất)
        const methods = [
          { name: 'byDoubleEmptyLine', blocks: byDoubleEmptyLine },
          { name: 'byQuestionNumber', blocks: byQuestionNumber },
          { name: 'byQuestionId', blocks: byQuestionId },
          { name: 'byAnswerStart', blocks: byAnswerStart }
        ];

        // Sắp xếp các phương pháp theo số lượng khối (giảm dần)
        methods.sort((a, b) => b.blocks.length - a.blocks.length);

        // Chọn phương pháp tốt nhất (có nhiều khối nhất)
        const bestMethod = methods[0];
        console.log('Phương pháp tốt nhất:', bestMethod.name, 'với', bestMethod.blocks.length, 'khối');

        // Sử dụng phương pháp tốt nhất
        questionBlocks = bestMethod.blocks;
      }

      // Đảm bảo mỗi khối có định dạng phù hợp
      if (!isLatexInput) {
        // Xử lý cho các khối không phải LaTeX
        questionBlocks = questionBlocks.map((block, index) => {
          // Nếu khối bắt đầu bằng "A.", thêm nội dung câu hỏi mặc định
          if (block.trim().match(/^A[.)]/i)) {
            return `Câu hỏi ${index + 1}\n${block}`;
          }

          // Đảm bảo khối có ID
          if (!block.match(/ID\s*:/i)) {
            return `ID: Question-${index + 1}\n${block}`;
          }

          return block;
        });
      }

      // Đảm bảo có ít nhất một khối
      if (questionBlocks.length === 0 && content.trim()) {
        questionBlocks = [content.trim()];
      }

      // Xử lý từng khối câu hỏi
      const parsedResults: ParsedQuestion[] = await Promise.all(questionBlocks.map(async (block, index) => {
        // Kiểm tra nếu là câu hỏi LaTeX
        const isLatexQuestion = block.includes('\\begin{ex}') && block.includes('\\end{ex}');

        // Nếu là câu hỏi LaTeX, sử dụng extractFromLatex để phân tích
        if (isLatexQuestion) {
          try {
            const extractedQuestion = extractFromLatex(block);

            // Chuyển đổi từ định dạng extractedQuestion sang ParsedQuestion
            return {
              // 1. RawContent
              raw_content: block,

              // 2. QuestionID
              questionID: {
                fullId: extractedQuestion.questionId || `Question-${index + 1}`,
                grade: {
                  value: extractedQuestion.questionIdDetails?.grade || '',
                  description: `Lớp ${extractedQuestion.questionIdDetails?.grade || ''}`
                },
                subject: {
                  value: extractedQuestion.questionIdDetails?.subject || '',
                  description: extractedQuestion.questionIdDetails?.subject || ''
                },
                chapter: {
                  value: extractedQuestion.questionIdDetails?.chapter || '',
                  description: `Chương ${extractedQuestion.questionIdDetails?.chapter || ''}`
                },
                level: {
                  value: extractedQuestion.questionIdDetails?.level || '',
                  description: `Mức ${extractedQuestion.questionIdDetails?.level || ''}`
                },
                lesson: {
                  value: extractedQuestion.questionIdDetails?.lesson || '',
                  description: `Bài ${extractedQuestion.questionIdDetails?.lesson || ''}`
                },
                form: {
                  value: extractedQuestion.questionIdDetails?.type || extractedQuestion.type || 'MC',
                  description: extractedQuestion.type === 'multiple-choice' ? 'Trắc nghiệm' :
                              extractedQuestion.type === 'true-false' ? 'Đúng/Sai' :
                              extractedQuestion.type === 'short-answer' ? 'Tự luận ngắn' :
                              extractedQuestion.type === 'essay' ? 'Tự luận dài' : ''
                }
              },

              // 3. Subcount
              subcount: extractedQuestion.subcount || {
                prefix: 'SC',
                number: `${index + 1}`.padStart(4, '0'),
                fullId: `SC${`${index + 1}`.padStart(4, '0')}`,
              },

              // 4. Type
              type: extractedQuestion.type || 'MC',

              // 5. Source
              source: extractedQuestion.source || '',

              // 6. Content
              content: extractedQuestion.content || '',

              // 7. Answers
              answers: extractedQuestion.answers?.map(answer => ({
                text: answer.content || '',
                isCorrect: answer.isCorrect || false
              })) || [],

              // 8. CorrectAnswer
              correctAnswer: extractedQuestion.correctAnswer || '',

              // 9. Solution
              solution: extractedQuestion.solution || '',

              // 10. Images
              images: {
                questionImage: null,
                solutionImage: null,
              },

              // 11. Tags
              tags: [],

              // 12. UsageCount
              usageCount: 0,

              // 13. Creator
              creator: {
                id: "admin",
                name: "Tú",
              },

              // 14. Status
              status: {
                code: 'draft',
                lastUpdated: new Date().toISOString(),
              },

              // 15. ExamRefs
              examRefs: [],

              // 16. Feedback
              feedback: {
                averageDifficulty: 3,
                clarity: 3,
                correctnessRate: 0,
                feedbackCount: 0,
                comments: [],
              },

              // Trường bổ sung
              form: extractedQuestion.type || 'multiple-choice',
              difficulty: extractedQuestion.questionIdDetails?.level || 'medium',
            };
          } catch (error) {
            logger.error('Lỗi khi phân tích câu hỏi LaTeX:', error);
            // Trả về một đối tượng câu hỏi mặc định với thông báo lỗi
            return {
              raw_content: block,
              content: `[Lỗi phân tích LaTeX: ${error instanceof Error ? error.message : String(error)}]`,
              type: 'MC',
              form: 'multiple-choice',
              questionID: {
                fullId: `Error-${index + 1}`,
                grade: { value: '', description: '' },
                subject: { value: '', description: '' },
                chapter: { value: '', description: '' },
                level: { value: '', description: '' },
                lesson: { value: '', description: '' },
                form: { value: '', description: '' }
              },
              subcount: {
                prefix: 'SC',
                number: `${index + 1}`.padStart(4, '0'),
                fullId: `SC${`${index + 1}`.padStart(4, '0')}`,
              },
              source: '',
              solution: '',
              answers: [],
              correctAnswer: '',
              images: { questionImage: null, solutionImage: null },
              tags: [],
              usageCount: 0,
              creator: { id: "admin", name: "Tú" },
              status: { code: 'error', lastUpdated: new Date().toISOString() },
              examRefs: [],
              feedback: {
                averageDifficulty: 3,
                clarity: 3,
                correctnessRate: 0,
                feedbackCount: 0,
                comments: [],
              }
            };
          }
        }

        // Nếu không phải LaTeX, sử dụng phương pháp phân tích thông thường
        const lines = block.split('\n').filter(line => line.trim());

        // Tìm nội dung câu hỏi
        let content = '';

        // Xử lý đặc biệt cho câu hỏi LaTeX
        if (isLatexQuestion) {
          // Tìm nội dung câu hỏi trong LaTeX
          const mainContentMatch = block.match(/\\begin\{ex\}[\s\S]*?\n([\s\S]*?)\\choice/);
          if (mainContentMatch && mainContentMatch[1]) {
            // Loại bỏ các tag LaTeX và comment
            content = mainContentMatch[1]
              .replace(/\[.*?\]/g, '') // Loại bỏ các tag trong ngoặc vuông
              .replace(/\\.*?\{.*?\}/g, '') // Loại bỏ các lệnh LaTeX
              .replace(/%.*$/gm, '') // Loại bỏ các comment
              .replace(/\$|\{|\}/g, '') // Loại bỏ các ký tự đặc biệt
              .trim();
          }

          // Nếu không tìm thấy nội dung, thử cách khác
          if (!content) {
            // Tìm dòng đầu tiên sau \begin{ex} không phải comment
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes('\\begin{ex}')) {
                // Tìm dòng tiếp theo không phải comment
                for (let j = i + 1; j < lines.length; j++) {
                  if (!lines[j].startsWith('%') && !lines[j].includes('\\choice')) {
                    content = lines[j].replace(/\[.*?\]|\\.*?\{.*?\}|\$|\{|\}/g, '').trim();
                    break;
                  }
                }
                break;
              }
            }
          }
        } else {
          // Xử lý cho các định dạng không phải LaTeX

          // Tìm dòng bắt đầu bằng "Câu X:" hoặc dòng đầu tiên nếu không có
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^Câu\s+\d+[.:]/i)) {
              content = lines[i].replace(/^Câu\s+\d+[.:]/i, '').trim();
              break;
            }
          }

          // Nếu không tìm thấy "Câu X:", tìm dòng đầu tiên trước đáp án A
          if (!content) {
            const aAnswerIndex = lines.findIndex(line => line.match(/^A[.)]/i));
            if (aAnswerIndex > 0) { // Nếu có đáp án A và có dòng trước nó
              // Lấy tất cả các dòng trước đáp án A làm nội dung câu hỏi
              content = lines.slice(0, aAnswerIndex).join('\n').trim();
            }
          }

          // Nếu không tìm thấy "Câu X:" và không có đáp án A, lấy dòng đầu tiên không phải ID, đáp án, giải thích
          if (!content) {
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (!line.match(/^(ID|A\.|B\.|C\.|D\.|Giải|Nguồn|Tags)/i)) {
                content = line;
                break;
              }
            }
          }
        }

        // Nếu vẫn không tìm thấy, lấy dòng đầu tiên
        if (!content && lines.length > 0) {
          content = lines[0];
        }

        // Nếu nội dung quá dài (có thể là nhiều dòng), cắt ngắn lại
        if (content.length > 500) {
          content = content.substring(0, 497) + '...';
        }

        // Tìm các đáp án (hỗ trợ nhiều định dạng)
        const answerPatterns = [
          /^([A-D])[.)](.+)/i,  // A. hoặc A)
          /^([A-D])[\s]+(.+)/i,   // A [space]
          /^(đáp án|đáp|answer)\s+([A-D])\s*[.:](.+)/i  // Đáp án A: hoặc Answer A.
        ];

        const answers = [];
        let correctAnswer = '';

        // Xử lý đặc biệt cho câu hỏi LaTeX
        if (isLatexQuestion) {
          // Tìm các đáp án trong cấu trúc \choice{...}{...}{...}{...}
          const choiceMatch = block.match(/\\choice\s*\{(.*?)\}\s*\{(.*?)\}\s*\{(.*?)\}\s*\{(.*?)\}/s);
          if (choiceMatch) {
            // Tìm đáp án đúng từ \True
            const trueMatch = block.match(/\\True\s*([^}]*)/);
            let correctIndex = -1;

            if (trueMatch) {
              // Tìm đáp án đúng dựa trên nội dung
              const correctText = trueMatch[1].trim();
              for (let i = 1; i <= 4; i++) {
                if (choiceMatch[i].includes(correctText)) {
                  correctIndex = i - 1;
                  break;
                }
              }
            }

            // Nếu không tìm thấy, tìm vị trí của \True
            if (correctIndex === -1) {
              for (let i = 1; i <= 4; i++) {
                if (choiceMatch[i].includes('\\True')) {
                  correctIndex = i - 1;
                  break;
                }
              }
            }

            // Thêm các đáp án vào danh sách
            const options = ['A', 'B', 'C', 'D'];
            for (let i = 1; i <= 4; i++) {
              const text = choiceMatch[i]
                .replace(/\\True/g, '')
                .replace(/\$|\{|\}|\\dfrac|\\frac|\\sqrt|\\ln|\\log/g, '')
                .trim();

              answers.push({
                text: text,
                isCorrect: i - 1 === correctIndex
              });

              if (i - 1 === correctIndex) {
                correctAnswer = options[i - 1];
              }
            }
          }
        } else {
          // Xử lý cho các định dạng không phải LaTeX
          // Tìm đáp án theo các mẫu
          for (const line of lines) {
            let matched = false;

            for (const pattern of answerPatterns) {
              const match = line.match(pattern);
              if (match) {
                // Xác định text (nội dung đáp án)
                let text;

                if (pattern.toString().includes('đáp án|đáp|answer')) {
                  // Nếu là mẫu "Đáp án A:", lấy nội dung từ nhóm 3
                  text = match[3] ? match[3].trim() : '';
                } else {
                  // Nếu là mẫu A. hoặc A), lấy nội dung từ nhóm 2
                  text = match[2] ? match[2].trim() : '';
                }

                const isCorrect = line.includes('*');
                const cleanedText = text.replace('*', '').trim();

                // Tạo đáp án theo định dạng chuẩn
                answers.push({
                  id: String(answers.length + 1),
                  content: cleanedText,
                  isCorrect: isCorrect
                });

                if (isCorrect) {
                  correctAnswer = cleanedText; // Lưu nội dung đáp án đúng thay vì chỉ lưu option
                }

                matched = true;
                break;
              }
            }

            // Nếu dòng này không phải đáp án, tiếp tục vòng lặp
            if (!matched) continue;
          }
        }

        // Nếu không tìm thấy đáp án đúng được đánh dấu bằng dấu *,
        // giả định đáp án đầu tiên là đúng
        if (answers.length > 0 && !correctAnswer) {
          answers[0].isCorrect = true;
          correctAnswer = 'A';
        }

        // Tìm ID câu hỏi (hỗ trợ nhiều định dạng)
        const idPatterns = [
          /ID\s*:\s*(.+)/i,
          /Mã\s*:\s*(.+)/i,
          /QuestionID\s*:\s*(.+)/i,
          /\[TL.(\d+)\]/i  // Mẫu [TL.123456]
        ];

        let fullId = `Question-${index + 1}`;

        // Xử lý đặc biệt cho câu hỏi LaTeX
        if (isLatexQuestion) {
          // Tìm ID trong cấu trúc [TL.123456]
          const tlMatch = block.match(/\[TL.(\d+)\]/i);
          if (tlMatch && tlMatch[1]) {
            fullId = `TL-${tlMatch[1]}`;
          } else {
            // Tìm ID trong comment đầu tiên
            const commentMatch = block.match(/%Từ ngân hàng\. Câu (\d+)/i);
            if (commentMatch && commentMatch[1]) {
              fullId = `NH-${commentMatch[1]}`;
            }
          }
        } else {
          // Xử lý cho các định dạng không phải LaTeX
          for (const line of lines) {
            for (const pattern of idPatterns) {
              const match = line.match(pattern);
              if (match && match[1]) {
                fullId = match[1].trim();
                break;
              }
            }
          }
        }

        // Phân tích ID thành các thành phần (giả định định dạng chuẩn)
        const idParts = fullId.split('-');

        // Xác định loại câu hỏi dựa trên cấu trúc
        let questionType = 'MC'; // Mặc định là trắc nghiệm

        // Kiểm tra nếu có cấu trúc ghép đôi
        const hasMatching = block.includes('\\matching') ||
                           (content && content.toLowerCase().includes('ghép đôi')) ||
                           (content && content.toLowerCase().includes('nối'));

        // Kiểm tra nếu có cấu trúc trả lời ngắn
        const hasShortAnswer = block.includes('\\shortans') ||
                              (content && content.toLowerCase().includes('điền vào chỗ trống')) ||
                              (content && content.toLowerCase().includes('trả lời ngắn'));

        if (hasMatching) {
          questionType = 'MA'; // Ghép đôi
        } else if (hasShortAnswer) {
          questionType = 'SA'; // Trả lời ngắn
        } else if (answers.length === 0) {
          questionType = 'ES'; // Nếu không có đáp án, giả định là tự luận dài
        } else if (answers.length === 2) {
          // Kiểm tra xem có phải là câu hỏi đúng/sai không
          const firstAnswerText = answers[0].text || answers[0].content || '';
          if (firstAnswerText.toLowerCase().includes('đúng') ||
              firstAnswerText.toLowerCase().includes('sai') ||
              firstAnswerText.toLowerCase().includes('true') ||
              firstAnswerText.toLowerCase().includes('false')) {
            questionType = 'TF'; // Nếu chỉ có 2 đáp án và có từ khóa đúng/sai, giả định là True/False
          }
        }

        // Tìm giải thích và nguồn
        let solution = '';
        let source = '';

        // Xử lý đặc biệt cho câu hỏi LaTeX
        if (isLatexQuestion) {
          // Tìm lời giải trong cấu trúc \loigiai{...}
          const loigiaiMatch = block.match(/\\loigiai\s*\{(.*?)\}/s);
          if (loigiaiMatch && loigiaiMatch[1]) {
            solution = loigiaiMatch[1]
              .replace(/\$|\{|\}|\\dfrac|\\frac|\\sqrt|\\ln|\\log/g, '')
              .replace(/\\\\|\\newline/g, '\n')
              .trim();
          }

          // Tìm nguồn từ comment
          const sourceMatch = block.match(/%.*?File gốc:\s*(.*?)$/m);
          if (sourceMatch && sourceMatch[1]) {
            source = sourceMatch[1].trim();
          }
        } else {
          // Xử lý cho các định dạng không phải LaTeX
          const solutionLine = lines.find(line =>
            line.includes('Giải:') ||
            line.includes('Lời giải:') ||
            line.includes('Giải thích:')
          );
          solution = solutionLine
            ? solutionLine.replace(/Giải:|Lời giải:|Giải thích:/i, '').trim()
            : '';

          const sourceLine = lines.find(line =>
            line.includes('Nguồn:') ||
            line.includes('Source:')
          );
          source = sourceLine
            ? sourceLine.replace(/Nguồn:|Source:/i, '').trim()
            : '';
        }

        // Tìm tags
        let tags: string[] = [];

        // Xử lý đặc biệt cho câu hỏi LaTeX
        if (isLatexQuestion) {
          // Tìm tags từ comment hoặc các thẻ đánh dấu
          const tagMatch = block.match(/%\[Tags:(.*?)\]/i);
          if (tagMatch && tagMatch[1]) {
            tags = tagMatch[1].split(',').map(tag => tag.trim());
          }
        } else {
          // Xử lý cho các định dạng không phải LaTeX
          const tagsLine = lines.find(line =>
            line.includes('Tags:') ||
            line.includes('Nhãn:')
          );
          tags = tagsLine
            ? tagsLine.replace(/Tags:|Nhãn:/i, '').split(',').map(tag => tag.trim())
            : [];
        }

        // Tạo subcount
        const subcountNumber = `${index + 1}`.padStart(4, '0');

        return {
          // 1. RawContent
          raw_content: block,

          // 2. QuestionID
          questionID: {
            fullId: fullId,
            grade: {
              value: idParts[0] || '',
              description: `Lớp ${idParts[0] || ''}`
            },
            subject: {
              value: idParts[1] || '',
              description: idParts[1] || ''
            },
            chapter: {
              value: idParts[2] || '',
              description: `Chương ${idParts[2] || ''}`
            },
            level: {
              value: idParts[3] || '',
              description: `Mức ${idParts[3] || ''}`
            },
            lesson: {
              value: idParts[4] || '',
              description: `Bài ${idParts[4] || ''}`
            },
            form: {
              value: idParts[5] || '0',
              description: idParts[5] ? `${idParts[5]} (Dạng câu hỏi theo Map ID)` : '0 (Dạng câu hỏi theo Map ID)'
            }
          },

          // 3. Subcount
          subcount: {
            prefix: 'SC',
            number: subcountNumber,
            fullId: `SC${subcountNumber}`,
          },

          // 4. Type
          type: questionType,

          // Trường bổ sung - đặt ở đây để tránh lỗi cú pháp
          form: questionType === 'MC' ? 'multiple-choice' :
                questionType === 'TF' ? 'true-false' :
                questionType === 'SA' ? 'short-answer' :
                questionType === 'MA' ? 'matching' :
                questionType === 'ES' ? 'essay' : '',
          difficulty: idParts[3] || 'medium',

          // 5. Source
          source: source,

          // 6. Content
          content: content,

          // 7. Answers
          answers: answers,

          // 8. CorrectAnswer
          correctAnswer: correctAnswer,

          // 9. Solution
          solution: solution,

          // 10. Images
          images: {
            questionImage: null,
            solutionImage: null,
          },

          // 11. Tags
          tags: tags,

          // 12. UsageCount
          usageCount: 0,

          // 13. Creator
          creator: {
            id: "admin",
            name: "Tú",
          },

          // 14. Status
          status: {
            code: 'draft',
            lastUpdated: new Date().toISOString(),
          },

          // 15. ExamRefs
          examRefs: [],

          // 16. Feedback
          feedback: {
            averageDifficulty: 3,
            clarity: 3,
            correctnessRate: 0,
            feedbackCount: 0,
            comments: []
          }
        };
      }));

      setParsedQuestions(parsedResults);

      // Đếm số câu hỏi có lỗi (nếu có)
      const errorCount = parsedResults.filter(q => q.questionID.fullId.startsWith('Error')).length;

      // Hiển thị thông báo thành công với số lượng câu hỏi đã tách và số lượng lỗi (nếu có)
      setSuccess(`Đã tách thành công ${parsedResults.length} câu hỏi${errorCount > 0 ? ` (${errorCount} câu hỏi có lỗi)` : ''}`);
    } catch (error) {
      logger.error('Lỗi khi tách trường:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tách trường. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Hàm xử lý lưu câu hỏi vào CSDL
  const handleSaveQuestions = async () => {
    if (parsedQuestions.length === 0) {
      setError('Không có câu hỏi nào để lưu');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Lưu câu hỏi thực tế vào database thông qua API
      let savedCount = 0;
      let failedCount = 0;
      const failedQuestions: Array<{question: ParsedQuestion, error: string}> = [];

      // API endpoint
      const apiEndpoint = '/api/admin/questions/direct';

      for (const question of parsedQuestions) {
        try {
          logger.debug(`Đang lưu câu hỏi: ${question.content.substring(0, 30)}...`);

          // Chuẩn bị dữ liệu câu hỏi để gửi đến API
          // Chuyển đổi answers thành định dạng chuẩn
          const formattedAnswers = question.answers && question.answers.length > 0
            ? question.answers.map((answer, index) => ({
                id: String(index + 1),
                content: typeof answer === 'string' ? answer : answer.text || '',
                isCorrect: typeof answer === 'string' ? false : answer.isCorrect || false
              }))
            : [];

          // Đảm bảo correctAnswer luôn là mảng
          const formattedCorrectAnswer = Array.isArray(question.correctAnswer)
            ? question.correctAnswer
            : question.correctAnswer
              ? [question.correctAnswer]
              : [];

          const questionWithoutTags = {
            ...question,
            tags: [], // Đặt tags thành mảng rỗng để tránh lỗi khóa ngoại
            answers: formattedAnswers,
            correctAnswer: formattedCorrectAnswer
          };

          // Gọi API để lưu câu hỏi
          const apiResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionWithoutTags),
            credentials: 'include', // Tự động gửi cookie với request
          });

          logger.debug('Phản hồi từ API:', {
            status: apiResponse.status,
            statusText: apiResponse.statusText
          });

          if (apiResponse.ok) {
            const result = await apiResponse.json();
            logger.debug(`Kết quả thêm mới câu hỏi:`, result);
            savedCount++;
          } else {
            const errorData = await apiResponse.json().catch(() => ({
              message: `Lỗi HTTP: ${apiResponse.status} ${apiResponse.statusText}`
            }));

            failedCount++;
            failedQuestions.push({
              question,
              error: errorData.message || errorData.error || `Lỗi HTTP: ${apiResponse.status}`
            });

            logger.error(`Lỗi khi lưu câu hỏi: ${question.content.substring(0, 30)}...`, errorData);
          }
        } catch (error) {
          failedCount++;
          failedQuestions.push({
            question,
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
          });

          logger.error(`Lỗi khi lưu câu hỏi: ${question.content.substring(0, 30)}...`, error);
        }
      }

      // Hiển thị thông báo kết quả
      if (failedCount > 0) {
        setError(`Có ${failedCount} câu hỏi không thể lưu. Vui lòng kiểm tra lại.`);

        // Log chi tiết các câu hỏi lỗi
        logger.error('Chi tiết các câu hỏi lỗi:', failedQuestions);
      }

      if (savedCount > 0) {
        setSuccess(`Đã lưu thành công ${savedCount} câu hỏi. ${failedCount > 0 ? `${failedCount} câu hỏi lỗi.` : ''}`);

        // Thông báo thành công
        toast({
          title: "Lưu câu hỏi thành công",
          description: `Đã lưu ${savedCount} câu hỏi vào cơ sở dữ liệu.`,
          variant: "success"
        });

        // Nếu tất cả đều thành công, reset form
        if (failedCount === 0) {
          setBulkInput('');
          setParsedQuestions([]);
        }
      } else {
        // Nếu không có câu hỏi nào được lưu thành công
        toast({
          title: "Lỗi",
          description: "Không thể lưu câu hỏi vào cơ sở dữ liệu.",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error('Lỗi tổng thể khi lưu câu hỏi:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại.');

      toast({
        title: "Lỗi",
        description: "Không thể lưu câu hỏi vào cơ sở dữ liệu.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      {/* Header với nút back */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="icon"
            className="bg-white/80 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Nhập câu hỏi hàng loạt</h1>
        </div>
      </div>

      {/* Thông báo lỗi và thành công */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 mb-6 transition-colors duration-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 rounded-lg text-green-600 dark:text-green-400 mb-6 transition-colors duration-300">
          {success}
        </div>
      )}

      {/* Tabs cho phương thức nhập */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 w-full bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors duration-300">
          <TabsTrigger
            value="text"
            className="data-[state=active]:bg-primary-terracotta/20 data-[state=active]:text-primary-terracotta dark:data-[state=active]:bg-blue-500/20 dark:data-[state=active]:text-blue-400 transition-colors duration-300 hover:scale-105"
          >
            <FileInput className="h-4 w-4 mr-2" />
            Nhập trực tiếp
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="data-[state=active]:bg-primary-terracotta/20 data-[state=active]:text-primary-terracotta dark:data-[state=active]:bg-blue-500/20 dark:data-[state=active]:text-blue-400 transition-colors duration-300 hover:scale-105"
          >
            <FileUp className="h-4 w-4 mr-2" />
            Tải lên file LaTeX
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          {/* Phần nhập nội dung hàng loạt */}
          <Card className="bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 mb-6 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">Nhập nội dung câu hỏi hàng loạt</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 transition-colors duration-300">
                Dán nhiều câu hỏi vào ô bên dưới, mỗi câu hỏi cách nhau bởi 2 dòng trống, hoặc chuyển sang tab &quot;Tải lên file LaTeX&quot; để tải lên file hoặc folder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Dán nội dung câu hỏi hàng loạt ở đây..."
                className="font-mono bg-white dark:bg-black text-slate-800 dark:text-white min-h-[300px] border-slate-300 dark:border-slate-700 transition-colors duration-300"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                <span className="font-medium">Định dạng gợi ý:</span> Nội dung câu hỏi, sau đó là các đáp án (A, B, C, D), đáp án đúng đánh dấu bằng dấu *, ID câu hỏi (nếu có)
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="file">
          {/* Phần tải lên file LaTeX */}
          <Card className="bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 mb-6 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">Tải lên file LaTeX</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 transition-colors duration-300">
                Chọn file LaTeX (.tex) hoặc cả folder chứa nhiều file LaTeX từ máy tính của bạn để nhập câu hỏi hàng loạt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex flex-col items-center justify-center p-10 border-2 border-dashed ${isDragging ? 'border-primary-terracotta dark:border-blue-400' : 'border-slate-300 dark:border-slate-700'} rounded-lg bg-white dark:bg-black transition-colors duration-300`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".tex"
                  onChange={handleFileChange}
                  multiple={true}
                  {...(uploadMode === 'folder' ? { webkitdirectory: '', directory: '' } : {})}
                  className="hidden"
                />

                {selectedFiles && selectedFiles.length > 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    <FileUp className="h-12 w-12 text-primary-terracotta dark:text-blue-400 transition-colors duration-300" />
                    <div className="text-center">
                      <p className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">
                        {selectedFiles.length === 1
                          ? selectedFiles[0].name
                          : `${selectedFiles.length} file LaTeX đã chọn`}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        {selectedFiles.length === 1
                          ? `${(selectedFiles[0].size / 1024).toFixed(2)} KB`
                          : `Tổng dung lượng: ${(selectedFiles.reduce((total, file) => total + file.size, 0) / 1024).toFixed(2)} KB`}
                      </p>

                      {/* Hiển thị danh sách file nếu có nhiều hơn 1 file */}
                      {selectedFiles.length > 1 && (
                        <div className="mt-2 max-h-32 overflow-y-auto text-left bg-white dark:bg-slate-900 p-2 rounded-md border border-slate-300 dark:border-slate-700">
                          <p className="text-sm font-medium mb-1 text-slate-800 dark:text-white">Danh sách file:</p>
                          <ul className="text-xs space-y-1">
                            {selectedFiles.map((file, index) => (
                              <li key={index} className="text-slate-600 dark:text-slate-400">
                                {index + 1}. {file.name} ({(file.size / 1024).toFixed(2)} KB)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleFileButtonClick}
                      variant="outline"
                      className="mt-2 bg-white/80 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105"
                    >
                      Chọn file khác
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <FileUp className="h-12 w-12 text-slate-400 dark:text-slate-600 transition-colors duration-300" />
                    <div className="text-center">
                      <p className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">
                        Kéo và thả file LaTeX vào đây
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                        hoặc chọn từ máy tính của bạn:
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => {
                            setUploadMode('file');
                            handleFileButtonClick();
                          }}
                          variant="outline"
                          size="sm"
                          className={`${uploadMode === 'file' ? 'bg-primary-terracotta/20 text-primary-terracotta dark:bg-blue-500/20 dark:text-blue-400' : 'bg-white/80 dark:bg-slate-800/50 text-slate-800 dark:text-white'} border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105`}
                        >
                          Chọn file
                        </Button>
                        <Button
                          onClick={() => {
                            setUploadMode('folder');
                            handleFileButtonClick();
                          }}
                          variant="outline"
                          size="sm"
                          className={`${uploadMode === 'folder' ? 'bg-primary-terracotta/20 text-primary-terracotta dark:bg-blue-500/20 dark:text-blue-400' : 'bg-white/80 dark:bg-slate-800/50 text-slate-800 dark:text-white'} border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105`}
                        >
                          Chọn folder
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                <span className="font-medium">Định dạng hỗ trợ:</span> File LaTeX (.tex) chứa các câu hỏi trong môi trường {`\\begin{ex}...\\end{ex}`}
                <br />
                <span className="text-xs italic">Có thể chọn nhiều file hoặc cả folder chứa file .tex</span>
              </div>
              {selectedFiles && selectedFiles.length > 0 && (
                <Button
                  onClick={readLatexFiles}
                  disabled={isProcessing}
                  className="bg-primary-terracotta hover:bg-primary-terracotta/90 text-white transition-colors duration-300 hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" />
                      {selectedFiles.length === 1 ? 'Đọc file' : `Đọc ${selectedFiles.length} file`}
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Các nút chức năng chính */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          onClick={() => handleParseQuestions()}
          disabled={isProcessing || !bulkInput.trim()}
          className="flex items-center gap-2 px-6 py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300 hover:scale-105"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tách trường...
            </>
          ) : (
            <>
              <Table className="h-5 w-5" />
              Tách trường
            </>
          )}
        </Button>

        <Button
          onClick={handleSaveQuestions}
          disabled={isSaving || parsedQuestions.length === 0}
          className="flex items-center gap-2 px-6 py-6 text-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-300 hover:scale-105"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang lưu câu hỏi...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Lưu câu hỏi
            </>
          )}
        </Button>
      </div>

      {/* Bảng hiển thị câu hỏi đã tách */}
      {parsedQuestions.length > 0 && (
        <Card className="bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">Câu hỏi đã tách ({parsedQuestions.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllFields}
              className="flex items-center gap-1 text-slate-800 dark:text-white bg-white/80 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105"
            >
              {showAllFields ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ẩn trường chi tiết
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Hiện tất cả trường
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <th className="text-left py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">#</th>
                    <th className="text-left py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">Subcount</th>
                    <th className="text-left py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">QuestionID</th>
                    <th className="text-left py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">Type</th>
                    <th className="text-left py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">Source</th>
                    <th className="text-left py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">CorrectAnswer</th>
                    <th className="text-left py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedQuestions.map((question, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors duration-300">
                        <td className="py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">{index + 1}</td>
                        <td className="py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">
                          {question.subcount.fullId}
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">
                          <div className="max-w-xs truncate">{question.questionID.fullId}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">
                          {
                            question.type === 'MC' ? 'MC (Trắc nghiệm)' :
                            question.type === 'TF' ? 'TF (Đúng/Sai)' :
                            question.type === 'SA' ? 'SA (Trả lời ngắn)' :
                            question.type === 'MA' ? 'MA (Ghép đôi)' :
                            question.type === 'ES' ? 'ES (Tự luận)' : question.type
                          }
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">
                          <div className="max-w-xs truncate">{question.source || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-white transition-colors duration-300">
                          {typeof question.correctAnswer === 'string'
                            ? question.correctAnswer
                            : Array.isArray(question.correctAnswer)
                              ? question.correctAnswer.join(', ')
                              : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDetails(index)}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300 hover:scale-105"
                          >
                            {expandedDetails.includes(index) ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Ẩn
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Xem
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                      {(expandedDetails.includes(index) || showAllFields) && (
                        <tr className="bg-slate-100 dark:bg-slate-900/30 transition-colors duration-300">
                          <td colSpan={7} className="py-3 px-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
                              <div>
                                <h4 className="font-semibold mb-2 text-slate-800 dark:text-white transition-colors duration-300">Nội dung</h4>
                                <pre className="bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-300 dark:border-slate-800 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-slate-800 dark:text-white transition-colors duration-300">
                                  {question.content}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-slate-800 dark:text-white transition-colors duration-300">Raw Content</h4>
                                <pre className="bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-300 dark:border-slate-800 max-h-40 overflow-y-auto font-mono text-xs whitespace-pre-wrap text-slate-800 dark:text-white transition-colors duration-300">
                                  {question.raw_content.substring(0, 500)}
                                  {question.raw_content.length > 500 && '...'}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-slate-800 dark:text-white transition-colors duration-300">Đáp án</h4>
                                <div className="bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-300 dark:border-slate-800 transition-colors duration-300">
                                  {question.answers && question.answers.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                      {question.answers.map((answer, i) => (
                                        <li key={i} className={answer.isCorrect ? 'text-green-600 dark:text-green-400 transition-colors duration-300' : 'text-slate-800 dark:text-white transition-colors duration-300'}>
                                          {answer.content || answer.text || ''}
                                          {answer.isCorrect && ' (Đúng)'}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-slate-500 dark:text-slate-500 transition-colors duration-300">Không có đáp án</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-slate-800 dark:text-white transition-colors duration-300">Lời giải</h4>
                                <pre className="bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-300 dark:border-slate-800 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-slate-800 dark:text-white transition-colors duration-300">
                                  {question.solution || 'Không có lời giải'}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-slate-800 dark:text-white transition-colors duration-300">Tags</h4>
                                <div className="bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-300 dark:border-slate-800 transition-colors duration-300">
                                  {question.tags && question.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {question.tags.map((tag, i) => (
                                        <span key={i} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs text-slate-800 dark:text-white transition-colors duration-300">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-slate-500 dark:text-slate-500 transition-colors duration-300">Không có tags</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-slate-800 dark:text-white transition-colors duration-300">Thông tin cơ bản</h4>
                                <div className="bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-300 dark:border-slate-800 transition-colors duration-300">
                                  <ul className="space-y-1 text-sm">
                                    <li><span className="text-slate-600 dark:text-slate-400 transition-colors duration-300">QuestionID:</span> <span className="text-slate-800 dark:text-white transition-colors duration-300">{question.questionID.fullId}</span></li>
                                    <li><span className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Type:</span> <span className="text-slate-800 dark:text-white transition-colors duration-300">{
                                      question.type === 'MC' ? 'MC (Trắc nghiệm)' :
                                      question.type === 'TF' ? 'TF (Đúng/Sai)' :
                                      question.type === 'SA' ? 'SA (Trả lời ngắn)' :
                                      question.type === 'MA' ? 'MA (Ghép đôi)' :
                                      question.type === 'ES' ? 'ES (Tự luận)' : question.type
                                    }</span></li>
                                    <li><span className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Source:</span> <span className="text-slate-800 dark:text-white transition-colors duration-300">{question.source || 'Không có'}</span></li>
                                    <li><span className="text-slate-600 dark:text-slate-400 transition-colors duration-300">Subcount:</span> <span className="text-slate-800 dark:text-white transition-colors duration-300">{question.subcount.fullId}</span></li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
              Kiểm tra kỹ các câu hỏi trước khi lưu vào cơ sở dữ liệu
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
