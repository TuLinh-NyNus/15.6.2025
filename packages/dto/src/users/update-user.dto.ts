import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email người dùng',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'StrongP@ssw0rd',
    minLength: 8,
    required: false,
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @IsOptional()
  password?: string;

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

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: UserRole,
    required: false,
  })
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  role?: UserRole;
}
 