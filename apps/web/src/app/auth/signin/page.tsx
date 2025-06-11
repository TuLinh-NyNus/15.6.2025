'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import logger from '@/lib/utils/logger';

// Định nghĩa schema cho form đăng nhập
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Mở rộng kiểu Session.User để thêm role
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface CustomSession {
  user?: CustomUser;
  expires: string;
}

// Debug information interface
interface DebugInfo {
  status?: string;
  session?: string;
  callbackUrl?: string;
  email?: string;
  signInResult?: string;
  timestamp?: string;
  redirectUrl?: string;
  redirectError?: string;
  error?: string;
}

export default function SigninPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  // Log status đăng nhập
  useEffect(() => {
    logger.debug("Auth status:", status);
    logger.debug("Callback URL:", callbackUrl);
    if (status === 'loading') {
      logger.debug("Đang kiểm tra phiên đăng nhập...");
    }
  }, [status, callbackUrl]);

  // Đảm bảo callback URL hợp lệ
  const safeCallbackUrl = useMemo(() => {
    try {
      // Kiểm tra xem URL có phải tương đối không
      if (callbackUrl.startsWith('/')) {
        // URL tương đối luôn hợp lệ trong ngữ cảnh này
        logger.debug("URL callback tương đối hợp lệ:", callbackUrl);
        return callbackUrl;
      }

      // Kiểm tra URL hoàn chỉnh
      new URL(callbackUrl);
      logger.debug("URL callback tuyệt đối hợp lệ:", callbackUrl);
      return callbackUrl;
    } catch (error) {
      logger.error("URL callback không hợp lệ:", callbackUrl, error);
      return '/3141592654/admin/dashboard';
    }
  }, [callbackUrl]);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (session && status === 'authenticated') {
      logger.debug("Session data:", session);
      logger.debug("Redirecting to:", safeCallbackUrl);
      setDebugInfo({
        status: 'authenticated',
        session: JSON.stringify(session, null, 2),
        callbackUrl: safeCallbackUrl
      });

      // Casting session về CustomSession để truy cập role
      const customSession = session as CustomSession;

      // Xử lý chuyển hướng
      try {
        // Kiểm tra xem URL callback có chính xác không
        if (safeCallbackUrl && safeCallbackUrl.startsWith('/3141592654')) {
          // Nếu người dùng là admin và callback là /3141592654, thêm /admin
          if (customSession.user?.role === 'admin' && safeCallbackUrl === '/3141592654') {
            logger.debug("Admin redirecting to dashboard");
            router.push('/3141592654/admin/dashboard');
          } else {
            logger.debug("Regular redirect to:", safeCallbackUrl);
            router.push(safeCallbackUrl);
          }
        } else {
          logger.debug("Default redirect to home");
          router.push('/');
        }
      } catch (redirectError) {
        logger.error("Redirect error:", redirectError);
        setDebugInfo(prev => ({
          ...prev,
          redirectError: String(redirectError)
        } as DebugInfo));
        // Fallback nếu có lỗi chuyển hướng
        router.push('/3141592654/admin/dashboard');
      }
    }
  }, [session, status, router, safeCallbackUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      logger.debug("Attempting sign in with:", data.email);
      logger.debug("Callback URL:", safeCallbackUrl);

      setDebugInfo({
        status: 'signing_in',
        email: data.email,
        callbackUrl: safeCallbackUrl
      });

      const result = await signIn('credentials', {
        redirect: false,
        username: data.email,
        password: data.password,
        callbackUrl: safeCallbackUrl,
      });

      logger.debug("SignIn result:", result);
      setDebugInfo(prev => ({
        ...prev,
        signInResult: result ? JSON.stringify(result, null, 2) : 'null',
        timestamp: new Date().toISOString()
      } as DebugInfo));

      if (result?.error) {
        logger.error("Sign in error:", result.error);

        // Hiển thị lỗi chi tiết hơn
        if (result.error.includes('CredentialsSignin')) {
          setError('Email hoặc mật khẩu không chính xác');
        } else {
          setError(`Lỗi đăng nhập: ${result.error}`);
        }
      } else if (result?.url) {
        logger.debug("Sign in successful, will redirect to:", result.url);

        // Thông báo thành công
        setDebugInfo(prev => ({
          ...prev,
          status: 'success',
          redirectUrl: result.url
        } as DebugInfo));

        // Chỉ chuyển hướng thủ công nếu useSession chưa xử lý
        setTimeout(() => {
          if (status !== 'authenticated') {
            logger.debug("Manual redirect to:", result.url as string);
            try {
              // Kiểm tra URL hợp lệ trước khi chuyển hướng
              if ((result.url as string).startsWith('/')) {
                // URL tương đối - thêm origin để tạo URL đầy đủ cho window.location.href
                logger.debug("Chuyển hướng đến URL tương đối:", result.url);
                window.location.href = result.url as string;
              } else {
                // URL tuyệt đối - kiểm tra tính hợp lệ trước
                new URL(result.url as string);
                logger.debug("Chuyển hướng đến URL tuyệt đối:", result.url);
                window.location.href = result.url as string;
              }
            } catch (error) {
              logger.error("URL không hợp lệ khi chuyển hướng thủ công:", result.url, error);
              window.location.href = '/3141592654/admin/dashboard';
            }
          }
        }, 1000);
      }
    } catch (err) {
      logger.error("Login error:", err);
      // Hiển thị thông tin lỗi chi tiết hơn
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Đã xảy ra lỗi khi đăng nhập: ${errorMessage}`);
      setDebugInfo(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      } as DebugInfo));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Đăng nhập</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Đăng nhập để tiếp tục sử dụng NyNus
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-start">
              <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 rounded-xl"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 rounded-xl"
              >
                <svg className="h-5 w-5 mr-2 text-[#1877F2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}