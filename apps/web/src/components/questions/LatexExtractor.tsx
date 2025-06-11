'use client';

import { X, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { QuestionFormData } from './QuestionFormTabs';

import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QuestionIdDetails, SubcountDetails, ExtractedAnswer, EditableAnswer, MapIDResult } from '@/lib/types/latex-parser';
import { ExtractedQuestion } from '@/lib/utils/latex-parser';
import { extractFromLatex } from '@/lib/utils/latex-parser';
import logger from '@/lib/utils/logger';


interface ExtractorProps {
  latexInput: string;
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  isAnalyzing: boolean;
  saveQuestionToDatabase: () => Promise<unknown>;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  saveMessage: string;
}



export function LatexExtractor({
  latexInput,
  formData,
  setFormData,
  isAnalyzing,
  saveQuestionToDatabase,
  isSaving,
  saveStatus,
  saveMessage
}: ExtractorProps) {
  const [extractionResult, setExtractionResult] = useState<ExtractedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracted, setIsExtracted] = useState<boolean>(false);
  const isProcessing = useRef<boolean>(false);
  const isUpdatingForm = useRef<boolean>(false);

  // State để lưu trữ dữ liệu có thể chỉnh sửa
  const [editableQuestionId, setEditableQuestionId] = useState<string | null>(null);
  const [editableQuestionIdDetails, setEditableQuestionIdDetails] = useState<QuestionIdDetails | null>(null);
  const [editableSubcount, setEditableSubcount] = useState<SubcountDetails | null>(null);
  const [editableSource, setEditableSource] = useState<string | null>(null);
  const [editableSolution, setEditableSolution] = useState<string | null>(null);
  const [editableAnswers, setEditableAnswers] = useState<EditableAnswer[] | null>(null);

  // State để lưu thông tin decoded MapID
  const [decodedMapID, setDecodedMapID] = useState<MapIDResult | null>(null);

  // Phân tích LaTeX khi có dữ liệu mới
  useEffect(() => {
    // Chỉ phân tích khi có dữ liệu và không đang trong quá trình phân tích
    if (latexInput && !isAnalyzing && !isProcessing.current) {
      // Đánh dấu đang xử lý để tránh gọi nhiều lần
      isProcessing.current = true;

      try {
        // Thử phân tích LaTeX
        const result = extractFromLatex(latexInput);
        setExtractionResult(result);

        // Cập nhật state có thể chỉnh sửa với giá trị từ trích xuất
        setEditableQuestionId(result.questionId);
        setEditableQuestionIdDetails(result.questionIdDetails);
        setEditableSubcount(result.subcount);
        setEditableSource(result.source);
        setEditableSolution(result.solution);
        setEditableAnswers(result.answers);

        // Đánh dấu đã trích xuất
        setIsExtracted(true);
        setError(null);

        // Nếu có questionId, thử decode nó
        if (result.questionId) {
          decodeQuestionID(result.questionId);
        }

        // Tự động áp dụng kết quả trích xuất vào form ngay lập tức
        // Sử dụng setTimeout để đảm bảo các state đã được cập nhật
        setTimeout(() => {
          applyAllFields();
        }, 50);
      } catch (err) {
        const error = err as Error;
        // Chỉ hiển thị lỗi nếu là lỗi nghiêm trọng, không phải lỗi định dạng
        if (!error.message.includes('không hợp lệ') && !error.message.includes('thiếu dấu ngoặc')) {
          setError(error.message || 'Lỗi khi phân tích LaTeX');
        }
        // Không reset extraction result nếu đã có kết quả trước đó
        if (!extractionResult) {
          setExtractionResult(null);
          setIsExtracted(false);
        }
      } finally {
        // Đánh dấu đã xử lý xong
        setTimeout(() => {
          isProcessing.current = false;
        }, 100);
      }
    }
  }, [latexInput, isAnalyzing]);

  // Reset state khi latexInput thay đổi hoàn toàn
  useEffect(() => {
    // Chỉ reset khi latexInput thay đổi hoàn toàn (ví dụ: khi chọn mẫu mới)
    if (!latexInput) {
      setIsExtracted(false);
      setExtractionResult(null);
    }
  }, [latexInput]);

  // Hàm để decode QuestionID thành thông tin đầy đủ
  const decodeQuestionID = async (id: string) => {
    try {
      // Chuyển đổi ID5/ID6 thành MapID format
      // Ví dụ: 0H5V4 -> [0H5V4]
      // Format ID5: [Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5]
      // Format ID6: [Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5 - Tham số 6]
      // Tham số 1: Lớp (grade)
      // Tham số 2: Môn (subject)
      // Tham số 3: Chương (chapter)
      // Tham số 4: Mức độ (level/difficulty)
      // Tham số 5: Bài (lesson)
      // Tham số 6: Dạng (type/questionType)
      const mapID = id.startsWith('[') ? id : `[${id}]`;

      // Gọi API để decode
      const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(mapID)}`);
      const data = await response.json();

      if (response.ok && data.success && data.result) {
        setDecodedMapID(data.result);
        return data.result;
      } else {
        logger.warn('Không thể decode QuestionID:', data.error || 'Unknown error');
        return null;
      }
    } catch (err) {
      logger.error('Lỗi khi decode QuestionID:', err);
      return null;
    }
  };

  // Xử lý khi thay đổi QuestionID
  const handleQuestionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableQuestionId(e.target.value);
    // Khi người dùng thay đổi QuestionID, cố gắng decode
    decodeQuestionID(e.target.value);
  };

  // Xử lý khi thay đổi thông tin chi tiết của QuestionID
  const handleQuestionIdDetailsChange = (field: keyof QuestionIdDetails, value: string) => {
    if (editableQuestionIdDetails) {
      setEditableQuestionIdDetails({
        ...editableQuestionIdDetails,
        [field]: value
      });
    }
  };

  // Xử lý khi thay đổi Subcount
  const handleSubcountChange = (field: keyof SubcountDetails, value: string) => {
    if (editableSubcount) {
      const newSubcount = { ...editableSubcount, [field]: value };

      // Tự động cập nhật fullId khi prefix hoặc number thay đổi
      if (field === 'prefix' || field === 'number') {
        newSubcount.fullId = `${newSubcount.prefix}.${newSubcount.number}`;
      }

      setEditableSubcount(newSubcount);
    }
  };

  // Áp dụng tất cả các trường trích xuất vào form
  const applyAllFields = async () => {
    // Nếu đang xử lý, bỏ qua
    if (isUpdatingForm.current) return;

    // Đánh dấu đang xử lý
    isUpdatingForm.current = true;

    if (!extractionResult) {
      isUpdatingForm.current = false;
      return;
    }

    try {
      // Tạo một bản sao hoàn toàn mới của formData
      const newFormData = JSON.parse(JSON.stringify(formData));

      // 1. Áp dụng loại câu hỏi
      newFormData.form = mapQuestionType(extractionResult.type);
      newFormData.type = mapQuestionType(extractionResult.type); // Đồng bộ cả type và form

      // 2. Áp dụng nội dung gốc và nội dung hiển thị
      newFormData.raw_content = extractionResult.rawContent;
      newFormData.rawContent = extractionResult.rawContent; // Đảm bảo cả hai trường đều được cập nhật
      newFormData.content = extractionResult.content;

      // 3. Áp dụng nguồn nếu có
      if (editableSource) {
        newFormData.source = editableSource;
      } else if (extractionResult.source) {
        newFormData.source = extractionResult.source;
      }

      // 4. Áp dụng QuestionID nếu có
      if (editableQuestionIdDetails) {
        const details = editableQuestionIdDetails;

        newFormData.questionID.fullId = details.fullId;
        newFormData.questionID.format = details.fullId.length > 5 ? 'ID6' : 'ID5';

        // Nếu có dữ liệu decoded từ API, sử dụng nó
        let mapIDResult = decodedMapID;

        // Nếu chưa có decoded data, thử decode lại
        if (!mapIDResult && details.fullId) {
          mapIDResult = await decodeQuestionID(details.fullId);
        }

        if (mapIDResult) {
          // Tham số 1: Lớp (grade)
          if (details.grade && mapIDResult.grade) {
            newFormData.questionID.grade = {
              value: mapIDResult.grade.code,
              description: mapIDResult.grade.description
            };
          }

          // Tham số 2: Môn (subject)
          if (details.subject && mapIDResult.subject) {
            newFormData.questionID.subject = {
              value: mapIDResult.subject.code,
              description: mapIDResult.subject.description
            };
          }

          // Tham số 3: Chương (chapter)
          if (details.chapter && mapIDResult.chapter) {
            newFormData.questionID.chapter = {
              value: mapIDResult.chapter.code,
              description: mapIDResult.chapter.description
            };
          }

          // Tham số 4: Mức độ (level)
          if (details.level && mapIDResult.difficulty) {
            newFormData.questionID.level = {
              value: mapIDResult.difficulty.code,
              description: mapIDResult.difficulty.description
            };
          }

          // Tham số 5: Bài (lesson)
          if (details.lesson && mapIDResult.lesson) {
            newFormData.questionID.lesson = {
              value: mapIDResult.lesson.code,
              description: mapIDResult.lesson.description
            };
          }

          // Tham số 6: Dạng (form) - Cập nhật đúng tên trường
          if (details.type && mapIDResult.form) {
            newFormData.questionID.form = {
              value: details.type,
              description: mapIDResult.form.description
            };
          } else if (details.type) {
            newFormData.questionID.form = {
              value: details.type,
            };
          }
        } else {
          // Không decode được, dùng giá trị từ người dùng nhập
          if (details.grade) {
            newFormData.questionID.grade = {
              value: details.grade,
            };
          }

          if (details.subject) {
            newFormData.questionID.subject = {
              value: details.subject,
            };
          }

          if (details.chapter) {
            newFormData.questionID.chapter = {
              value: details.chapter,
            };
          }

          if (details.level) {
            newFormData.questionID.level = {
              value: details.level,
            };
          }

          if (details.lesson) {
            newFormData.questionID.lesson = {
              value: details.lesson,
            };
          }

          if (details.type) {
            newFormData.questionID.type = {
              value: details.type,
            };
          }
        }
      }

      // 5. Áp dụng Subcount nếu có
      if (editableSubcount) {
        newFormData.subcount = editableSubcount;
      }

      // 6. Áp dụng đáp án
      if (extractionResult.answers && extractionResult.answers.length > 0) {
        // Chuyển đổi định dạng đáp án
        const processedAnswers: ExtractedAnswer[] = [...extractionResult.answers];
        const answersToRemove: string[] = [];

        // Xử lý phân số bị cắt
        for (let i = 0; i < processedAnswers.length; i++) {
          const answer = processedAnswers[i];
          let content = answer.content || `Đáp án ${answer.id}`;

          // Kiểm tra nếu nội dung là phân số bị cắt (ví dụ: "$\\dfrac{2")
          if (content.includes('\\dfrac{') && !content.includes('}{')) {
            // Tìm vị trí của phân số trong nội dung
            const fractionPos = content.indexOf('\\dfrac{');
            // Tìm vị trí của dấu { sau \dfrac
            const openBracePos = fractionPos + 7; // 7 là độ dài của '\dfrac{'

            // Lấy phần tử số (numerator)
            const numerator = content.substring(openBracePos);

            // Tìm số tiếp theo trong mảng đáp án
            if (i + 1 < processedAnswers.length) {
              const nextAnswer = processedAnswers[i + 1];

              // Tách phần trước và sau phân số
              const beforeFraction = content.substring(0, fractionPos);
              // Tạo phân số hoàn chỉnh
              content = beforeFraction + '\\dfrac{' + numerator + '}{' + nextAnswer.content + '}$';

              // Cập nhật nội dung đáp án hiện tại
              processedAnswers[i] = {
                ...answer,
                content: content
              };

              // Đánh dấu đáp án tiếp theo để xóa
              answersToRemove.push(nextAnswer.id);

              // Bỏ qua đáp án tiếp theo
              i++;
            }
          }
        }

        // Lọc bỏ các đáp án đã được sử dụng làm mẫu số
        const filteredAnswers = processedAnswers.filter(answer => !answersToRemove.includes(answer.id));

        // Chuyển đổi định dạng đáp án
        newFormData.answers = filteredAnswers.map((answer: ExtractedAnswer) => {
          // Đảm bảo nội dung không bị trống
          const content = answer.content || `Đáp án ${answer.id}`;

          return {
            id: answer.id || uuidv4(),
            content: content,
            isCorrect: answer.isCorrect
          };
        });

        // Log để debug
        console.log('Đáp án đã được xử lý:', {
          original: extractionResult.answers.length,
          filtered: filteredAnswers.length,
          final: newFormData.answers.length,
          answers: newFormData.answers
        });

        // Xử lý đáp án theo từng loại câu hỏi
        switch (extractionResult.type) {
          case 'multiple-choice':
          case 'true-false': {
            const correctAnswers = extractionResult.answers
              .filter((answer: ExtractedAnswer) => answer.isCorrect)
              .map((answer: ExtractedAnswer) => answer.content);

            // Đảm bảo correctAnswer luôn là mảng
            newFormData.correctAnswer = correctAnswers;
            break;
          }
          case 'short-answer': {
            // Cho câu trả lời ngắn, lấy nội dung của đáp án đầu tiên
            newFormData.correctAnswer = extractionResult.answers[0]?.content ? [extractionResult.answers[0].content] : [];
            break;
          }
          case 'matching': {
            // Câu hỏi ghép đôi sẽ có cấu trúc đặc biệt
            // Lấy tất cả đáp án đã được ghép đúng
            const matchedAnswers = extractionResult.answers
              .filter((answer: ExtractedAnswer) => answer.isCorrect)
              .map((answer: ExtractedAnswer) => answer.content);
            newFormData.correctAnswer = matchedAnswers;
            break;
          }
          case 'essay': {
            // Câu hỏi tự luận thường không có đáp án cụ thể
            // Nhưng vẫn có thể có gợi ý đáp án
            if (extractionResult.correctAnswer) {
              newFormData.correctAnswer = Array.isArray(extractionResult.correctAnswer)
                ? extractionResult.correctAnswer
                : [extractionResult.correctAnswer];
            } else if (extractionResult.answers.some((a: ExtractedAnswer) => a.isCorrect)) {
              const suggestedAnswers = extractionResult.answers
                .filter((answer: ExtractedAnswer) => answer.isCorrect)
                .map((answer: ExtractedAnswer) => answer.content);
              newFormData.correctAnswer = suggestedAnswers; // Đã là mảng
            } else {
              newFormData.correctAnswer = []; // Mảng rỗng nếu không có đáp án
            }
            break;
          }
          default: {
            // Trường hợp không xác định được loại, nhưng có đáp án
            if (extractionResult.correctAnswer) {
              newFormData.correctAnswer = Array.isArray(extractionResult.correctAnswer)
                ? extractionResult.correctAnswer
                : [extractionResult.correctAnswer];
            } else {
              newFormData.correctAnswer = []; // Mảng rỗng nếu không có đáp án
            }
          }
        }
      } else if (extractionResult.correctAnswer) {
        // Nếu không có answers array nhưng có correctAnswer
        newFormData.correctAnswer = Array.isArray(extractionResult.correctAnswer)
          ? extractionResult.correctAnswer
          : [extractionResult.correctAnswer];
      }

      // 7. Áp dụng lời giải
      if (extractionResult.solution) {
        newFormData.solution = extractionResult.solution;
      }

      // Log để debug trước khi cập nhật
      console.log('Trước khi áp dụng thông tin vào form:', {
        content: formData.content?.substring(0, 50) + '...',
        // Sử dụng type assertion để tránh lỗi TypeScript
        answers: (formData as any).answers?.length || 0,
        questionID: formData.questionID?.fullId
      });

      console.log('Thông tin mới sẽ áp dụng:', {
        content: newFormData.content?.substring(0, 50) + '...',
        // Sử dụng type assertion để tránh lỗi TypeScript
        answers: (newFormData as any).answers?.length || 0,
        questionID: newFormData.questionID?.fullId,
        type: (newFormData as any).form
      });

      // Cập nhật formData với dữ liệu mới
      // Sử dụng một hàm callback để đảm bảo cập nhật đúng
      setFormData(prevData => {
        // Kết hợp dữ liệu mới với dữ liệu hiện tại
        const combinedData = {
          ...prevData,
          ...newFormData,
          // Đảm bảo các trường quan trọng được cập nhật
          raw_content: newFormData.raw_content,
          rawContent: newFormData.raw_content,
          content: newFormData.content,
          // Sử dụng type assertion để tránh lỗi TypeScript
          form: (newFormData as any).form,
          type: (newFormData as any).form,
          answers: (newFormData as any).answers || [],
          correctAnswer: newFormData.correctAnswer,
          solution: newFormData.solution,
          source: newFormData.source,
          questionID: newFormData.questionID,
          subcount: newFormData.subcount
        };

        // Log để debug sau khi cập nhật
        console.log('Sau khi áp dụng thông tin vào form:', {
          content: combinedData.content?.substring(0, 50) + '...',
          answers: combinedData.answers?.length || 0,
          questionID: combinedData.questionID?.fullId,
          formData: JSON.stringify(combinedData).substring(0, 200) + '...'
        });

        return combinedData;
      });

      // Đánh dấu đã hoàn thành xử lý sau một khoảng thời gian
      setTimeout(() => {
        isUpdatingForm.current = false;
      }, 100);
    } catch (error) {
      console.error('Lỗi khi áp dụng thông tin vào form:', error);
      isUpdatingForm.current = false;
    }
  };

  // Áp dụng một trường cụ thể vào form
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const applyField = async (fieldName: string) => {
    if (!extractionResult) return;

    // Kiểm tra xem có đang xử lý hay không
    if (isProcessing.current || isUpdatingForm.current) return;

    // Đánh dấu đang xử lý
    isProcessing.current = true;
    isUpdatingForm.current = true;

    try {
      // Tạo một bản sao mới của formData
      const newFormData = JSON.parse(JSON.stringify(formData));

      switch (fieldName) {
        case 'type':
          newFormData.form = mapQuestionType(extractionResult.type);
          break;
        case 'content':
          newFormData.raw_content = extractionResult.rawContent;
          newFormData.content = extractionResult.content;
          break;
        case 'source':
          if (editableSource) {
            newFormData.source = editableSource;
          }
          break;
        case 'solution':
          if (extractionResult.solution) {
            newFormData.solution = extractionResult.solution;
          }
          break;
        case 'questionId':
          if (editableQuestionIdDetails) {
            const details = editableQuestionIdDetails;

            newFormData.questionID.fullId = details.fullId;
            newFormData.questionID.format = details.fullId.length > 5 ? 'ID6' : 'ID5';

            // Nếu có dữ liệu decoded từ API, sử dụng nó
            let mapIDResult = decodedMapID;

            // Nếu chưa có decoded data, thử decode lại
            if (!mapIDResult && details.fullId) {
              mapIDResult = await decodeQuestionID(details.fullId);
            }

            if (mapIDResult) {
              // Sử dụng thông tin đúng theo định nghĩa của tham số
              // Tham số 1: Lớp (grade)
              newFormData.questionID.grade = {
                value: mapIDResult.grade.code,
                description: mapIDResult.grade.description
              };

              // Tham số 2: Môn (subject)
              newFormData.questionID.subject = {
                value: mapIDResult.subject.code,
                description: mapIDResult.subject.description
              };

              // Tham số 3: Chương (chapter)
              newFormData.questionID.chapter = {
                value: mapIDResult.chapter.code,
                description: mapIDResult.chapter.description
              };

              // Tham số 4: Mức độ (level) - Lưu ý: trong MapIDResult là 'difficulty'
              newFormData.questionID.level = {
                value: mapIDResult.difficulty.code,
                description: mapIDResult.difficulty.description
              };

              // Tham số 5: Bài (lesson)
              newFormData.questionID.lesson = {
                value: mapIDResult.lesson.code,
                description: mapIDResult.lesson.description
              };

              // Tham số 6: Dạng (form) - Cập nhật đúng tên trường
              if (details.type && mapIDResult.form) {
                newFormData.questionID.form = {
                  value: details.type,
                  description: mapIDResult.form.description
                };
              } else if (details.type) {
                newFormData.questionID.form = {
                  value: details.type,
                };
              }
            } else {
              // Fallback với các mô tả chuẩn nếu không decode được
              newFormData.questionID.grade = {
                value: details.grade,
              };

              newFormData.questionID.subject = {
                value: details.subject,
              };

              newFormData.questionID.chapter = {
                value: details.chapter,
              };

              newFormData.questionID.level = {
                value: details.level,
              };

              newFormData.questionID.lesson = {
                value: details.lesson,
              };

              newFormData.questionID.form = {
                value: details.type,
              };
            }
          } else if (editableQuestionId) {
            newFormData.questionID.fullId = editableQuestionId;
          }
          break;
        case 'subcount':
          if (editableSubcount) {
            newFormData.subcount = editableSubcount;
          }
          break;
        case 'answers':
          if (extractionResult.answers && extractionResult.answers.length > 0) {
            // Chuyển đổi định dạng đáp án
            const processedAnswers: ExtractedAnswer[] = [...extractionResult.answers];
            const answersToRemove: string[] = [];

            // Xử lý phân số bị cắt
            for (let i = 0; i < processedAnswers.length; i++) {
              const answer = processedAnswers[i];
              let content = answer.content || `Đáp án ${answer.id}`;

              // Kiểm tra nếu nội dung là phân số bị cắt (ví dụ: "$\\dfrac{2")
              if (content.includes('\\dfrac{') && !content.includes('}{')) {
                // Tìm vị trí của phân số trong nội dung
                const fractionPos = content.indexOf('\\dfrac{');
                // Tìm vị trí của dấu { sau \dfrac
                const openBracePos = fractionPos + 7; // 7 là độ dài của '\dfrac{'

                // Lấy phần tử số (numerator)
                const numerator = content.substring(openBracePos);

                // Tìm số tiếp theo trong mảng đáp án
                if (i + 1 < processedAnswers.length) {
                  const nextAnswer = processedAnswers[i + 1];

                  // Tách phần trước và sau phân số
                  const beforeFraction = content.substring(0, fractionPos);
                  // Tạo phân số hoàn chỉnh
                  content = beforeFraction + '\\dfrac{' + numerator + '}{' + nextAnswer.content + '}$';

                  // Cập nhật nội dung đáp án hiện tại
                  processedAnswers[i] = {
                    ...answer,
                    content: content
                  };

                  // Đánh dấu đáp án tiếp theo để xóa
                  answersToRemove.push(nextAnswer.id);

                  // Bỏ qua đáp án tiếp theo
                  i++;
                }
              }
            }

            // Lọc bỏ các đáp án đã được sử dụng làm mẫu số
            const filteredAnswers = processedAnswers.filter(answer => !answersToRemove.includes(answer.id));

            // Chuyển đổi định dạng đáp án
            newFormData.answers = filteredAnswers.map((answer: ExtractedAnswer) => {
              // Đảm bảo nội dung không bị trống
              const content = answer.content || `Đáp án ${answer.id}`;

              return {
                id: answer.id || uuidv4(),
                content: content,
                isCorrect: answer.isCorrect
              };
            });

            // Log để debug
            console.log('Đáp án đã được xử lý (applyField):', {
              original: extractionResult.answers.length,
              filtered: filteredAnswers.length,
              final: newFormData.answers.length,
              answers: newFormData.answers
            });

            // Xử lý đáp án đúng
            const correctAnswers = filteredAnswers
              .filter((answer: ExtractedAnswer) => answer.isCorrect)
              .map((answer: ExtractedAnswer) => answer.content);

            if (correctAnswers.length === 1) {
              newFormData.correctAnswer = correctAnswers[0];
            } else if (correctAnswers.length > 1) {
              newFormData.correctAnswer = correctAnswers;
            }
          }
          break;
      }

      // Sử dụng requestAnimationFrame để đảm bảo cập nhật state sau khi render hoàn tất
      requestAnimationFrame(() => {
        // Cập nhật formData
        setFormData(newFormData);

        // Đánh dấu đã xử lý xong sau một khoảng thời gian
        setTimeout(() => {
          isProcessing.current = false;
          isUpdatingForm.current = false;
        }, 300);
      });
    } catch (error) {
      console.error(`Lỗi khi áp dụng trường ${fieldName}:`, error);
      isProcessing.current = false;
      isUpdatingForm.current = false;
    }
  };

  // Chuyển đổi loại câu hỏi từ định dạng nội bộ sang định dạng UI
  const mapQuestionType = (type: string): string => {
    const typeMap: {[key: string]: string} = {
      'multiple-choice': 'MC',
      'true-false': 'TF',
      'short-answer': 'SA',
      'matching': 'MA',
      'essay': 'ES',
      'MC': 'MC',
      'TF': 'TF',
      'SA': 'SA',
      'MA': 'MA',
      'ES': 'ES',
      'unknown': 'MC'
    };
    return typeMap[type] || 'MC';
  };

  // Hàm kiểm tra dữ liệu trước khi lưu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateFormData = (data: QuestionFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Kiểm tra các trường bắt buộc
    if (!data.content) errors.push("Nội dung câu hỏi không được để trống");
    // Sử dụng type assertion để tránh lỗi TypeScript
    if (!(data as any).form) errors.push("Loại câu hỏi không được để trống");
    if (!data.questionID?.fullId) errors.push("ID câu hỏi không được để trống");

    // Kiểm tra đáp án
    if ((data as any).form === 'multiple-choice' && (!(data as any).answers || (data as any).answers.length === 0)) {
      errors.push("Câu hỏi trắc nghiệm phải có ít nhất một đáp án");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  if (!extractionResult && !error) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <div className="text-center">
          <p>Chưa có dữ liệu để phân tích</p>
          <p className="text-sm mt-2">Nhập nội dung LaTeX vào ô bên trên để tự động trích xuất</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col LatexExtractor">
      {error ? (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600">
          {error}
        </div>
      ) : extractionResult ? (
        <div className="space-y-3 overflow-y-auto flex-grow pb-4 max-h-[400px]">
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Loại câu hỏi */}
            <div className="p-2 border rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Loại câu hỏi:</span>
                <Badge className={getQuestionTypeColor(extractionResult.type)}>
                  {getQuestionTypeIcon(extractionResult.type)} {getQuestionTypeName(extractionResult.type)}
                </Badge>
              </div>
            </div>

            {/* 2. QuestionID */}
            <div className="p-2 border rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">QuestionID:</span>
                {editableQuestionId ? (
                  <Badge variant="outline">{editableQuestionId}</Badge>
                ) : (
                  <span className="text-gray-500 italic text-sm">Không tìm thấy</span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Nội dung câu hỏi */}
          <div className="p-2 border rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Nội dung câu hỏi:</span>
              <Badge variant="outline" className="text-xs">{extractionResult.content.length} ký tự</Badge>
            </div>
            <div className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-auto max-h-20 text-sm">
              {extractionResult.content}
            </div>
          </div>

          {/* 4. Đáp án */}
          <div className="p-2 border rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Đáp án:</span>
              {extractionResult.answers && extractionResult.answers.length > 0 ? (
                <Badge>{extractionResult.answers.length} đáp án</Badge>
              ) : (
                <span className="text-gray-500 italic text-sm">Không tìm thấy</span>
              )}
            </div>
            {extractionResult.answers && extractionResult.answers.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {extractionResult.answers.slice(0, 4).map((answer: ExtractedAnswer, index: number) => (
                  <div key={index} className={`p-1 border rounded text-sm ${answer.isCorrect ? 'border-green-500 bg-green-500/10' : ''}`}>
                    <div className="flex items-center gap-1">
                      <Badge variant={answer.isCorrect ? "default" : "secondary"} className="text-xs">
                        {String.fromCharCode(65 + index)}
                      </Badge>
                      <div className="truncate">{answer.content}</div>
                    </div>
                  </div>
                ))}
                {extractionResult.answers.length > 4 && (
                  <div className="p-1 border rounded text-sm text-center">
                    +{extractionResult.answers.length - 4} đáp án khác
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. Đáp án đúng */}
          <div className="p-2 border rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Đáp án đúng:</span>
            </div>
            {(() => {
              // Hiển thị tất cả đáp án đúng
              if (Array.isArray(extractionResult.correctAnswer)) {
                return (
                  <div className="flex flex-wrap gap-1">
                    {extractionResult.correctAnswer.map((content: string, index: number) => (
                      <Badge key={index} className={`whitespace-normal ${getAnswerTypeColor(extractionResult.type)}`}>
                        {content}
                      </Badge>
                    ))}
                  </div>
                );
              } else if (extractionResult.correctAnswer) {
                return (
                  <Badge className={`whitespace-normal ${getAnswerTypeColor(extractionResult.type)}`}>
                    {extractionResult.correctAnswer}
                  </Badge>
                );
              } else {
                return <span className="text-gray-500 italic text-sm">Chưa có đáp án</span>;
              }
            })()}
          </div>

          {/* 6. Lời giải */}
          {extractionResult.solution && (
            <div className="p-2 border rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Lời giải:</span>
              </div>
              <div className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-auto max-h-20 text-sm">
                {extractionResult.solution.length > 100
                  ? extractionResult.solution.substring(0, 100) + '...'
                  : extractionResult.solution}
              </div>
            </div>
          )}

          {/* 7. Nguồn */}
          {extractionResult.source && (
            <div className="p-2 border rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nguồn:</span>
                <span className="text-sm">{editableSource || extractionResult.source}</span>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Nút áp dụng thông tin và lưu câu hỏi - chỉ hiển thị khi không bị ẩn */}
      {extractionResult && (
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={applyAllFields}
              className="flex-1"
              variant="default"
            >
              Áp dụng thông tin vào form
            </Button>

            <Button
              onClick={saveQuestionToDatabase}
              className="flex-1"
              variant="outline"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang lưu...
                </>
              ) : (
                'Lưu câu hỏi'
              )}
            </Button>
          </div>

          {/* Thêm UI feedback khi lưu */}
          {saveStatus !== 'idle' && (
            <div className={`mt-2 p-2 rounded-lg text-sm ${
              saveStatus === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
              'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hàm helper hiển thị tên loại câu hỏi
function getQuestionTypeName(type: string): string {
  const typeMap: {[key: string]: string} = {
    'MC': 'Trắc nghiệm',
    'TF': 'Đúng/Sai',
    'SA': 'Trả lời ngắn',
    'MA': 'Ghép đôi',
    'ES': 'Tự luận',
    'multiple-choice': 'Trắc nghiệm',
    'true-false': 'Đúng/Sai',
    'short-answer': 'Trả lời ngắn',
    'matching': 'Ghép đôi',
    'essay': 'Tự luận',
    'unknown': 'Không xác định'
  };
  return typeMap[type] || 'Không xác định';
}

// Hàm helper hiển thị màu sắc cho loại câu hỏi
function getQuestionTypeColor(type: string): string {
  const colorMap: {[key: string]: string} = {
    'multiple-choice': 'bg-blue-500/10 text-blue-600',
    'true-false': 'bg-green-500/10 text-green-600',
    'short-answer': 'bg-yellow-500/10 text-yellow-600',
    'matching': 'bg-purple-500/10 text-purple-600',
    'essay': 'bg-red-500/10 text-red-600',
    'unknown': 'bg-gray-500/10 text-gray-600'
  };
  return colorMap[type] || 'bg-gray-500/10 text-gray-600';
}

// Hàm helper hiển thị icon cho loại câu hỏi
function getQuestionTypeIcon(type: string): string {
  const iconMap: {[key: string]: string} = {
    'multiple-choice': '🔴',
    'true-false': '✅',
    'short-answer': '✏️',
    'matching': '🔀',
    'essay': '📝',
    'unknown': '❓'
  };
  return iconMap[type] || '❓';
}

// Hàm helper hiển thị màu sắc cho đáp án đúng
function getAnswerTypeColor(type: string): string {
  const colorMap: {[key: string]: string} = {
    'multiple-choice': 'bg-blue-500/15 text-blue-600',
    'true-false': 'bg-green-500/15 text-green-600',
    'short-answer': 'bg-yellow-500/15 text-yellow-600',
    'matching': 'bg-purple-500/15 text-purple-600',
    'essay': 'bg-red-500/15 text-red-600',
    'unknown': 'bg-gray-500/15 text-gray-600'
  };
  return colorMap[type] || 'bg-green-500/15 text-green-600';
}

// Hàm helper hiển thị màu sắc nổi bật đáp án đúng
function getAnswerHighlightColor(type: string): string {
  const colorMap: {[key: string]: string} = {
    'multiple-choice': 'bg-blue-50/10',
    'true-false': 'bg-green-50/10',
    'short-answer': 'bg-yellow-50/10',
    'matching': 'bg-purple-50/10',
    'essay': 'bg-red-50/10',
    'unknown': 'bg-gray-50/10'
  };
  return colorMap[type] || 'bg-green-50/10';
}