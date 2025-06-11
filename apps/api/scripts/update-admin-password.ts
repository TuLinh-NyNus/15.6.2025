import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

async function main() {
  console.log('Bắt đầu cập nhật mật khẩu...');
  const prisma = new PrismaClient();

  try {
    // Liệt kê tất cả người dùng
    console.log('Danh sách tất cả người dùng:');
    const allUsers = await prisma.user.findMany();
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.id}): role=${u.role}`);
    });

    // Tìm người dùng với email nynus-boo@nynus.edu.vn
    const user = await prisma.user.findUnique({
      where: {
        email: 'nynus-boo@nynus.edu.vn',
      },
    });

    if (!user) {
      console.log('Không tìm thấy người dùng với email nynus-boo@nynus.edu.vn');
      console.log('Tạo người dùng mới...');

      // Hash mật khẩu sử dụng bcryptjs
      const hashedPassword = await bcryptjs.hash('Abd8stbcs!', 10);

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
      console.log('Mật khẩu (đã hash):', hashedPassword);
      return;
    }

    console.log('Đã tìm thấy người dùng:', user.email);
    console.log('ID:', user.id);
    console.log('Role hiện tại:', user.role);

    // Hash mật khẩu sử dụng bcryptjs
    const hashedPassword = await bcryptjs.hash('Abd8stbcs!', 10);

    // Cập nhật mật khẩu
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Đã cập nhật mật khẩu cho người dùng:', updatedUser.email);
    console.log('Mật khẩu mới (đã hash):', hashedPassword);
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
