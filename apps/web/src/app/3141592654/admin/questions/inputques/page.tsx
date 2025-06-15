'use client';

import { ArrowLeft, Save, Loader2, FileCode, FileDigit, BookOpen, Download, FileInput } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Khai báo kiểu cho window để thêm thuộc tính latexParseTimeout
declare global {
  interface Window {
    latexParseTimeout: ReturnType<typeof setTimeout>;
  }
}

import { LatexSamples } from '@/components/questions/LatexSamples';
import { QuestionFormTabs, QuestionFormData } from '@/components/questions/QuestionFormTabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import logger from '@/lib/utils/logger';

// Trang quản lý câu hỏi
export default function InputQuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = searchParams.get('id');
  const isEditMode = !!questionId;
  const { toast } = useToast();

  const [latexInput, setLatexInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [latexResult, setLatexResult] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [latexError, setLatexError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<string>('latex'); // 'latex' hoặc 'doc'
  const [showSamples, setShowSamples] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Khởi tạo form data với đầy đủ các trường
  const [formData, setFormData] = useState<QuestionFormData>({
    // Thông tin cơ bản
    rawContent: '',
    content: '',
    type: 'MC',
    solution: '',
    source: '',
    tags: [],

    // Đáp án
    answers: [],
    correctAnswer: [],

    // Định danh - Subcount
    subcount: {
      prefix: 'SC',
      number: '',
      fullId: '',
    },

    // Định danh - QuestionID
    questionID: {
      format: 'standard',
      fullId: '',
      grade: {
        value: '',
        description: '',
      },
      subject: {
        value: '',
        description: '',
      },
      chapter: {
        value: '',
        description: '',
      },
      level: {
        value: '',
        description: '',
      },
      lesson: {
        value: '',
        description: '',
      },
      form: {
        value: '',
        description: '',
      },
    },

    // Hình ảnh
    images: {
      questionImage: null,
      solutionImage: null,
    },

    // Metadata
    creator: {
      id: "admin",
      name: "Tú",
    },
    status: {
      code: 'draft',
      lastUpdated: new Date().toISOString(),
    },
    usageCount: 0,
    examRefs: [],
    usageHistory: [],
    feedback: {
      count: 0,
      averageDifficulty: 3,
      clarity: 3,
      correctnessRate: 0,
      feedbackCount: 0,
      comments: [],
    },
  });

  // Hàm chuẩn hóa dữ liệu câu hỏi từ API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeQuestionData = (questionData: any): QuestionFormData => {
    // Tạo đối tượng cơ bản
    return {
      // Thông tin cơ bản
      rawContent: questionData.rawContent || questionData.raw_content || questionData.content || '',
      content: questionData.content || '',
      type: questionData.type || 'MC',
      solution: questionData.solution || '',
      source: questionData.source || '',
      tags: questionData.tags || [],

      // Định danh - Subcount
      subcount: questionData.subcount || {
        prefix: 'SC',
        number: '',
        fullId: '',
      },

      // Định danh - QuestionID
      questionID: {
        format: questionData.questionID?.format || 'standard',
        fullId: questionData.questionID?.fullId || '',
        grade: questionData.questionID?.grade || {
          value: '',
          description: '',
        },
        subject: questionData.questionID?.subject || {
          value: '',
          description: '',
        },
        chapter: questionData.questionID?.chapter || null,
        level: questionData.questionID?.level || questionData.questionID?.difficulty || {
          value: '',
          description: '',
        },
        lesson: questionData.questionID?.lesson || null,
        form: questionData.questionID?.form || {
          value: '',
          description: '',
        },
      },

      // Các thông tin khác
      images: questionData.images || {
        questionImage: null,
        solutionImage: null,
      },
      creator: questionData.creator || {
        id: "admin",
        name: "Tú",
      },
      status: questionData.status || {
        code: 'draft',
        lastUpdated: new Date().toISOString(),
      },
      usageCount: questionData.usageCount || 0,
      examRefs: questionData.examRefs || [],
      usageHistory: questionData.usageHistory || [],
      feedback: questionData.feedback || {
        count: 0,
        averageDifficulty: 3,
        clarity: 3,
        correctnessRate: 0,
        feedbackCount: 0,
        comments: [],
      }
    };
  };

  // Tải dữ liệu câu hỏi nếu đang ở chế độ chỉnh sửa hoặc khôi phục bản nháp
  useEffect(() => {
    async function loadQuestionData() {
      // Kiểm tra bản nháp trong localStorage nếu không phải chế độ chỉnh sửa
      if (!questionId) {
        try {
          // Kiểm tra xem có bản nháp trong localStorage không
          const draftQuestion = localStorage.getItem('draft_question');
          if (draftQuestion) {
            const parsedDraft = JSON.parse(draftQuestion);
            logger.debug('Tìm thấy bản nháp câu hỏi:', parsedDraft);

            // Hỏi người dùng có muốn khôi phục bản nháp không
            const confirmRestore = window.confirm('Tìm thấy bản nháp câu hỏi chưa lưu. Bạn có muốn khôi phục không?');

            if (confirmRestore) {
              // Khôi phục dữ liệu form và nội dung LaTeX
              setFormData(parsedDraft);
              if (parsedDraft.rawContent || parsedDraft.raw_content) {
                setLatexInput(parsedDraft.rawContent || parsedDraft.raw_content);
                setLatexResult(parsedDraft.rawContent || parsedDraft.raw_content);
              }

              toast({
                title: "Khôi phục thành công",
                description: "Bản nháp câu hỏi đã được khôi phục.",
              });

              // Xóa bản nháp sau khi khôi phục
              localStorage.removeItem('draft_question');
            } else {
              // Xóa bản nháp nếu người dùng không muốn khôi phục
              localStorage.removeItem('draft_question');
            }
          }
        } catch (error) {
          logger.error('Lỗi khi khôi phục bản nháp:', error);
        }
        return;
      }

      // Nếu đang ở chế độ chỉnh sửa, tải dữ liệu câu hỏi từ API
      try {
        setIsLoadingQuestion(true);
        setError('');

        // Gọi API để lấy thông tin câu hỏi
        const response = await fetch(`/api/admin/questions/${questionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Không thể tải câu hỏi: ${errorData.message || 'Lỗi không xác định'}`);
        }

        const result = await response.json();
        logger.debug('Dữ liệu câu hỏi đã tải:', result);

        if (!result.data?.question) {
          throw new Error('Không tìm thấy dữ liệu câu hỏi');
        }

        // Chuẩn hóa dữ liệu câu hỏi trước khi cập nhật state
        const normalizedData = normalizeQuestionData(result.data.question);
        setFormData(normalizedData);

        // Nếu có nội dung raw, cập nhật vào ô nhập LaTeX
        if (result.data.question.rawContent || result.data.question.raw_content) {
          setLatexInput(result.data.question.rawContent || result.data.question.raw_content);
          setLatexResult(result.data.question.rawContent || result.data.question.raw_content);
        }

        toast({
          title: "Tải câu hỏi thành công",
          description: "Dữ liệu câu hỏi đã được tải. Bạn có thể chỉnh sửa và lưu lại.",
        });
      } catch (error) {
        logger.error('Lỗi khi tải dữ liệu câu hỏi:', error);
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải câu hỏi';
        setError(errorMessage);
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoadingQuestion(false);
      }
    }

    loadQuestionData();
  }, [questionId, toast]);

  // Xử lý khi người dùng nhấn LaTeX
  const handleLatexParse = async () => {
    if (!latexInput.trim()) {
      setError('Vui lòng nhập nội dung LaTeX');
      return;
    }

    // Tránh phân tích khi đang xử lý
    if (isLoading) return;

    setIsLoading(true);
    setError('');
    setLatexError(null);

    try {
      // Giảm thời gian mô phỏng để trải nghiệm người dùng tốt hơn
      await new Promise(resolve => setTimeout(resolve, 300));

      // Thiết lập latexResult và tự động phân tích
      setLatexResult(latexInput);
      setShowSamples(false);
      setSuccess('Đã phân tích LaTeX thành công!');
    } catch (error) {
      logger.error('Lỗi khi phân tích LaTeX:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi phân tích LaTeX. Vui lòng thử lại.');
    } finally {
      // Đảm bảo luôn reset trạng thái loading
      setIsLoading(false);
    }
  };

  // Hàm an toàn để cập nhật form data
  const safelyUpdateFormData: React.Dispatch<React.SetStateAction<QuestionFormData>> = (value) => {
    // Sử dụng setTimeout để đảm bảo cập nhật xảy ra trong một tick riêng biệt
    // Giúp tránh vòng lặp vô hạn và lỗi Maximum update depth exceeded
    setTimeout(async () => {
      if (typeof value === 'function') {
        // Nếu value là một function
        try {
          // Kiểm tra xem value có phải là async function không
          const valueResult = value(formData);

          // Nếu valueResult là Promise, chờ nó hoàn thành
          const newState = valueResult instanceof Promise ? await valueResult : valueResult;

          // Đảm bảo cả raw_content và rawContent đều được cập nhật
          if (newState.raw_content && !newState.rawContent) {
            newState.rawContent = newState.raw_content;
          }

          // Cập nhật state với kết quả đã xử lý
          setFormData(newState);

          // Log để debug
          console.log('Form data đã được cập nhật (function):', {
            content: newState.content?.substring(0, 50) + '...',
            answers: newState.answers?.length || 0,
            questionID: newState.questionID?.fullId,
            formData: JSON.stringify(newState).substring(0, 200) + '...'
          });
        } catch (error) {
          console.error('Lỗi khi cập nhật form data:', error);
        }
      } else {
        // Nếu value là một object
        try {
          // Đảm bảo cả raw_content và rawContent đều được cập nhật
          const newValue = { ...value };

          // Không cần xử lý raw_content vì interface đã thống nhất sử dụng rawContent

          setFormData(prevData => {
            const updatedData = {
              ...prevData,
              ...newValue
            };

            return updatedData;
          });

          // Log để debug
          console.log('Form data đã được cập nhật (object):', {
            content: newValue.content?.substring(0, 50) + '...',
            answers: newValue.answers?.length || 0,
            questionID: newValue.questionID?.fullId,
            formData: JSON.stringify(newValue).substring(0, 200) + '...'
          });
        } catch (error) {
          console.error('Lỗi khi cập nhật form data:', error);
        }
      }
    }, 0);
  };

  // Hàm xử lý lưu câu hỏi vào CSDL
  const saveQuestionToDatabase = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setSaveMessage('');

    // Validate dữ liệu cơ bản
    if (!formData.content) {
      setSaveStatus('error');
      setSaveMessage('Nội dung câu hỏi không được để trống');
      setIsSaving(false);
      return;
    }

    if (!formData.type) {
      setSaveStatus('error');
      setSaveMessage('Loại câu hỏi không được để trống');
      setIsSaving(false);
      return;
    }

    // Không cần kiểm tra đáp án nữa vì đã xóa phần nhập đáp án

    // Log dữ liệu câu hỏi để debug
    logger.debug('Dữ liệu câu hỏi cần lưu:', {
      content: formData.content.substring(0, 50) + '...',
      type: formData.type,
      hasRawContent: !!formData.rawContent,
      hasSolution: !!formData.solution
    });

    try {
      // Sử dụng route API local của Next.js
      const apiEndpoint = isEditMode
        ? `/api/admin/questions/direct/${questionId}`
        : '/api/admin/questions/direct';

      logger.debug(`${isEditMode ? 'Cập nhật' : 'Thêm mới'} câu hỏi qua ${apiEndpoint}...`);

      // Sử dụng route API của Next.js
      const apiResponse = await fetch(apiEndpoint, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      logger.debug('Phản hồi từ API:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        logger.debug(`Kết quả ${isEditMode ? 'cập nhật' : 'thêm mới'} câu hỏi:`, result);

        setSaveStatus('success');
        setSaveMessage(`${isEditMode ? 'Cập nhật' : 'Lưu'} câu hỏi thành công! ID: ${result.data?.question?._id || 'N/A'}`);
        setSuccess(`Câu hỏi đã được ${isEditMode ? 'cập nhật' : 'lưu'} thành công!`);

        // Lưu câu hỏi vào localStorage
        try {
          // Lấy danh sách câu hỏi hiện tại
          const savedQuestions = JSON.parse(localStorage.getItem('savedQuestions') || '[]');

          // Thêm câu hỏi mới vào danh sách
          savedQuestions.push(result.data.question);

          // Lưu lại vào localStorage
          localStorage.setItem('savedQuestions', JSON.stringify(savedQuestions));

          console.log(`Đã lưu câu hỏi vào localStorage với ID: ${result.data?.question?._id || 'N/A'}`);
        } catch (e) {
          console.error('Không thể lưu vào localStorage:', e);
        }

        // Không chuyển hướng, giữ người dùng ở trang nhập câu hỏi
        // Thêm thông báo để người dùng biết đã lưu thành công
        toast({
          title: "Thành công",
          description: `Câu hỏi đã được ${isEditMode ? 'cập nhật' : 'lưu'} thành công! Bạn có thể tiếp tục nhập câu hỏi mới.`,
          variant: "success"
        });

        // Nếu không phải chế độ chỉnh sửa, reset form để nhập câu hỏi mới
        if (!isEditMode) {
          // Tạo một bản sao của ID người tạo để giữ lại thông tin người dùng
          const creatorInfo = { ...formData.creator };

          // Reset form về trạng thái ban đầu
          setFormData({
            // Thông tin cơ bản
            rawContent: '',
            content: '',
            type: 'MC',
            solution: '',
            source: '',
            tags: [],

            // Đáp án
            answers: [],
            correctAnswer: [],

            // Định danh - Subcount
            subcount: {
              prefix: 'SC',
              number: '',
              fullId: '',
            },

            // Định danh - QuestionID
            questionID: {
              format: 'standard',
              fullId: '',
              grade: {
                value: '',
                description: '',
              },
              subject: {
                value: '',
                description: '',
              },
              chapter: {
                value: '',
                description: '',
              },
              level: {
                value: '',
                description: '',
              },
              lesson: {
                value: '',
                description: '',
              },
              form: {
                value: '',
                description: '',
              },
            },

            // Hình ảnh
            images: {
              questionImage: null,
              solutionImage: null,
            },

            // Metadata - giữ lại thông tin người tạo
            creator: creatorInfo,
            status: {
              code: 'draft',
              lastUpdated: new Date().toISOString(),
            },
            usageCount: 0,
            examRefs: [],
            usageHistory: [],
            feedback: {
              count: 0,
              averageDifficulty: 3,
              clarity: 3,
              correctnessRate: 0,
              feedbackCount: 0,
              comments: [],
            },
          });

          // Reset các state khác
          setLatexInput('');
          setLatexResult(null);

          // Xóa thông báo thành công sau 3 giây để tránh nhầm lẫn với câu hỏi mới
          setTimeout(() => {
            setSuccess('');
            setSaveStatus('idle');
            setSaveMessage('');
          }, 3000);
        }

        return;
      }

      // Xử lý lỗi từ API
      const errorData = await apiResponse.json();
      throw new Error(`Không thể ${isEditMode ? 'cập nhật' : 'lưu'} câu hỏi: ${errorData.message || errorData.error || 'Lỗi không xác định'}`);
    } catch (error) {
      logger.error('Lỗi tổng thể khi lưu câu hỏi:', error);
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu câu hỏi');
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu câu hỏi');
      setIsSaving(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý khi người dùng lưu câu hỏi
  const handleSaveQuestion = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Gọi hàm lưu thực tế thay vì mô phỏng
      await saveQuestionToDatabase();

      // Các xử lý thành công đã được xử lý trong saveQuestionToDatabase
    } catch (error) {
      logger.error('Lỗi khi lưu câu hỏi:', error);

      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = 'Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại.';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Xử lý các lỗi cụ thể
        if (error.message.includes('xác thực') || error.message.includes('auth')) {
          errorMessage = 'Lỗi xác thực: Bạn cần đăng nhập lại để tiếp tục. Hệ thống sẽ tự động lưu câu hỏi của bạn.';

          // Lưu câu hỏi vào localStorage để khôi phục sau
          try {
            localStorage.setItem('draft_question', JSON.stringify(formData));
          } catch (e) {
            logger.error('Lỗi khi lưu bản nháp:', e);
          }
        }
      }

      setError(errorMessage);
      setIsSaving(false);

      // Hiển thị toast thông báo
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Xử lý khi xuất JSON
  const handleExportJSON = () => {
    try {
      // Tạo file JSON
      const dataStr = JSON.stringify(formData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      // Tạo link tải xuống
      const exportFileDefaultName = `question_${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      logger.error('Lỗi khi xuất JSON:', error);
      setError('Có lỗi xảy ra khi xuất JSON');
    }
  };

  // Xử lý khi người dùng chọn mẫu LaTeX
  const handleSelectSample = async (sample: string) => {
    // Đặt lại các state
    setIsLoading(false);
    setError('');
    setLatexError(null);

    // Cập nhật input và kích hoạt phân tích
    setLatexInput(sample);
    setShowSamples(false); // Ẩn mẫu sau khi chọn

    // Tự động phân tích mẫu đã chọn ngay lập tức
    setLatexResult(sample);

    // Hiển thị thông báo thành công
    setSuccess('Đã chọn mẫu LaTeX. Đang phân tích...');

    try {
      // Trực tiếp trích xuất và áp dụng dữ liệu vào form
      const { extractFromLatex } = await import('@/lib/utils/latex-parser');
      const result = extractFromLatex(sample);

      // Trước tiên, xử lý các thông tin cơ bản không cần async
      const newFormData: Partial<QuestionFormData> = {
        // 1. Cập nhật thông tin cơ bản
        rawContent: result.rawContent,
        content: result.content,
        // Đảm bảo type là một trong các giá trị hợp lệ (MC, TF, SA, MA, ES)
        type: result.type === 'multiple-choice' ? 'MC' :
              result.type === 'true-false' ? 'TF' :
              result.type === 'short-answer' ? 'SA' :
              result.type === 'matching' ? 'MA' :
              result.type === 'essay' ? 'ES' :
              result.type,

        // 2. Cập nhật nguồn và lời giải
        source: result.source || '',
        solution: result.solution || '',

        // 3. Cập nhật đáp án
        answers: result.answers?.map(answer => ({
          id: answer.id,
          content: answer.content,
          isCorrect: answer.isCorrect
        })) || []
      };

      // Cập nhật correctAnswer dựa trên loại câu hỏi
      if (result.type === 'multiple-choice') {
        // Đối với câu hỏi trắc nghiệm (MC), chỉ có một đáp án đúng
        if (result.answers && result.answers.length > 0) {
          const correctAnswer = result.answers.find(answer => answer.isCorrect);
          if (correctAnswer) {
            newFormData.correctAnswer = [correctAnswer.content]; // Lưu dưới dạng mảng để phù hợp với API
          }
        }
      } else if (result.type === 'true-false') {
        // Đối với câu hỏi đúng/sai (TF), có thể có nhiều đáp án đúng
        if (result.answers && result.answers.length > 0) {
          const correctAnswers = result.answers
            .filter(answer => answer.isCorrect)
            .map(answer => answer.content);

          newFormData.correctAnswer = correctAnswers;
        }
      } else if (result.type === 'short-answer') {
        // Đối với câu hỏi trả lời ngắn (SA), correctAnswer là một mảng với một phần tử
        if (result.correctAnswer) {
          newFormData.correctAnswer = Array.isArray(result.correctAnswer)
            ? result.correctAnswer
            : [result.correctAnswer];
        }
      } else if (result.type === 'matching') {
        // Đối với câu hỏi ghép đôi (MA), correctAnswer là một mảng
        if (Array.isArray(result.correctAnswer)) {
          newFormData.correctAnswer = result.correctAnswer;
        } else if (result.correctAnswer) {
          newFormData.correctAnswer = [result.correctAnswer];
        }
      } else {
        // Đối với câu hỏi tự luận (ES), correctAnswer là một mảng với một phần tử hoặc rỗng
        newFormData.correctAnswer = result.correctAnswer
          ? (Array.isArray(result.correctAnswer) ? result.correctAnswer : [result.correctAnswer])
          : [];
      }

      // 4. Cập nhật Subcount nếu có
      if (result.subcount) {
        newFormData.subcount = result.subcount;
      }

      // 5. Cập nhật thông tin QuestionID cơ bản
      if (result.questionIdDetails) {
        const details = result.questionIdDetails;

        if (details.fullId) {
          newFormData.questionID = {
            ...formData.questionID,
            fullId: details.fullId,
            format: details.fullId.length > 5 ? 'ID6' : 'ID5'
          };

          // Cập nhật các thông tin cơ bản từ details
          if (details.grade) {
            newFormData.questionID.grade = {
              value: details.grade,
              description: ''
            };
          }

          if (details.subject) {
            newFormData.questionID.subject = {
              value: details.subject,
              description: ''
            };
          }

          if (details.chapter) {
            newFormData.questionID.chapter = {
              value: details.chapter,
              description: ''
            };
          }

          if (details.level) {
            newFormData.questionID.level = {
              value: details.level,
              description: ''
            };
          }

          if (details.lesson) {
            newFormData.questionID.lesson = {
              value: details.lesson,
              description: ''
            };
          }

          if (details.type) {
            newFormData.questionID.form = {
              value: details.type,
              description: ''
            };
          }

          // Cập nhật form data với thông tin cơ bản trước
          safelyUpdateFormData(prev => ({ ...prev, ...newFormData }));

          // Sau đó, thực hiện giải mã MapID bất đồng bộ
          (async () => {
            try {
              const { decodeMapID } = await import('@/lib/utils/mapid-decoder');
              const mapIDResult = await decodeMapID(details.fullId);

              if (mapIDResult) {
                // Tạo một bản cập nhật mới chỉ cho phần questionID
                const questionIDUpdate: Partial<QuestionFormData> = {
                  questionID: { ...formData.questionID }
                };

                // Đảm bảo questionID tồn tại
                if (questionIDUpdate.questionID) {
                  // Cập nhật ý nghĩa của từng tham số
                  if (mapIDResult.grade) {
                    questionIDUpdate.questionID.grade = {
                      value: details.grade || mapIDResult.grade.code,
                      description: mapIDResult.grade.description
                    };
                  }

                  if (mapIDResult.subject) {
                    questionIDUpdate.questionID.subject = {
                      value: details.subject || mapIDResult.subject.code,
                      description: mapIDResult.subject.description
                    };
                  }

                  if (mapIDResult.chapter) {
                    questionIDUpdate.questionID.chapter = {
                      value: details.chapter || mapIDResult.chapter.code,
                      description: mapIDResult.chapter.description
                    };
                  }

                  if (mapIDResult.difficulty) {
                    questionIDUpdate.questionID.level = {
                      value: details.level || mapIDResult.difficulty.code,
                      description: mapIDResult.difficulty.description
                    };
                  }

                  if (mapIDResult.lesson) {
                    questionIDUpdate.questionID.lesson = {
                      value: details.lesson || mapIDResult.lesson.code,
                      description: mapIDResult.lesson.description
                    };
                  }

                  if (mapIDResult.form) {
                    questionIDUpdate.questionID.form = {
                      value: details.type || mapIDResult.form.code,
                      description: mapIDResult.form.description
                    };
                  }
                }

                // Cập nhật form data với thông tin từ MapID
                safelyUpdateFormData(prev => ({ ...prev, ...questionIDUpdate }));
              }
            } catch (error) {
              console.error('Lỗi khi giải mã MapID:', error);
            }
          })();
        } else {
          // Nếu không có fullId, chỉ cập nhật thông tin cơ bản
          safelyUpdateFormData(prev => ({ ...prev, ...newFormData }));
        }
      } else {
        // Nếu không có questionIdDetails, chỉ cập nhật thông tin cơ bản
        safelyUpdateFormData(prev => ({ ...prev, ...newFormData }));
      }

      // Cập nhật thông báo thành công
      setSuccess('Đã trích xuất thông tin từ mẫu thành công!');
    } catch (error) {
      console.error('Lỗi khi trích xuất từ mẫu:', error);
      // Fallback: Cập nhật rawContent và content trong form
      safelyUpdateFormData(prev => ({
        ...prev,
        rawContent: sample,
        content: sample
          .replace(/\\begin\{.*?\}/g, '')
          .replace(/\\end\{.*?\}/g, '')
          .replace(/\\item/g, '')
          .trim()
      }));
    }

    // Xóa thông báo thành công sau 2 giây
    setTimeout(() => {
      setSuccess('');
    }, 2000);
  };

  // Chuyển đổi phương thức nhập
  const handleInputMethodChange = (method: string) => {
    setInputMethod(method);
  };

  // Hiển thị/ẩn mẫu LaTeX
  const toggleSamples = () => {
    setShowSamples(!showSamples);
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      {/* Header với nút back và lưu */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="icon"
            className="bg-nynus-cream dark:bg-slate-800/50 border-primary-terracotta/20 dark:border-slate-700 text-nynus-dark dark:text-white hover:bg-nynus-silver dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-nynus-dark dark:text-white transition-colors duration-300">{isEditMode ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="flex items-center gap-2 text-nynus-dark dark:text-white bg-nynus-cream dark:bg-slate-800/50 border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105"
          >
            <Download className="h-4 w-4" />
            Xuất JSON
          </Button>
          <Button
            onClick={() => router.push('/3141592654/admin/questions/inputauto')}
            variant="outline"
            className="flex items-center gap-2 text-nynus-dark dark:text-white bg-nynus-cream dark:bg-slate-800/50 border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105"
          >
            <FileInput className="h-4 w-4" />
            Nhập hàng loạt
          </Button>
          <Button
            onClick={handleSaveQuestion}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary-gold hover:bg-primary-sienna text-nynus-dark hover:text-nynus-light transition-colors duration-300 hover:scale-105"
          >
            {isSaving ?
              <Loader2 className="h-4 w-4 animate-spin" /> :
              <Save className="h-4 w-4" />
            }
            {isSaving ? 'Đang lưu...' : 'Lưu câu hỏi'}
          </Button>
        </div>
      </div>

      {/* Thông báo lỗi và thành công */}
      {error && (
        <div className="p-4 bg-primary-pink/20 dark:bg-red-500/20 border border-primary-sienna/30 dark:border-red-500/30 rounded-lg text-primary-sienna dark:text-red-400 mb-6 transition-colors duration-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-nynus-jade dark:bg-green-500/20 border border-primary-gold/30 dark:border-green-500/30 rounded-lg text-primary-terracotta dark:text-green-400 mb-6 flex justify-between items-center transition-colors duration-300">
          <div>{success}</div>
          {!isEditMode && (
            <Button
              onClick={() => {
                // Reset form về trạng thái ban đầu
                const creatorInfo = { ...formData.creator };

                setFormData({
                  // Thông tin cơ bản
                  rawContent: '',
                  content: '',
                  type: 'MC',
                  solution: '',
                  source: '',
                  tags: [],

                  // Đáp án
                  answers: [],
                  correctAnswer: [],

                  // Định danh - Subcount
                  subcount: {
                    prefix: 'SC',
                    number: '',
                    fullId: '',
                  },

                  // Định danh - QuestionID
                  questionID: {
                    format: 'standard',
                    fullId: '',
                    grade: {
                      value: '',
                      description: '',
                    },
                    subject: {
                      value: '',
                      description: '',
                    },
                    chapter: {
                      value: '',
                      description: '',
                    },
                    level: {
                      value: '',
                      description: '',
                    },
                    lesson: {
                      value: '',
                      description: '',
                    },
                    form: {
                      value: '',
                      description: '',
                    },
                  },

                  // Hình ảnh
                  images: {
                    questionImage: null,
                    solutionImage: null,
                  },

                  // Metadata - giữ lại thông tin người tạo
                  creator: creatorInfo,
                  status: {
                    code: 'draft',
                    lastUpdated: new Date().toISOString(),
                  },
                  usageCount: 0,
                  examRefs: [],
                  usageHistory: [],
                  feedback: {
                    count: 0,
                    averageDifficulty: 3,
                    clarity: 3,
                    correctnessRate: 0,
                    feedbackCount: 0,
                    comments: [],
                  },
                });

                // Reset các state khác
                setLatexInput('');
                setLatexResult(null);
                setSuccess('');
                setSaveStatus('idle');
                setSaveMessage('');
              }}
              variant="outline"
              size="sm"
              className="bg-primary-gold/20 dark:bg-green-500/10 hover:bg-primary-gold/30 dark:hover:bg-green-500/20 border-primary-gold/30 dark:border-green-500/30 text-primary-terracotta dark:text-green-400 transition-colors duration-300 hover:scale-105"
            >
              Thêm câu hỏi mới
            </Button>
          )}
        </div>
      )}

      {/* Phương thức nhập */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <Button
            variant={inputMethod === 'latex' ? 'default' : 'outline'}
            onClick={() => handleInputMethodChange('latex')}
            className={`flex items-center gap-2 transition-colors duration-300 hover:scale-105 ${
              inputMethod === 'latex'
                ? 'bg-primary-gold hover:bg-primary-sienna text-nynus-dark'
                : 'bg-nynus-cream dark:bg-slate-800/50 border-primary-terracotta/20 dark:border-slate-700 text-nynus-dark dark:text-white hover:bg-nynus-silver dark:hover:bg-slate-700/50'
            }`}
          >
            <FileCode className="h-4 w-4" />
            Nhập từ LaTeX
          </Button>
          <Button
            variant={inputMethod === 'doc' ? 'default' : 'outline'}
            onClick={() => handleInputMethodChange('doc')}
            className={`flex items-center gap-2 transition-colors duration-300 hover:scale-105 ${
              inputMethod === 'doc'
                ? 'bg-primary-gold hover:bg-primary-sienna text-nynus-dark'
                : 'bg-nynus-cream dark:bg-slate-800/50 border-primary-terracotta/20 dark:border-slate-700 text-nynus-dark dark:text-white hover:bg-nynus-silver dark:hover:bg-slate-700/50'
            }`}
          >
            <FileDigit className="h-4 w-4" />
            Nhập từ Doc
          </Button>
        </div>
      </div>

      {/* Nội dung chính */}
      {inputMethod === 'latex' && (
        <div className="space-y-6">
          {/* Phần nhập LaTeX */}
          <Card className="bg-nynus-jade dark:bg-slate-950 border-primary-terracotta/20 dark:border-slate-800 mb-6 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-nynus-dark dark:text-white transition-colors duration-300">Nhập nội dung LaTeX</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-nynus-dark dark:text-white bg-nynus-cream dark:bg-slate-800/50 border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700/50 transition-colors duration-300 hover:scale-105"
                  onClick={toggleSamples}
                >
                  {showSamples ? 'Ẩn mẫu' : 'Xem mẫu'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showSamples ? (
                <LatexSamples onSelectSample={handleSelectSample} />
              ) : (
                <>
                  <Textarea
                    id="latex-input"
                    value={latexInput}
                    className="font-mono bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 h-[600px] resize-none transition-colors duration-300"
                    onChange={(e) => {
                      setLatexInput(e.target.value);
                      // Tự động phân tích khi người dùng nhập, nhưng có độ trễ để tránh phân tích quá nhiều
                      if (e.target.value.trim()) {
                        // Sử dụng setTimeout để tránh phân tích quá nhiều khi người dùng đang gõ
                        clearTimeout(window.latexParseTimeout);
                        window.latexParseTimeout = setTimeout(async () => {
                          setLatexResult(e.target.value);
                          setShowSamples(false);

                          try {
                            // Trực tiếp trích xuất và áp dụng dữ liệu vào form
                            const { extractFromLatex } = await import('@/lib/utils/latex-parser');
                            const result = extractFromLatex(e.target.value);

                            // Trước tiên, xử lý các thông tin cơ bản không cần async
                            const newFormData: Partial<QuestionFormData> = {
                              // 1. Cập nhật thông tin cơ bản
                              rawContent: result.rawContent,
                              content: result.content,

                              // Đảm bảo type là một trong các giá trị hợp lệ (MC, TF, SA, MA, ES)
                              type: result.type === 'multiple-choice' ? 'MC' :
                                    result.type === 'true-false' ? 'TF' :
                                    result.type === 'short-answer' ? 'SA' :
                                    result.type === 'matching' ? 'MA' :
                                    result.type === 'essay' ? 'ES' :
                                    result.type,

                              // 2. Cập nhật nguồn và lời giải
                              source: result.source || '',
                              solution: result.solution || '',

                              // 3. Cập nhật đáp án
                              answers: result.answers?.map(answer => ({
                                id: answer.id,
                                content: answer.content,
                                isCorrect: answer.isCorrect
                              })) || []
                            };

                            // Cập nhật correctAnswer dựa trên loại câu hỏi
                            if (result.type === 'multiple-choice') {
                              // Đối với câu hỏi trắc nghiệm (MC), chỉ có một đáp án đúng
                              if (result.answers && result.answers.length > 0) {
                                const correctAnswer = result.answers.find(answer => answer.isCorrect);
                                if (correctAnswer) {
                                  newFormData.correctAnswer = [correctAnswer.content]; // Đảm bảo là mảng
                                }
                              }
                            } else if (result.type === 'true-false') {
                              // Đối với câu hỏi đúng/sai (TF), có thể có nhiều đáp án đúng
                              if (result.answers && result.answers.length > 0) {
                                const correctAnswers = result.answers
                                  .filter(answer => answer.isCorrect)
                                  .map(answer => answer.content);

                                newFormData.correctAnswer = correctAnswers; // Đã là mảng
                              }
                            } else if (result.type === 'short-answer') {
                              // Đối với câu hỏi trả lời ngắn (SA), correctAnswer phải là mảng
                              if (result.correctAnswer) {
                                newFormData.correctAnswer = Array.isArray(result.correctAnswer)
                                  ? result.correctAnswer
                                  : [result.correctAnswer]; // Đảm bảo là mảng
                              }
                            } else if (result.type === 'matching') {
                              // Đối với câu hỏi ghép đôi (MA), correctAnswer là một mảng
                              if (Array.isArray(result.correctAnswer)) {
                                newFormData.correctAnswer = result.correctAnswer; // Đã là mảng
                              } else if (result.correctAnswer) {
                                newFormData.correctAnswer = [result.correctAnswer]; // Đảm bảo là mảng
                              }
                            } else {
                              // Đối với câu hỏi tự luận (ES), correctAnswer phải là mảng
                              newFormData.correctAnswer = result.correctAnswer
                                ? (Array.isArray(result.correctAnswer) ? result.correctAnswer : [result.correctAnswer])
                                : []; // Đảm bảo là mảng
                            }

                            // 4. Cập nhật Subcount nếu có
                            if (result.subcount) {
                              newFormData.subcount = result.subcount;
                            }

                            // 5. Cập nhật thông tin QuestionID cơ bản
                            if (result.questionIdDetails) {
                              const details = result.questionIdDetails;

                              if (details.fullId) {
                                newFormData.questionID = {
                                  ...formData.questionID,
                                  fullId: details.fullId,
                                  format: details.fullId.length > 5 ? 'ID6' : 'ID5'
                                };

                                // Cập nhật các thông tin cơ bản từ details
                                if (details.grade) {
                                  newFormData.questionID.grade = {
                                    value: details.grade,
                                    description: ''
                                  };
                                }

                                if (details.subject) {
                                  newFormData.questionID.subject = {
                                    value: details.subject,
                                    description: ''
                                  };
                                }

                                if (details.chapter) {
                                  newFormData.questionID.chapter = {
                                    value: details.chapter,
                                    description: ''
                                  };
                                }

                                if (details.level) {
                                  newFormData.questionID.level = {
                                    value: details.level,
                                    description: ''
                                  };
                                }

                                if (details.lesson) {
                                  newFormData.questionID.lesson = {
                                    value: details.lesson,
                                    description: ''
                                  };
                                }

                                if (details.type) {
                                  newFormData.questionID.form = {
                                    value: details.type,
                                    description: ''
                                  };
                                }

                                // Cập nhật form data với thông tin cơ bản trước
                                safelyUpdateFormData(prev => ({ ...prev, ...newFormData }));

                                // Sau đó, thực hiện giải mã MapID bất đồng bộ
                                (async () => {
                                  try {
                                    const { decodeMapID } = await import('@/lib/utils/mapid-decoder');

                                    // Log để debug
                                    console.log('Giải mã MapID cho:', details.fullId);

                                    // Giải mã MapID
                                    const mapIDResult = await decodeMapID(details.fullId);

                                    // Log kết quả giải mã
                                    console.log('Kết quả giải mã MapID:', mapIDResult);

                                    if (mapIDResult) {
                                      // Tạo một bản cập nhật mới chỉ cho phần questionID
                                      const questionIDUpdate: Partial<QuestionFormData> = {
                                        questionID: {
                                          ...formData.questionID,
                                          fullId: details.fullId,
                                          format: mapIDResult.format || (details.fullId.includes('-') ? 'ID6' : 'ID5')
                                        }
                                      };

                                      // Đảm bảo questionID tồn tại
                                      if (questionIDUpdate.questionID) {
                                        // Cập nhật ý nghĩa của từng tham số theo Map ID.tex
                                        // Tham số 1: Lớp (Grade)
                                        if (mapIDResult.grade) {
                                          questionIDUpdate.questionID.grade = {
                                            value: details.grade || mapIDResult.grade.code,
                                            description: mapIDResult.grade.description || 'Lớp'
                                          };
                                        }

                                        // Tham số 2: Môn (Subject)
                                        if (mapIDResult.subject) {
                                          questionIDUpdate.questionID.subject = {
                                            value: details.subject || mapIDResult.subject.code,
                                            description: mapIDResult.subject.description || 'Môn'
                                          };
                                        }

                                        // Tham số 3: Chương (Chapter)
                                        if (mapIDResult.chapter) {
                                          questionIDUpdate.questionID.chapter = {
                                            value: details.chapter || mapIDResult.chapter.code,
                                            description: mapIDResult.chapter.description || 'Chương'
                                          };
                                        }

                                        // Tham số 4: Mức độ (Level)
                                        if (mapIDResult.difficulty) {
                                          questionIDUpdate.questionID.level = {
                                            value: details.level || mapIDResult.difficulty.code,
                                            description: mapIDResult.difficulty.description || 'Mức độ'
                                          };
                                        }

                                        // Tham số 5: Bài (Lesson)
                                        if (mapIDResult.lesson) {
                                          questionIDUpdate.questionID.lesson = {
                                            value: details.lesson || mapIDResult.lesson.code,
                                            description: mapIDResult.lesson.description || 'Bài'
                                          };
                                        }

                                        // Tham số 6: Dạng (Form) - chỉ có trong ID6
                                        if (mapIDResult.form) {
                                          questionIDUpdate.questionID.form = {
                                            value: details.type || mapIDResult.form.code,
                                            description: mapIDResult.form.description || 'Dạng'
                                          };
                                        }
                                      }

                                      // Cập nhật form data với thông tin từ MapID
                                      safelyUpdateFormData(prev => ({ ...prev, ...questionIDUpdate }));

                                      // Log thông tin đã cập nhật
                                      console.log('Đã cập nhật thông tin QuestionID:', questionIDUpdate.questionID);
                                    }
                                  } catch (error) {
                                    console.error('Lỗi khi giải mã MapID:', error);
                                  }
                                })();
                              } else {
                                // Nếu không có fullId, chỉ cập nhật thông tin cơ bản
                                safelyUpdateFormData(prev => ({ ...prev, ...newFormData }));
                              }
                            } else {
                              // Nếu không có questionIdDetails, chỉ cập nhật thông tin cơ bản
                              safelyUpdateFormData(prev => ({ ...prev, ...newFormData }));
                            }

                            // Hiển thị thông báo thành công
                            setSuccess('Đã trích xuất thông tin thành công!');

                            // Log để debug
                            console.log('Trích xuất thành công:', {
                              content: result.content?.substring(0, 50) + '...',
                              type: result.type,
                              answers: result.answers?.length || 0,
                              questionId: result.questionId,
                              answersDetail: result.answers
                            });

                            setTimeout(() => setSuccess(''), 2000);
                          } catch (error) {
                            // Không hiển thị lỗi để tránh làm phiền người dùng
                            console.log('Lỗi khi trích xuất:', error);
                          } finally {
                            // Đảm bảo isAnalyzing là false
                            setIsLoading(false);
                          }
                        }, 500); // Tăng độ trễ lên 500ms để đảm bảo người dùng đã nhập xong
                      }
                    }}
                    placeholder="Nhập nội dung LaTeX ở đây..."
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Không cần component LatexExtractor ẩn nữa vì đã xử lý trực tiếp */}

          <QuestionFormTabs
            formData={formData}
            setFormData={safelyUpdateFormData}
          />
        </div>
      )}

      {/* Tab nhập từ Doc */}
      {inputMethod === 'doc' && (
        <div className="space-y-6">
          <Card className="bg-nynus-jade dark:bg-slate-950 border-primary-terracotta/20 dark:border-slate-800 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-nynus-dark dark:text-white transition-colors duration-300">Nhập câu hỏi từ tài liệu Word</CardTitle>
              <CardDescription className="text-nynus-medium dark:text-slate-400 transition-colors duration-300">
                Tải lên tài liệu Word (.docx) hoặc PDF (.pdf) chứa nội dung câu hỏi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-primary-terracotta/30 dark:border-slate-700 rounded-lg p-10 text-center transition-colors duration-300">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileDigit className="h-10 w-10 text-primary-terracotta/60 dark:text-slate-400 transition-colors duration-300" />
                  <p className="text-sm text-nynus-medium dark:text-slate-400 transition-colors duration-300">
                    Kéo và thả tài liệu vào đây, hoặc
                    <span className="text-primary-sienna dark:text-blue-400 cursor-pointer hover:underline transition-colors duration-300"> chọn tài liệu</span>
                  </p>
                  <p className="text-xs text-nynus-medium/70 dark:text-slate-500 transition-colors duration-300">
                    Hỗ trợ: .docx, .pdf (tối đa 5MB)
                  </p>
                </div>
              </div>

              <div className="text-sm text-nynus-medium dark:text-slate-400 transition-colors duration-300">
                <h4 className="font-medium mb-2">Lưu ý:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tính năng đang trong quá trình phát triển</li>
                  <li>Tài liệu nên được định dạng theo mẫu chuẩn</li>
                  <li>Kết quả trích xuất có thể cần chỉnh sửa thêm</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full bg-primary-terracotta/30 dark:bg-slate-700 text-nynus-dark/70 dark:text-slate-400 transition-colors duration-300">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Chức năng đang được phát triển
              </Button>
            </CardFooter>
          </Card>

          <QuestionFormTabs
            formData={formData}
            setFormData={safelyUpdateFormData}
          />
        </div>
      )}
    </div>
  );
}