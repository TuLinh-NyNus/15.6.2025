import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { QuestionFormData, QuestionAnswer } from "./types/question";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Kiểm tra cú pháp LaTeX của câu hỏi
 * @param content Nội dung LaTeX
 * @returns Có hợp lệ hay không và thông báo lỗi nếu có
 */
export function validateLatexQuestion(questionData: QuestionFormData) {
  const errors = [];

  // Kiểm tra các trường bắt buộc
  if (!questionData.content) {
    errors.push("Nội dung câu hỏi không được để trống");
  }

  if (!questionData.type) {
    errors.push("Loại câu hỏi không được để trống");
  }

  if (!questionData.questionID?.fullId) {
    errors.push("ID câu hỏi không được để trống");
  }

  // Kiểm tra đáp án cho câu hỏi trắc nghiệm
  if (questionData.type === 'multiple-choice') {
    if (!Array.isArray(questionData.answers) || questionData.answers.length === 0) {
      errors.push("Câu hỏi trắc nghiệm phải có ít nhất một đáp án");
    } else {
      const hasCorrectAnswer = questionData.answers.some((answer: QuestionAnswer) => answer.isCorrect);
      if (!hasCorrectAnswer) {
        errors.push("Câu hỏi trắc nghiệm phải có ít nhất một đáp án đúng");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format ngày tháng theo định dạng cụ thể
 * @param date Ngày cần format (string hoặc Date)
 * @param formatStr Định dạng (mặc định: dd/MM/yyyy)
 * @returns Chuỗi ngày đã format
 */
export function formatDate(date: string | Date, formatStr = 'dd/MM/yyyy'): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: vi });
  } catch (error) {
    console.error('Error formatting date:', error);
    return typeof date === 'string' ? date : date.toString();
  }
}