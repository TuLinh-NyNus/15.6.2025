"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { QueryKeys, createListQueryKey, createDetailQueryKey } from "@/lib/api/query-keys";
import {
  examService,
  IExamFilterParams,
  ICreateExamRequest,
  IUpdateExamRequest,
} from "@/lib/api/services/exam-service";
import { ApiError } from "@/lib/api/types/api-error";

import { toast } from "./use-toast";

/**
 * Hook để lấy danh sách bài thi
 */
export function useExams(params?: IExamFilterParams) {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.EXAMS, params),
    queryFn: () => examService.getExams(params),
  });
}

/**
 * Hook để lấy chi tiết bài thi
 */
export function useExam(id: string) {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.EXAM, id),
    queryFn: () => examService.getExam(id),
    enabled: !!id,
  });
}

/**
 * Hook để lấy danh sách câu hỏi của bài thi
 */
export function useExamQuestions(examId: string) {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.EXAM_QUESTIONS, { examId }),
    queryFn: () => examService.getExamQuestions(examId),
    enabled: !!examId,
  });
}

/**
 * Hook để tạo bài thi mới
 */
export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateExamRequest) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAMS] });
      toast.success({
        title: "Tạo bài thi thành công",
        description: "Bài thi mới đã được tạo thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Tạo bài thi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi tạo bài thi",
      });
    },
  });
}

/**
 * Hook để cập nhật bài thi
 */
export function useUpdateExam(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateExamRequest) => examService.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAMS] });
      queryClient.invalidateQueries({ queryKey: createDetailQueryKey(QueryKeys.EXAM, id) });
      toast.success({
        title: "Cập nhật bài thi thành công",
        description: "Bài thi đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật bài thi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật bài thi",
      });
    },
  });
}

/**
 * Hook để xóa bài thi
 */
export function useDeleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => examService.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAMS] });
      toast.success({
        title: "Xóa bài thi thành công",
        description: "Bài thi đã được xóa thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Xóa bài thi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa bài thi",
      });
    },
  });
}

/**
 * Hook để thêm câu hỏi vào bài thi
 */
export function useAddQuestionToExam(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => examService.addQuestionToExam(examId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createListQueryKey(QueryKeys.EXAM_QUESTIONS, { examId }) });
      toast.success({
        title: "Thêm câu hỏi thành công",
        description: "Câu hỏi đã được thêm vào bài thi thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Thêm câu hỏi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi thêm câu hỏi vào bài thi",
      });
    },
  });
}

/**
 * Hook để xóa câu hỏi khỏi bài thi
 */
export function useRemoveQuestionFromExam(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => examService.removeQuestionFromExam(examId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createListQueryKey(QueryKeys.EXAM_QUESTIONS, { examId }) });
      toast.success({
        title: "Xóa câu hỏi thành công",
        description: "Câu hỏi đã được xóa khỏi bài thi thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Xóa câu hỏi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa câu hỏi khỏi bài thi",
      });
    },
  });
}

/**
 * Hook để bắt đầu làm bài thi
 */
export function useStartExam() {
  return useMutation({
    mutationFn: (examId: string) => examService.startExam(examId),
    onSuccess: (data) => {
      toast.success({
        title: "Bắt đầu làm bài thi",
        description: "Bạn đã bắt đầu làm bài thi thành công",
      });
      return data;
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Bắt đầu làm bài thi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi bắt đầu làm bài thi",
      });
    },
  });
}

/**
 * Hook để nộp bài thi
 */
export function useSubmitExam(attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: { questionId: string; answer: string }[]) =>
      examService.submitExam(attemptId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXAM_ATTEMPTS] });
      toast.success({
        title: "Nộp bài thi thành công",
        description: "Bài thi của bạn đã được nộp thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Nộp bài thi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi nộp bài thi",
      });
    },
  });
}

/**
 * Hook để lấy kết quả bài thi
 */
export function useExamResult(attemptId: string) {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.EXAM_RESULTS, attemptId),
    queryFn: () => examService.getExamResult(attemptId),
    enabled: !!attemptId,
  });
}

/**
 * Hook để lấy lịch sử làm bài thi của người dùng
 */
export function useUserExamHistory(userId: string) {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.EXAM_ATTEMPTS, { userId }),
    queryFn: () => examService.getUserExamHistory(userId),
    enabled: !!userId,
  });
}
