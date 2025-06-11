import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Xóa người dùng admin cũ nếu có
    await prisma.user.deleteMany({
      where: {
        email: 'nynus-boo@nynus.edu.vn',
      },
    });

    console.log('Đã xóa người dùng admin cũ (nếu có)');

    // Tạo người dùng admin mới
    const hashedPassword = await hash('Abd8stbcs!', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'nynus-boo@nynus.edu.vn',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'NyNus',
        role: 'ADMIN',
      },
    });

    console.log('Đã tạo người dùng admin mới:', admin);
  } catch (error) {
    console.error('Lỗi khi tạo người dùng admin:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
