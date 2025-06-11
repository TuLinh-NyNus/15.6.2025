"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { QueryKeys, createQueryKey } from "@/lib/api/query-keys";
import {
  userService,
  IUpdateProfileRequest,
  IUpdateUserRequest,
  INotificationSettings,
  IUploadAvatarResponse,
} from "@/lib/api/services/user-service";
import { ApiError } from "@/lib/api/types/api-error";
import { useAuthStore } from "@/store";

import { toast } from "./use-toast";

/**
 * Hook để quản lý user profile
 */
export function useUserProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id;

  // Query để lấy thông tin profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: createQueryKey(QueryKeys.USER_PROFILE, userId),
    queryFn: () => userService.getUserProfile(userId!),
    enabled: !!userId,
  });

  // Mutation để cập nhật profile
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: (data: IUpdateProfileRequest) =>
      userService.updateUserProfile(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: createQueryKey(QueryKeys.USER_PROFILE, userId),
      });
      toast.success({
        title: "Cập nhật thành công",
        description: "Thông tin hồ sơ của bạn đã được cập nhật",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật thất bại",
        description:
          error?.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật thông tin hồ sơ",
      });
    },
  });

  // Mutation để cập nhật thông tin user
  const { mutate: updateUser, isPending: isUpdatingUser } = useMutation({
    mutationFn: (data: IUpdateUserRequest) =>
      userService.updateUser(userId!, data),
    onSuccess: (updatedUser) => {
      // Cập nhật user trong auth store
      const { setUser } = useAuthStore.getState();
      // Chuyển đổi từ IUser của user-service sang IUser của auth-store
      setUser({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.fullName || `${updatedUser.firstName} ${updatedUser.lastName}`,
        role: updatedUser.role,
        avatar: updatedUser.avatar
      });

      queryClient.invalidateQueries({
        queryKey: createQueryKey(QueryKeys.AUTH_USER),
      });
      toast.success({
        title: "Cập nhật thành công",
        description: "Thông tin tài khoản của bạn đã được cập nhật",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật thất bại",
        description:
          error?.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật thông tin tài khoản",
      });
    },
  });

  // Mutation để cập nhật mật khẩu
  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: (data: { password: string }) =>
      userService.updatePassword(userId!, data),
    onSuccess: () => {
      toast.success({
        title: "Cập nhật thành công",
        description: "Mật khẩu của bạn đã được cập nhật",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật thất bại",
        description:
          error?.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật mật khẩu",
      });
    },
  });

  // Query để lấy cài đặt thông báo
  const {
    data: notificationSettings,
    isLoading: isLoadingNotificationSettings,
    error: notificationSettingsError,
  } = useQuery({
    queryKey: createQueryKey(QueryKeys.USER, userId, { type: "notifications" }),
    queryFn: () => userService.getNotificationSettings(userId!),
    enabled: !!userId,
  });

  // Mutation để cập nhật cài đặt thông báo
  const {
    mutate: updateNotificationSettings,
    isPending: isUpdatingNotificationSettings,
  } = useMutation({
    mutationFn: (data: Partial<INotificationSettings>) =>
      userService.updateNotificationSettings(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: createQueryKey(QueryKeys.USER, userId, {
          type: "notifications",
        }),
      });
      toast.success({
        title: "Cập nhật thành công",
        description: "Cài đặt thông báo của bạn đã được cập nhật",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Cập nhật thất bại",
        description:
          error?.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật cài đặt thông báo",
      });
    },
  });

  // Query để lấy thông tin subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useQuery({
    queryKey: createQueryKey(QueryKeys.USER, userId, { type: "subscription" }),
    queryFn: () => userService.getSubscription(userId!),
    enabled: !!userId,
  });

  // Mutation để hủy subscription
  const { mutate: cancelSubscription, isPending: isCancelingSubscription } =
    useMutation({
      mutationFn: (subscriptionId: string) =>
        userService.cancelSubscription(userId!, subscriptionId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: createQueryKey(QueryKeys.USER, userId, {
            type: "subscription",
          }),
        });
        toast.success({
          title: "Hủy đăng ký thành công",
          description: "Đăng ký của bạn đã được hủy",
        });
      },
      onError: (error: ApiError) => {
        toast.error({
          title: "Hủy đăng ký thất bại",
          description:
            error?.response?.data?.message ||
            "Đã xảy ra lỗi khi hủy đăng ký",
        });
      },
    });

  // Mutation để upload avatar
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation<IUploadAvatarResponse, ApiError, File>({
    mutationFn: (file: File) => userService.uploadAvatar(userId!, file),
    onSuccess: (data) => {
      // Cập nhật avatar trong auth store
      const { user, setUser } = useAuthStore.getState();
      if (user) {
        setUser({
          ...user,
          avatar: data.avatarUrl,
        });
      }

      queryClient.invalidateQueries({
        queryKey: createQueryKey(QueryKeys.USER_PROFILE, userId),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKey(QueryKeys.AUTH_USER),
      });
      toast.success({
        title: "Tải lên thành công",
        description: "Ảnh đại diện của bạn đã được cập nhật",
      });
    },
    onError: (error: ApiError) => {
      toast.error({
        title: "Tải lên thất bại",
        description:
          error?.response?.data?.message ||
          "Đã xảy ra lỗi khi tải lên ảnh đại diện",
      });
    },
  });

  return {
    // Profile
    profile,
    isLoadingProfile,
    profileError,
    updateProfile,
    isUpdatingProfile,

    // User
    updateUser,
    isUpdatingUser,

    // Password
    updatePassword,
    isUpdatingPassword,

    // Notification Settings
    notificationSettings,
    isLoadingNotificationSettings,
    notificationSettingsError,
    updateNotificationSettings,
    isUpdatingNotificationSettings,

    // Subscription
    subscription,
    isLoadingSubscription,
    subscriptionError,
    cancelSubscription,
    isCancelingSubscription,

    // Avatar
    uploadAvatar,
    isUploadingAvatar,
  };
}
