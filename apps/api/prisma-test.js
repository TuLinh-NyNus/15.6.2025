import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
async function main() {
    try {
        // Kết nối với database
        console.log('Kết nối với database...');
        // Xóa dữ liệu hiện có (chỉ dùng cho test)
        await prisma.progress.deleteMany();
        await prisma.enrollment.deleteMany();
        await prisma.lesson.deleteMany();
        await prisma.course.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();
        console.log('Đã xóa dữ liệu cũ');
        // Tạo người dùng
        const hashedPassword = await bcryptjs.hash('password123', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@nynus.edu',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
            },
        });
        const instructor = await prisma.user.create({
            data: {
                email: 'instructor@nynus.edu',
                password: hashedPassword,
                firstName: 'Instructor',
                lastName: 'User',
                role: 'INSTRUCTOR',
            },
        });
        const student = await prisma.user.create({
            data: {
                email: 'student@nynus.edu',
                password: hashedPassword,
                firstName: 'Student',
                lastName: 'User',
                role: 'STUDENT',
            },
        });
        console.log('Đã tạo người dùng:', { admin, instructor, student });
        // Tạo danh mục
        const category = await prisma.category.create({
            data: {
                name: 'Programming',
                description: 'Learn programming languages and frameworks',
            },
        });
        console.log('Đã tạo danh mục:', category);
        // Tạo khóa học
        const course = await prisma.course.create({
            data: {
                title: 'JavaScript Fundamentals',
                description: 'Learn the basics of JavaScript programming',
                price: 99.99,
                isPublished: true,
                categoryId: category.id,
                instructorId: instructor.id,
            },
        });
        console.log('Đã tạo khóa học:', course);
        // Tạo bài học
        const lesson1 = await prisma.lesson.create({
            data: {
                title: 'Introduction to JavaScript',
                content: 'This is the first lesson content',
                order: 1,
                courseId: course.id,
            },
        });
        const lesson2 = await prisma.lesson.create({
            data: {
                title: 'Variables and Data Types',
                content: 'This is the second lesson content',
                order: 2,
                courseId: course.id,
            },
        });
        console.log('Đã tạo bài học:', { lesson1, lesson2 });
        // Đăng ký học
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: student.id,
                courseId: course.id,
                status: 'ACTIVE',
            },
        });
        console.log('Đã đăng ký học:', enrollment);
        // Cập nhật tiến độ
        const progress = await prisma.progress.create({
            data: {
                enrollmentId: enrollment.id,
                lessonId: lesson1.id,
                completed: true,
                lastAccessed: new Date(),
            },
        });
        console.log('Đã cập nhật tiến độ:', progress);
        // Truy vấn khóa học với instructor và lessons
        const courseWithDetails = await prisma.course.findUnique({
            where: { id: course.id },
            include: {
                instructor: true,
                lessons: true,
                category: true,
            },
        });
        console.log('Chi tiết khóa học:', JSON.stringify(courseWithDetails, null, 2));
        // Truy vấn người dùng với enrollments
        const studentWithEnrollments = await prisma.user.findUnique({
            where: { id: student.id },
            include: {
                enrollments: {
                    include: {
                        course: true,
                        progress: {
                            include: {
                                lesson: true,
                            },
                        },
                    },
                },
            },
        });
        console.log('Chi tiết học viên:', JSON.stringify(studentWithEnrollments, null, 2));
        console.log('Hoàn thành các thao tác cơ bản với Prisma Client');
    }
    catch (error) {
        console.error('Lỗi:', error);
    }
    finally {
        await prisma.$disconnect();
        console.log('Đã ngắt kết nối với database');
    }
}
main();
