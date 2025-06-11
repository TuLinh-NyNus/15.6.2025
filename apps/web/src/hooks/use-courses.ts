"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { QueryKeys, createQueryKey } from "@/lib/api/query-keys";
import {
  courseService,
  ICourseListParams,
  ICreateCourseRequest,
  IUpdateCourseRequest,
} from "@/lib/api/services/course-service";
import { ApiError } from "@/lib/api/types/api-error";

import { toast } from "./use-toast";

/**
 * Hook để lấy danh sách khóa học
 */
export function useCourses(params?: ICourseListParams) {
  return useQuery({
    queryKey: createQueryKey(QueryKeys.COURSES, params),
    queryFn: () => courseService.getCourses(params),
  });
}

/**
 * Hook để lấy chi tiết khóa học
 */
export function useCourse(id: string) {
  return useQuery({
    queryKey: createQueryKey(QueryKeys.COURSE, id),
    queryFn: () => courseService.getCourse(id),
    enabled: !!id,
  });
}

/**
 * Hook để lấy danh sách khóa học nổi bật
 */
export function useFeaturedCourses(limit: number = 6) {
  return useQuery({
    queryKey: createQueryKey(QueryKeys.FEATURED_COURSES, { limit }),
    queryFn: () => courseService.getFeaturedCourses(limit),
  });
}

/**
 * Hook để lấy danh sách khóa học phổ biến
 */
export function usePopularCourses(limit: number = 6) {
  return useQuery({
    queryKey: createQueryKey(QueryKeys.POPULAR_COURSES, { limit }),
    queryFn: () => courseService.getPopularCourses(limit),
  });
}

/**
 * Hook để lấy danh sách khóa học của user
 */
export function useUserCourses(userId: string, params?: ICourseListParams) {
  return useQuery({
    queryKey: createQueryKey(QueryKeys.USER_COURSES, { userId, ...params }),
    queryFn: () => courseService.getUserCourses(userId, params),
    enabled: !!userId,
  });
}

/**
 * Hook để tạo khóa học mới
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateCourseRequest) => courseService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.COURSES] });
      toast.success({
        title: "Tạo khóa học thành công",
        description: "Khóa học mới đã được tạo thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Tạo khóa học thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi tạo khóa học",
      });
    },
  });
}

/**
 * Hook để cập nhật khóa học
 */
export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateCourseRequest) => courseService.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.COURSES] });
      queryClient.invalidateQueries({ queryKey: createQueryKey(QueryKeys.COURSE, id) });
      toast.success({
        title: "Cập nhật khóa học thành công",
        description: "Khóa học đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật khóa học thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật khóa học",
      });
    },
  });
}

/**
 * Hook để xóa khóa học
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.COURSES] });
      toast.success({
        title: "Xóa khóa học thành công",
        description: "Khóa học đã được xóa thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Xóa khóa học thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa khóa học",
      });
    },
  });
}
