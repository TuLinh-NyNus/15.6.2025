import { Injectable } from '@nestjs/common';
import { Enrollment, EnrollmentStatus, Course, User, UserRole, CourseStatus, Progress, LessonDifficulty } from '@project/entities';
import { IEnrollmentRepository } from '@project/interfaces';
import { EnrollmentFiltersDto } from '@project/dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, EnrollmentStatus as PrismaEnrollmentStatus, UserRole as PrismaUserRole, Course as PrismaCourse, User as PrismaUser, CourseStatus as PrismaCourseStatus, LessonDifficulty as PrismaLessonDifficulty } from '@prisma/client';

type PrismaEnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: {
    course?: boolean;
    user?: boolean;
    progress?: boolean;
  }
}>;

@Injectable()
export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: EnrollmentFiltersDto): Promise<{ enrollments: Enrollment[]; total: number }> {
    const where: Prisma.EnrollmentWhereInput = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.courseId) {
      where.courseId = filters.courseId;
    }
    
    if (filters.status) {
      where.status = filters.status as PrismaEnrollmentStatus;
    }
    
    // Xác định sắp xếp
    let orderBy: Prisma.EnrollmentOrderByWithRelationInput = { createdAt: 'desc' };
    
    if (filters.sort) {
      const [field, direction] = filters.sort.split(':');
      orderBy = {
        [field]: direction === 'desc' ? 'desc' : 'asc'
      };
    }
    
    // Tính toán pagination
    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;
    
    // Thực hiện truy vấn
    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          course: true,
          user: true,
          progress: true
        }
      }),
      this.prisma.enrollment.count({ where })
    ]);
    
    return { 
      enrollments: enrollments.map(enrollment => this.mapToEnrollmentEntity(enrollment)), 
      total 
    };
  }

  async findById(id: string): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: true,
        user: true,
        progress: true
      }
    });
    
    if (!enrollment) return null;
    
    return this.mapToEnrollmentEntity(enrollment);
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
        user: true,
        progress: true
      }
    });
    
    return enrollments.map(enrollment => this.mapToEnrollmentEntity(enrollment));
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        course: true,
        user: true,
        progress: true
      }
    });
    
    return enrollments.map(enrollment => this.mapToEnrollmentEntity(enrollment));
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { 
        userId,
        courseId 
      },
      include: {
        course: true,
        user: true,
        progress: true
      }
    });
    
    if (!enrollment) return null;
    
    return this.mapToEnrollmentEntity(enrollment);
  }

  async create(userId: string, courseId: string, status?: string): Promise<Enrollment> {
    const enrollmentStatus = status 
      ? this.convertToEnrollmentStatus(status) 
      : PrismaEnrollmentStatus.ACTIVE;
    
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: enrollmentStatus
      },
      include: {
        course: true,
        user: true,
        progress: true
      }
    });
    
    return this.mapToEnrollmentEntity(enrollment);
  }

  async update(id: string, enrollment: Partial<Enrollment>): Promise<Enrollment> {
    const data: Prisma.EnrollmentUpdateInput = {};
    
    if (enrollment.status) {
      data.status = this.convertToEnrollmentStatus(enrollment.status.toString());
    }
    
    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id },
      data,
      include: {
        course: true,
        user: true,
        progress: true
      }
    });
    
    return this.mapToEnrollmentEntity(updatedEnrollment);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.enrollment.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateStatus(id: string, status: string): Promise<Enrollment> {
    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id },
      data: {
        status: this.convertToEnrollmentStatus(status)
      },
      include: {
        course: true,
        user: true,
        progress: true
      }
    });
    
    return this.mapToEnrollmentEntity(updatedEnrollment);
  }

  async updateProgress(id: string, lessonId: string, completed: boolean): Promise<Enrollment> {
    // Kiểm tra xem progress đã tồn tại cho enrollment và lesson này chưa
    const existingProgress = await this.prisma.progress.findFirst({
      where: {
        enrollmentId: id,
        lessonId
      }
    });
    
    if (existingProgress) {
      // Cập nhật progress nếu đã tồn tại
      await this.prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
        completed,
          lastAccessed: new Date()
        }
      });
    } else {
      // Tạo progress mới nếu chưa tồn tại
      await this.prisma.progress.create({
        data: {
          enrollmentId: id,
          lessonId,
          completed,
          lastAccessed: new Date()
        }
      });
    }
    
    // Trả về enrollment đã cập nhật
    return this.findById(id) as Promise<Enrollment>;
  }
  
  // Helper method để chuyển đổi từ dữ liệu Prisma sang Entity
  private mapToEnrollmentEntity(prismaEnrollment: PrismaEnrollmentWithRelations): Enrollment {
    const enrollment = new Enrollment();
    
    enrollment.id = prismaEnrollment.id;
    enrollment.userId = prismaEnrollment.userId;
    enrollment.courseId = prismaEnrollment.courseId;
    enrollment.status = this.convertToEntityStatus(prismaEnrollment.status);
    enrollment.createdAt = prismaEnrollment.createdAt;
    enrollment.updatedAt = prismaEnrollment.updatedAt;
    
    // Gán thông tin về course nếu có
    if ('course' in prismaEnrollment && prismaEnrollment.course) {
      enrollment.course = this.mapToCourseEntity(prismaEnrollment.course as PrismaCourse);
    }
    
    // Gán thông tin về user nếu có
    if ('user' in prismaEnrollment && prismaEnrollment.user) {
      enrollment.user = this.mapToUserEntity(prismaEnrollment.user as PrismaUser);
    }
    
    // Gán thông tin về progress nếu có
    if ('progress' in prismaEnrollment && prismaEnrollment.progress) {
      // Chuyển đổi mỗi progress item từ prisma sang entity
      enrollment.progress = prismaEnrollment.progress.map(item => {
        const progress = new Progress();
        progress.id = item.id;
        progress.enrollmentId = item.enrollmentId;
        progress.lessonId = item.lessonId;
        progress.completed = item.completed;
        progress.lastAccessed = item.lastAccessed || undefined;
        progress.timeSpent = item.timeSpent || undefined;
        progress.attentionScore = item.attentionScore || undefined;
        progress.interactionCount = item.interactionCount || undefined;
        progress.notes = item.notes || undefined;
        progress.revisitCount = item.revisitCount;
        progress.createdAt = item.createdAt;
        progress.updatedAt = item.updatedAt;
        
        // Chuyển đổi enum LessonDifficulty nếu có
        if (item.difficulty) {
          progress.difficulty = this.convertLessonDifficulty(item.difficulty);
        }
        
        return progress;
      });
    }
    
    return enrollment;
  }
  
  // Helper method để chuyển đổi Course từ Prisma sang Entity
  private mapToCourseEntity(prismaCourse: PrismaCourse): Course {
    const course = new Course();
    course.id = prismaCourse.id;
    course.title = prismaCourse.title;
    course.description = prismaCourse.description;
    course.price = Number(prismaCourse.price); // Chuyển đổi từ Decimal sang number
    course.isFree = prismaCourse.isFree;
    course.isPublished = prismaCourse.isPublished;
    course.categoryId = prismaCourse.categoryId;
    course.instructorId = prismaCourse.instructorId;
    course.thumbnail = prismaCourse.thumbnail;
    course.introVideo = prismaCourse.introVideo;
    course.prerequisites = prismaCourse.prerequisites;
    course.learningOutcomes = prismaCourse.learningOutcomes;
    course.totalStudents = prismaCourse.totalStudents;
    course.totalLessons = prismaCourse.totalLessons;
    course.status = this.convertCourseStatus(prismaCourse.status);
    course.language = prismaCourse.language;
    course.averageRating = prismaCourse.averageRating;
    course.totalRatings = prismaCourse.totalRatings;
    course.createdAt = prismaCourse.createdAt;
    course.updatedAt = prismaCourse.updatedAt;
    return course;
  }
  
  // Helper method để chuyển đổi User từ Prisma sang Entity
  private mapToUserEntity(prismaUser: PrismaUser): User {
    const user = new User();
    user.id = prismaUser.id;
    user.email = prismaUser.email;
    user.password = prismaUser.password;
    user.firstName = prismaUser.firstName;
    user.lastName = prismaUser.lastName;
    user.role = this.convertUserRole(prismaUser.role);
    user.createdAt = prismaUser.createdAt;
    user.updatedAt = prismaUser.updatedAt;
    return user;
  }
  
  // Helper method để chuyển đổi UserRole từ Prisma sang Entity
  private convertUserRole(role: PrismaUserRole): UserRole {
    // Chuyển đổi enum UserRole từ Prisma sang Entity
    switch(role) {
      case PrismaUserRole.STUDENT:
        return UserRole.STUDENT;
      case PrismaUserRole.INSTRUCTOR:
        return UserRole.INSTRUCTOR;
      case PrismaUserRole.ADMIN:
        return UserRole.ADMIN; 
      case PrismaUserRole.USER:
        return UserRole.USER;
      default:
        return UserRole.STUDENT;
    }
  }
  
  // Helper method để chuyển đổi giữa các enum EnrollmentStatus
  private convertToEnrollmentStatus(status: string): PrismaEnrollmentStatus {
    switch (status) {
      case EnrollmentStatus.ACTIVE:
        return PrismaEnrollmentStatus.ACTIVE;
      case EnrollmentStatus.COMPLETED:
        return PrismaEnrollmentStatus.COMPLETED;
      case EnrollmentStatus.CANCELLED:
        return PrismaEnrollmentStatus.CANCELLED;
      default:
        return PrismaEnrollmentStatus.ACTIVE;
    }
  }
  
  private convertToEntityStatus(status: PrismaEnrollmentStatus): EnrollmentStatus {
    switch (status) {
      case PrismaEnrollmentStatus.ACTIVE:
        return EnrollmentStatus.ACTIVE;
      case PrismaEnrollmentStatus.COMPLETED:
        return EnrollmentStatus.COMPLETED;
      case PrismaEnrollmentStatus.CANCELLED:
        return EnrollmentStatus.CANCELLED;
      default:
        return EnrollmentStatus.ACTIVE;
    }
  }

  // Helper method để chuyển đổi CourseStatus từ Prisma sang Entity
  private convertCourseStatus(status: PrismaCourseStatus): CourseStatus {
    switch(status) {
      case PrismaCourseStatus.DRAFT:
        return CourseStatus.DRAFT;
      case PrismaCourseStatus.PUBLISHED:
        return CourseStatus.PUBLISHED;
      case PrismaCourseStatus.ARCHIVED:
        return CourseStatus.ARCHIVED;
      default:
        return CourseStatus.DRAFT;
    }
  }

  // Helper method để chuyển đổi LessonDifficulty từ Prisma sang Entity
  private convertLessonDifficulty(difficulty: PrismaLessonDifficulty): LessonDifficulty {
    switch(difficulty) {
      case PrismaLessonDifficulty.EASY:
        return LessonDifficulty.EASY;
      case PrismaLessonDifficulty.MEDIUM:
        return LessonDifficulty.MEDIUM;
      case PrismaLessonDifficulty.HARD:
        return LessonDifficulty.HARD;
      default:
        return LessonDifficulty.MEDIUM;
    }
  }
} 