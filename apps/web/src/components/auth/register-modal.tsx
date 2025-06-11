"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useAuth } from "./auth-provider";

// Định nghĩa schema validation
const registerSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(50, "Họ tên không được quá 50 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setRegisterError(null);
    try {
      await registerUser(data.email, data.password, data.name);
      reset();
      onClose();
    } catch (error) {
      setRegisterError("Đăng ký thất bại. Vui lòng thử lại sau.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl flex overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full fancy-glass z-10"
              aria-label="Close register modal"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Left side - Illustration */}
            <div className="hidden md:block w-1/2 auth-gradient p-8 relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2">Tham gia cùng chúng tôi!</h2>
                  <p className="text-indigo-100">Bắt đầu hành trình học tập cùng NyNus ngay hôm nay</p>
                </div>
                
                <div className="flex items-center justify-center h-full">
                  <Image
                    src="/images/login-illustration.svg"
                    alt="Collaborating team illustration"
                    width={400}
                    height={400}
                    className="object-contain"
                    priority
                  />
                </div>
                
                <div className="mt-auto text-sm text-indigo-100">
                  <p>Học toán thông minh với AI, nền tảng học tập cá nhân hóa giúp học sinh đạt kết quả tốt hơn.</p>
                </div>
              </div>
            </div>

            {/* Right side - Register form */}
            <div className="w-full md:w-1/2 flex flex-col p-8">
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Đăng ký tài khoản
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Tạo tài khoản để truy cập đầy đủ tính năng học tập
                  </p>
                </div>

                {registerError && (
                  <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{registerError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium form-label">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className={`form-input w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-primary"
                        } transition-shadow duration-200`}
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{errors.name.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium form-label">
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
                        className={`form-input w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-primary"
                        } transition-shadow duration-200`}
                        {...register("email")}
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
                    <label htmlFor="password" className="block text-sm font-medium form-label">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`form-input w-full pl-10 pr-12 py-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-primary"
                        } transition-shadow duration-200`}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
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

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium form-label">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`form-input w-full pl-10 pr-12 py-2 rounded-xl focus:outline-none focus:ring-2 ${
                          errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-primary"
                        } transition-shadow duration-200`}
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{errors.confirmPassword.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Register button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400">
                        Hoặc đăng ký với
                      </span>
                    </div>
                  </div>

                  {/* Social login */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="flex items-center justify-center py-2.5 fancy-card hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 rounded-xl"
                    >
                      <Image src="/images/google-logo.svg" width={20} height={20} alt="Google logo" className="mr-2" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center py-2.5 fancy-card hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 rounded-xl"
                    >
                      <Image src="/images/facebook-logo.svg" width={20} height={20} alt="Facebook logo" className="mr-2" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
                    </button>
                  </div>
                </form>

                {/* Sign in link */}
                <div className="mt-8 text-center">
                  <span className="text-slate-600 dark:text-slate-400">Đã có tài khoản? </span>
                  <button
                    onClick={onSwitchToLogin}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
                <p>
                  Đăng ký đồng nghĩa với việc bạn đồng ý với{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/80">
                    Chính sách bảo mật
                  </Link>{" "}
                  của chúng tôi.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal; 