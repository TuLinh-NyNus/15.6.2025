"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { QueryKeys, createQueryKey } from "@/lib/api/query-keys";
import { authService, ISignInRequest, ISignUpRequest, IAuthResponse } from "@/lib/api/services";
import { ApiError } from "@/lib/api/types/api-error";
import { useAuthStore } from "@/store";

import { toast } from "./use-toast";
import { IUser } from "@/store/auth-store";

/**
 * Hook để quản lý authentication
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth store
  const {
    user,
    isAuthenticated,
    setUser,
    setTokens,
    logout,
    setLoading,
    setError,
  } = useAuthStore();

  // Query để lấy thông tin user hiện tại
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: createQueryKey(QueryKeys.AUTH_USER),
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
  });

  // Mutation để đăng nhập
  const { mutate: signIn, isPending: isSigningIn } = useMutation<IAuthResponse, ApiError, ISignInRequest>({
    mutationFn: authService.signIn,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data: { user: IUser; accessToken: string; refreshToken: string }) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      toast.success({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${data.user.name} quay trở lại!`,
      });
      router.push("/dashboard");
    },
    onError: (error: ApiError) => {
      setError(error?.response?.data?.message || "Đăng nhập thất bại");
      toast.error({
        title: "Đăng nhập thất bại",
        description: error?.response?.data?.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Mutation để đăng ký
  const { mutate: signUp, isPending: isSigningUp } = useMutation<IAuthResponse, ApiError, ISignUpRequest>({
    mutationFn: authService.signUp,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data: { user: IUser; accessToken: string; refreshToken: string }) => {
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      toast.success({
        title: "Đăng ký thành công",
        description: `Chào mừng ${data.user.name} đến với NyNus!`,
      });
      router.push("/dashboard");
    },
    onError: (error: ApiError) => {
      setError(error?.response?.data?.message || "Đăng ký thất bại");
      toast.error({
        title: "Đăng ký thất bại",
        description: error?.response?.data?.message || "Vui lòng kiểm tra lại thông tin đăng ký",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Mutation để đăng xuất
  const { mutate: signOut, isPending: isSigningOut } = useMutation<void, ApiError>({
    mutationFn: authService.signOut,
    onSuccess: () => {
      handleLogout();
      toast.success({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
    },
    onError: () => {
      // Nếu có lỗi khi đăng xuất, vẫn đăng xuất ở client
      handleLogout();
    },
  });

  // Hàm xử lý đăng xuất
  const handleLogout = useCallback(() => {
    logout();
    queryClient.clear();
    router.push("/");
  }, [logout, queryClient, router]);

  return {
    user,
    isAuthenticated,
    isLoadingUser,
    currentUser,
    signIn,
    isSigningIn,
    signUp,
    isSigningUp,
    signOut,
    isSigningOut,
    logout: handleLogout,
  };
}
