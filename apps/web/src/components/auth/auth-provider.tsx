"use client";

import React, { createContext, useContext, useState } from "react";

import logger from "@/lib/utils/logger";

interface User {
  id?: string;
  email: string;
  name?: string;
  fullName?: string;
  role: "student" | "teacher" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      logger.debug('Đang gửi request đăng nhập với:', { email, password: '******' });

      // Gọi API đăng nhập thực tế
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      logger.debug('Phản hồi từ API:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu token vào localStorage
      localStorage.setItem('authToken', data.token);
      logger.debug('Đã lưu token');

      // Lưu thông tin người dùng vào state
      setUser({
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role as "student" | "teacher" | "admin"
      });
      logger.info('Đã lưu thông tin người dùng:', data.user);
    } catch (error) {
      logger.error("Chi tiết lỗi đăng nhập:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Gọi API đăng ký thực tế
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullName: name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Lưu token vào localStorage
      localStorage.setItem('authToken', data.token);

      // Lưu thông tin người dùng vào state
      setUser({
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role as "student" | "teacher" | "admin"
      });
    } catch (error) {
      logger.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}