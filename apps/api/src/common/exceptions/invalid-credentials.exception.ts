import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message: string = 'Email hoặc mật khẩu không đúng.') {
    super(message);
  }
}
