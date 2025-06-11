const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Kiểm tra xem tài khoản đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'nynus-boo@nynus.edu.vn',
      },
    });

    if (existingUser) {
      console.log('Tài khoản admin đã tồn tại!');
      return;
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash('Abd8stbcs!', 10);

    // Tạo tài khoản admin
    const admin = await prisma.user.create({
      data: {
        email: 'nynus-boo@nynus.edu.vn',
        password: hashedPassword,
        firstName: 'NyNus',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });

    console.log('Tài khoản admin đã được tạo thành công:');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Họ tên: ${admin.firstName} ${admin.lastName}`);
    console.log(`Vai trò: ${admin.role}`);
  } catch (error) {
    console.error('Lỗi khi tạo tài khoản admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
