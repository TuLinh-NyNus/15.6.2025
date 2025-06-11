import { NextAuthOptions } from "next-auth";
import { User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { ISignInRequest } from "./api/services/auth-service";

import logger from "./utils/logger";
import { logCache } from "./utils/log-cache";

// Mở rộng type User để thêm role và accessToken
interface CustomUser extends User {
  role?: string;
  accessToken?: string;
}

// Mở rộng type JWT để thêm role và accessToken
interface CustomJWT extends JWT {
  role?: string;
  accessToken?: string;
}

// Mở rộng type Session để thêm accessToken
interface CustomSession extends Session {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

// Mock users cho phát triển local
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@nynus.edu.vn',
    password: 'admin',
    role: 'admin',
    accessToken: 'mock-token-admin'
  },
  {
    id: '2',
    name: 'Super Admin',
    email: 'superadmin@nynus.edu.vn',
    password: 'superadmin123',
    role: 'admin',
    accessToken: 'mock-token-superadmin'
  },
  {
    id: '3',
    name: 'NyNus Admin',
    email: 'nynus-boo@nynus.edu.vn',
    password: 'Abd8stbcs!',
    role: 'admin',
    accessToken: 'mock-token-nynus-admin'
  }
];

import { authService } from './api/services/auth-service';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          // Log để gỡ lỗi
          logger.debug("Đang gọi authorize với credentials:",
            credentials ? { username: credentials.username } : null);

          // Kiểm tra tài khoản mẫu (mockUsers) - Đảm bảo luôn có thể đăng nhập trong dev
          if (credentials) {
            const mockUser = mockUsers.find(user =>
              user.email === credentials.username &&
              user.password === credentials.password
            );

            if (mockUser) {
              logger.debug("Đăng nhập mẫu thành công:", {
                email: mockUser.email,
                role: mockUser.role
              });

              return {
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                role: mockUser.role,
                accessToken: mockUser.accessToken
              };
            }

            // Thêm fallback để đảm bảo luôn đăng nhập được với tài khoản superadmin
            if (credentials.username === 'superadmin@nynus.edu.vn' && credentials.password === 'superadmin123') {
              logger.debug("Đăng nhập fallback với superadmin");
              return {
                id: '2',
                name: 'Super Admin',
                email: 'superadmin@nynus.edu.vn',
                role: 'admin',
                accessToken: 'mock-token-superadmin'
              };
            }

            // Thêm fallback cho tài khoản nynus-boo
            if (credentials.username === 'nynus-boo@nynus.edu.vn' && credentials.password === 'Abd8stbcs!') {
              logger.debug("Đăng nhập fallback với nynus-boo");
              return {
                id: '3',
                name: 'NyNus Admin',
                email: 'nynus-boo@nynus.edu.vn',
                role: 'admin',
                accessToken: 'mock-token-nynus-admin'
              };
            }
          }

          try {
            // Đăng nhập qua API backend để lấy accessToken thực tế
            if (!credentials) return null;
            const { username, password } = credentials;
            // Đổi tên trường nếu backend yêu cầu email thay vì username
            const loginData: ISignInRequest = { email: username, password };
            logger.debug("Gọi API đăng nhập với:", { email: username });

            try {
              const response = await authService.signIn(loginData);
              if (response && response.accessToken && response.user && response.user.id) {
                logger.debug("Đăng nhập API thành công:", {
                  id: response.user.id,
                  email: response.user.email,
                  role: response.user.role
                });

                return {
                  id: response.user.id,
                  name: response.user.name,
                  email: response.user.email,
                  role: response.user.role,
                  accessToken: response.accessToken,
                };
              }
            } catch (apiError) {
              logger.error('API lỗi:', apiError);
              // Fallback cho local dev nếu API không khả dụng
              if (credentials?.username === 'admin@nynus.edu.vn' && credentials?.password === 'admin') {
                return {
                  id: '1',
                  name: 'Admin User (Fallback)',
                  email: 'admin@nynus.edu.vn',
                  role: 'admin',
                  accessToken: 'mock-token-fallback'
                };
              }

              // Fallback cho nynus-boo khi API lỗi
              if (credentials?.username === 'nynus-boo@nynus.edu.vn' && credentials?.password === 'Abd8stbcs!') {
                return {
                  id: '3',
                  name: 'NyNus Admin (Fallback)',
                  email: 'nynus-boo@nynus.edu.vn',
                  role: 'admin',
                  accessToken: 'mock-token-nynus-admin-fallback'
                };
              }
            }
          } catch (error) {
            logger.error('Lỗi đăng nhập:', error);
            return null;
          }

          // Nếu không thành công, trả về null
          logger.error('Login failed');
          return null;
        } catch (error) {
          logger.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      const customToken = token as CustomJWT;
      if (user) {
        const customUser = user as CustomUser;
        customToken.role = customUser.role;
        customToken.accessToken = customUser.accessToken;

        // Chỉ ghi log khi thêm mới role, không ghi log khi refresh token
        if (!logCache.shouldSkipLogging('auth', { action: 'adding_role', role: customUser.role })) {
          logger.debug("JWT callback - adding role:", customUser.role);
        }
      }

      // Chỉ ghi log thông tin token khi có thay đổi hoặc là lần đầu tiên
      // Gồm cả: sub (user id) và role để phát hiện bất kỳ thay đổi nào
      const tokenData = { sub: customToken.sub, role: customToken.role };
      if (!logCache.shouldSkipLogging('jwt', tokenData)) {
        logger.debug("JWT callback - token:", tokenData);
      }

      return customToken;
    },
    async session({ session, token }) {
      const customSession = session as CustomSession;
      if (customSession?.user) {
        const customToken = token as CustomJWT;
        const previousRole = customSession.user.role;

        if (typeof customToken.role === 'string' || customToken.role === undefined) {
          customSession.user.role = customToken.role;
        }
        // Thêm accessToken vào session
        customSession.accessToken = customToken.accessToken;

        // Chỉ ghi log thông tin session khi role thay đổi hoặc là lần đầu thiết lập
        if (previousRole !== customSession.user.role ||
            !logCache.shouldSkipLogging('session', { role: customSession.user.role })) {
          logger.debug("Session callback - user role:", customSession.user.role);
        }
      }
      return customSession;
    },
    async redirect({ url, baseUrl }) {
      // Kiểm tra nếu là redirect trùng lặp, chỉ ghi log một lần
      if (logCache.shouldSkipLogging('redirect', { url, baseUrl })) {
        // Không ghi log khi trùng lặp và trả về kết quả trực tiếp
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        } else if (url.startsWith('http') && url.startsWith(baseUrl)) {
          return url;
        }
        return baseUrl;
      }

      // Ghi log chi tiết chỉ cho lần redirect đầu tiên hoặc khác với lần trước
      logger.debug("Redirect callback - url:", url, "baseUrl:", baseUrl);

      // Xử lý đăng xuất - chuyển hướng về trang chủ
      if (url.includes('/signout') || url.includes('/api/auth/signout')) {
        logger.info("Đang xử lý đăng xuất, chuyển hướng về trang chủ");
        return baseUrl;
      }

      // Xử lý URL an toàn để tránh lỗi "Invalid URL"
      // Nếu là URL tương đối, trả về trực tiếp
      if (url.startsWith('/')) {
        // Chỉ log một lần cho mỗi URL khác nhau
        if (!logCache.shouldSkipLogging('redirect_relative', { url })) {
          logger.debug("URL tương đối hợp lệ:", url);
        }

        // Trường hợp đặc biệt cho /3141592654
        if (url.includes('/3141592654') && !url.includes('/admin')) {
          if (!logCache.shouldSkipLogging('redirect_admin', { url })) {
            logger.info("Phát hiện URL admin, chuyển hướng đến dashboard");
          }
          return `${baseUrl}/3141592654/admin/dashboard`;
        }

        return `${baseUrl}${url}`;
      }

      // Nếu là URL tuyệt đối, kiểm tra tính hợp lệ
      if (url.startsWith('http')) {
        // Nếu URL bắt đầu bằng baseUrl, cho phép
        if (url.startsWith(baseUrl)) {
          // Chỉ log một lần cho mỗi URL khác nhau
          if (!logCache.shouldSkipLogging('redirect_absolute', { url })) {
            logger.debug("URL tuyệt đối hợp lệ:", url);
          }
          return url;
        }

        try {
          // Validate URL
          new URL(url);
          logger.debug("URL bên ngoài hợp lệ:", url);
          // Redirect về baseUrl cho các URL bên ngoài
          // (có thể điều chỉnh logic này nếu muốn cho phép chuyển hướng ra ngoài)
          return baseUrl;
        } catch (e) {
          logger.error("URL tuyệt đối không hợp lệ:", url);
          return baseUrl;
        }
      }

      // Mặc định trả về baseUrl
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "chuỗi-bí-mật-mặc-định-cho-phát-triển-local",
};
