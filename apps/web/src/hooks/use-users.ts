"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { QueryKeys, createListQueryKey, createDetailQueryKey } from "@/lib/api/query-keys";
import {
  userService,
  IUserFilterParams,
  ICreateUserRequest,
  IUpdateUserRequest,
  IUpdateProfileRequest,
} from "@/lib/api/services/user-service";
import { ApiError } from "@/lib/api/types/api-error";

import { toast } from "./use-toast";

/**
 * Hook để lấy danh sách người dùng
 */
export function useUsers(params?: IUserFilterParams) {
  return useQuery({
    queryKey: createListQueryKey(QueryKeys.USERS, params),
    queryFn: () => userService.getUsers(params),
  });
}

/**
 * Hook để lấy chi tiết người dùng
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.USER, id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
}

/**
 * Hook để lấy profile người dùng
 */
export function useUserProfile(id: string) {
  return useQuery({
    queryKey: createDetailQueryKey(QueryKeys.USER_PROFILE, id),
    queryFn: () => userService.getUserProfile(id),
    enabled: !!id,
  });
}

/**
 * Hook để lấy profile của người dùng hiện tại
 */
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: [QueryKeys.USER_PROFILE, 'current'],
    queryFn: () => userService.getCurrentUserProfile(),
  });
}

/**
 * Hook để tạo người dùng mới
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
      toast.success({
        title: "Tạo người dùng thành công",
        description: "Người dùng mới đã được tạo thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Tạo người dùng thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi tạo người dùng",
      });
    },
  });
}

/**
 * Hook để cập nhật người dùng
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateUserRequest) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
      queryClient.invalidateQueries({ queryKey: createDetailQueryKey(QueryKeys.USER, id) });
      toast.success({
        title: "Cập nhật người dùng thành công",
        description: "Thông tin người dùng đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật người dùng thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật thông tin người dùng",
      });
    },
  });
}

/**
 * Hook để xóa người dùng
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
      toast.success({
        title: "Xóa người dùng thành công",
        description: "Người dùng đã được xóa thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Xóa người dùng thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi xóa người dùng",
      });
    },
  });
}

/**
 * Hook để cập nhật profile người dùng
 */
export function useUpdateUserProfile(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateProfileRequest) => userService.updateUserProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createDetailQueryKey(QueryKeys.USER_PROFILE, id) });
      toast.success({
        title: "Cập nhật profile thành công",
        description: "Profile của bạn đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật profile thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật profile",
      });
    },
  });
}

/**
 * Hook để cập nhật profile của người dùng hiện tại
 */
export function useUpdateCurrentUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateProfileRequest) => userService.updateCurrentUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USER_PROFILE, 'current'] });
      toast.success({
        title: "Cập nhật profile thành công",
        description: "Profile của bạn đã được cập nhật thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật profile thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật profile",
      });
    },
  });
}

/**
 * Hook để đổi mật khẩu
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      userService.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.success({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu của bạn đã được đổi thành công",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Đổi mật khẩu thất bại",
        description: error?.response?.data?.message || "Đã xảy ra lỗi khi đổi mật khẩu",
      });
    },
  });
}
