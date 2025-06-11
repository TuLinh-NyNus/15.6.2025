import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'nynus-boo@nynus.edu.vn',
      },
    });

    if (existingUser) {
      console.log('Người dùng đã tồn tại. Cập nhật mật khẩu...');
      
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash('Abd8stbcs!', 10);
      
      // Cập nhật người dùng
      const updatedUser = await prisma.user.update({
        where: {
          email: 'nynus-boo@nynus.edu.vn',
        },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      
      console.log('Đã cập nhật người dùng:', updatedUser.email);
    } else {
      console.log('Tạo người dùng mới...');
      
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash('Abd8stbcs!', 10);
      
      // Tạo người dùng mới
      const newUser = await prisma.user.create({
        data: {
          email: 'nynus-boo@nynus.edu.vn',
          password: hashedPassword,
          firstName: 'NyNus',
          lastName: 'Admin',
          role: 'ADMIN',
        },
      });
      
      console.log('Đã tạo người dùng mới:', newUser.email);
    }
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
