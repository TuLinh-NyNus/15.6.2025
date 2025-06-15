"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { QueryKeys, createListQueryKey, createDetailQueryKey } from "@/lib/api/query-keys";
import {
  questionService,
  IQuestionFilterParams,
  ICreateQuestionRequest,
  IUpdateQuestionRequest,
} from "@/lib/api/services/question-service";
import { ApiError } from "@/lib/api/types/api-error";

import { toast } from "./use-toast";
import { useMemo, useState, useEffect } from "react";

/**
 * Hook để lấy danh sách câu hỏi
 */
export function useQuestions(params?: IQuestionFilterParams) {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.QUESTIONS, params),
    queryFn: () => questionService.getQuestions(params),
  });
}

/**
 * Hook để lấy chi tiết câu hỏi
 */
export function useQuestion(id: string) {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.QUESTION, id),
    queryFn: () => questionService.getQuestion(id),
    enabled: !!id,
  });
}

/**
 * Hook để tìm kiếm câu hỏi
 */
export function useSearchQuestions(params: IQuestionFilterParams) {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.QUESTIONS_SEARCH, params),
    queryFn: () => questionService.searchQuestions(params),
    enabled: !!params,
  });
}

/**
 * Hook để tìm kiếm câu hỏi theo QuestionID
 */
export function useSearchByQuestionId(questionId: string) {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.QUESTION_BY_ID, questionId),
    queryFn: () => questionService.searchByQuestionId(questionId),
    enabled: !!questionId,
  });
}

/**
 * Hook để tìm kiếm câu hỏi theo tag
 */
export function useSearchByTag(tagId: string, params?: IQuestionFilterParams) {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.QUESTIONS_BY_TAG, { tagId, ...params }),
    queryFn: () => questionService.searchByTag(tagId, params),
    enabled: !!tagId,
  });
}

/**
 * Hook để tạo câu hỏi mới
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateQuestionRequest) => questionService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.QUESTIONS] });
      toast.success({
        title: "Tạo câu hỏi thành công",
        description: "Câu hỏi mới đã được tạo thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Tạo câu hỏi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi tạo câu hỏi",
      });
    },
  });
}

/**
 * Hook để cập nhật câu hỏi
 */
export function useUpdateQuestion(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateQuestionRequest) => questionService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.QUESTIONS] });
      queryClient.invalidateQueries({ queryKey: createDetailQueryKey(QueryKeys.QUESTION, id) });
      toast.success({
        title: "Cập nhật câu hỏi thành công",
        description: "Câu hỏi đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật câu hỏi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật câu hỏi",
      });
    },
  });
}

/**
 * Hook để xóa câu hỏi
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => questionService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.QUESTIONS] });
      toast.success({
        title: "Xóa câu hỏi thành công",
        description: "Câu hỏi đã được xóa thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Xóa câu hỏi thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa câu hỏi",
      });
    },
  });
}

/**
 * Enhanced hook để tìm kiếm câu hỏi với difficulty filtering
 */
export function useQuestionsWithFilters(params?: IQuestionFilterParams) {
  // Memoize the params to prevent unnecessary re-renders
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  return useQuery({
    queryKey: createListQueryKey(QueryKeys.QUESTIONS_SEARCH, memoizedParams),
    queryFn: () => questionService.searchQuestions(memoizedParams || {}),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook để lấy danh sách câu hỏi với debounced search
 */
export function useDebouncedQuestions(
  searchTerm: string,
  difficulties: string[],
  types: string[] = [],
  statuses: string[] = [],
  debounceMs: number = 500
) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const params = useMemo(() => ({
    search: debouncedSearchTerm,
    difficulties: difficulties.length > 0 ? difficulties : undefined,
    types: types.length > 0 ? types : undefined,
    statuses: statuses.length > 0 ? statuses : undefined,
    page: 1,
    limit: 20,
  }), [debouncedSearchTerm, difficulties, types, statuses]);

  return useQuestionsWithFilters(params);
}
