import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class UserResponseDto {
  @ApiProperty({
    description: 'ID người dùng',
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  id: string;

  @ApiProperty({
    description: 'Email người dùng',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Tên',
    example: 'Nguyen',
  })
  firstName: string;

  @ApiProperty({
    description: 'Họ',
    example: 'Van A',
  })
  lastName: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2023-04-05T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2023-04-05T10:30:00Z',
  })
  updatedAt: Date;
}
