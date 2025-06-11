'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    // Các lỗi từ URL
    const error = searchParams?.get('error');
    
    // Xử lý các loại lỗi và hiển thị thông báo phù hợp
    if (error === 'CredentialsSignin') {
      setErrorMessage('Email hoặc mật khẩu không chính xác.');
    } else if (error === 'OAuthAccountNotLinked') {
      setErrorMessage('Email này đã được sử dụng với một phương thức đăng nhập khác.');
    } else if (error === 'AccessDenied') {
      setErrorMessage('Bạn không có quyền truy cập trang này.');
    } else if (error === 'Verification') {
      setErrorMessage('Token xác thực không hợp lệ hoặc đã hết hạn.');
    } else if (error === 'Configuration') {
      setErrorMessage('Có lỗi trong cấu hình xác thực. Vui lòng liên hệ quản trị viên.');
    } else {
      setErrorMessage('Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Lỗi xác thực
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {errorMessage}
          </p>
          
          <div className="flex flex-col space-y-3 w-full">
            <Link
              href="/auth/signin"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 text-center"
            >
              Quay lại trang đăng nhập
            </Link>
            
            <Link
              href="/"
              className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 transition-all duration-200 text-center"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 