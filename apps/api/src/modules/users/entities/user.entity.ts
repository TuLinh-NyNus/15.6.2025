import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../dto/create-user.dto';

export class User {
  @ApiProperty({
    description: 'ID duy nhất của người dùng',
    example: 'uuid-v4-string',
  })
  id: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Tên của người dùng',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Họ của người dùng',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Thời điểm tạo tài khoản',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời điểm cập nhật tài khoản gần nhất',
    example: '2023-01-01T00:00:00Z',
  })
  updatedAt: Date;

  // Không trả về password trong response
  password?: string;
} 
