'use client';

import apiClient from './api.service';

interface LoginCredentials {
  email: string;
  password: string;
  [key: string]: unknown;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';

const AuthService = {
  login: async (credentials: LoginCredentials, rememberMe: boolean = false): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Lưu token và thông tin user
      AuthService.setToken(response.token, rememberMe);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      // Redirect về trang login
      window.location.href = '/auth/signin';
    }
  },
  
  setToken: (token: string, rememberMe: boolean = false): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      
      // Nếu remember me, lưu token vào cookie với thời hạn 30 ngày
      if (rememberMe) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        document.cookie = `${TOKEN_KEY}=${token}; expires=${expiryDate.toUTCString()}; path=/`;
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      }
    }
  },
  
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Lấy từ localStorage
    const tokenFromStorage = localStorage.getItem(TOKEN_KEY);
    if (tokenFromStorage) return tokenFromStorage;
    
    // Nếu không có trong localStorage, tìm trong cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === TOKEN_KEY) return value;
    }
    
    return null;
  },
  
  isAuthenticated: (): boolean => {
    const token = AuthService.getToken();
    if (!token) return false;
    
    try {
      // Parse token mà không sử dụng jwt-decode
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      const currentTime = Date.now() / 1000;
      
      // Kiểm tra token có hết hạn chưa
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  },
  
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userJson = localStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  hasRole: (role: string): boolean => {
    try {
      const user = AuthService.getCurrentUser();
      return user?.role === role;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }
};

export default AuthService; 