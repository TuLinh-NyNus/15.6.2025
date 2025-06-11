"use client";

import { useQuery } from "@tanstack/react-query";

import { QueryKeys, createQueryKey } from "@/lib/api/query-keys";
import { courseService, ICourse } from "@/lib/api/services/course-service";

/**
 * Hook để lấy danh sách khóa học nổi bật
 * @param limit Số lượng khóa học muốn lấy
 * @returns Danh sách khóa học nổi bật
 */
export function useFeaturedCourses(limit: number = 6) {
  return useQuery<ICourse[], Error>({
    queryKey: createQueryKey(QueryKeys.FEATURED_COURSES, { limit }),
    queryFn: () => courseService.getFeaturedCourses(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
