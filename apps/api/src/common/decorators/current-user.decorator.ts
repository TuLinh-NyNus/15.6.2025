import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator để lấy thông tin user hiện tại từ request
 * Được sử dụng trong các controller để truy cập thông tin người dùng đã xác thực
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // Nếu data được cung cấp, trả về field cụ thể
    return data ? user[data] : user;
  },
); 
