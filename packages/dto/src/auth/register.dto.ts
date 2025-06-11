import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email người dùng',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'StrongP@ssw0rd',
    minLength: 8,
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @ApiProperty({
    description: 'Tên',
    example: 'Nguyen',
    required: false,
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Họ',
    example: 'Van A',
    required: false,
  })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsOptional()
  lastName?: string;
}
