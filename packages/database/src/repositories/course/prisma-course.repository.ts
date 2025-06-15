import { Injectable } from '@nestjs/common';
import {
  Course,
  CourseStatus,
  User,
  Category,
  Lesson,
  Enrollment,
  UserRole,
  LessonType,
  EnrollmentStatus,
} from '@project/entities';
import { CourseFiltersDto } from '@project/dto';
import { ICourseRepository } from './course.repository.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Define the precise payload type based on includes used across methods
// This ensures type safety in the mapping function
type PrismaCoursePayload = Prisma.CourseGetPayload<{
  include: {
    category: true;   // Include the full Category object
    instructor: true; // Include the full User object for instructor
    lessons: true;    // Include the full Lesson objects
    enrollments: true; // Include the full Enrollment objects
  };
}>;

type CourseCreateInput = Omit<Prisma.CourseCreateInput, 'category' | 'instructor'> & { 
  categoryId: string; 
  instructorId: string;
};

type CourseUpdateInput = Omit<Prisma.CourseUpdateInput, 'category' | 'instructor'> & { 
  categoryId?: string; 
  instructorId?: string; 
};

@Injectable()
export class PrismaCourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Strongly-typed helper function to map Prisma data to Course entity
  private mapToCourseEntity(prismaData: PrismaCoursePayload): Course {
    const course = new Course();

    // Direct scalar mappings
    course.id = prismaData.id;
    course.title = prismaData.title;
    course.description = prismaData.description;
    course.duration = prismaData.duration;
    course.price = Number(prismaData.price); // Convert Decimal to number
    course.isFree = prismaData.isFree;
    course.isPublished = prismaData.isPublished;
    course.categoryId = prismaData.categoryId;
    course.instructorId = prismaData.instructorId;
    course.thumbnail = prismaData.thumbnail || undefined;
    course.introVideo = prismaData.introVideo || undefined;
    course.prerequisites = prismaData.prerequisites || []; // Default to empty array
    course.learningOutcomes = prismaData.learningOutcomes || []; // Default to empty array
    course.totalStudents = prismaData.totalStudents || 0; // Default to 0
    course.totalLessons = prismaData.totalLessons || 0;   // Default to 0
    course.status = prismaData.status as CourseStatus; // Map Enum (assuming values match)
    course.language = prismaData.language;
    course.averageRating = prismaData.averageRating || 0; // Default to 0
    course.totalRatings = prismaData.totalRatings || 0;   // Default to 0
    course.createdAt = prismaData.createdAt;
    course.updatedAt = prismaData.updatedAt;

    // Map Category relation (if included and not null)
    if (prismaData.category) {
      const category = new Category();
      category.id = prismaData.category.id;
      category.name = prismaData.category.name;
      category.description = prismaData.category.description || undefined;
      category.slug = prismaData.category.slug; // Required field
      category.imageUrl = prismaData.category.imageUrl || undefined;
      category.order = prismaData.category.order;
      category.isVisible = prismaData.category.isVisible;
      category.parentId = prismaData.category.parentId ?? undefined; // Handle null parentId
      category.createdAt = prismaData.category.createdAt;
      category.updatedAt = prismaData.category.updatedAt;
      course.category = category;
    } else {
      course.category = undefined; // Explicitly set to undefined if not present
    }

    // Map Instructor relation (if included and not null)
    if (prismaData.instructor) {
      const instructor = new User();
      instructor.id = prismaData.instructor.id;
      instructor.email = prismaData.instructor.email;
      instructor.firstName = prismaData.instructor.firstName;
      instructor.lastName = prismaData.instructor.lastName;
      instructor.role = prismaData.instructor.role as UserRole; // Map Enum
      instructor.createdAt = prismaData.instructor.createdAt;
      instructor.updatedAt = prismaData.instructor.updatedAt;
      course.instructor = instructor;
    } else {
       // This case should ideally not happen if instructorId is mandatory
       // and relation constraints are set, but handle defensively.
       course.instructor = undefined;
    }

    // Map Lessons array relation (if included)
    course.lessons = prismaData.lessons?.map(lessonData => {
      const lesson = new Lesson();
      lesson.id = lessonData.id;
      lesson.title = lessonData.title;
      lesson.content = lessonData.content;
      lesson.order = lessonData.order;
      lesson.type = lessonData.type as LessonType; // Map Enum
      lesson.isFree = lessonData.isFree;
      lesson.courseId = lessonData.courseId;
      lesson.createdAt = lessonData.createdAt;
      lesson.updatedAt = lessonData.updatedAt;
      return lesson;
    }) || [];

    // Map Enrollments array relation (if included)
    course.enrollments = prismaData.enrollments?.map(enrollmentData => {
      const enrollment = new Enrollment();
      enrollment.id = enrollmentData.id;
      enrollment.userId = enrollmentData.userId;
      enrollment.courseId = enrollmentData.courseId;
      enrollment.status = enrollmentData.status as EnrollmentStatus; // Map Enum
      enrollment.createdAt = enrollmentData.createdAt;
      enrollment.updatedAt = enrollmentData.updatedAt;
      return enrollment;
    }) || [];

    return course;
  }

  async findAll(filters: CourseFiltersDto): Promise<{ courses: Course[]; total: number }> {
    const { search, category, minPrice, maxPrice, status, language, sort, limit = 10, page = 1 } = filters;
    const skip = (page - 1) * limit;
    
    const where: Prisma.CourseWhereInput = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.categoryId = category;
    // Handle price filters using Prisma.Decimal
    if (minPrice !== undefined) {
      where.price = {
        gte: new Prisma.Decimal(minPrice)
      };
    }
    if (maxPrice !== undefined && where.price) {
      // Chỉ thêm điều kiện lte nếu where.price đã tồn tại
      const priceWhere = where.price as Prisma.DecimalFilter<"Course">;
      priceWhere.lte = new Prisma.Decimal(maxPrice);
    } else if (maxPrice !== undefined) {
      // Nếu where.price chưa tồn tại, tạo mới
      where.price = {
        lte: new Prisma.Decimal(maxPrice)
      };
    }
    // Map entity status enum to Prisma status enum for filtering
    if (status) {
       // Assuming CourseStatus enum values match Prisma's CourseStatus enum values
      where.status = status as Prisma.EnumCourseStatusFilter['equals'];
    } else {
      where.status = 'PUBLISHED'; // Default filter
    }
    if (language) where.language = language;

    let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort) {
      const [field, order] = sort.split(':');
      // Basic validation for orderBy field and direction
      if (field && (order === 'asc' || order === 'desc')) {
         // Add specific allowed fields check here if needed for security/robustness
         // e.g., const allowedSortFields = ['createdAt', 'price', 'title'];
         // if (allowedSortFields.includes(field))
        orderBy = { [field]: order };
      }
    }

    // Define the include object once for consistency
    const includePayload = {
      category: true,
      instructor: true,
      lessons: true,
      enrollments: true,
    };

    // Use transaction for findMany and count
    const [prismaCourses, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: includePayload,
      }),
      this.prisma.course.count({ where }),
    ]);

    // Explicitly cast the result to the defined payload type before mapping
    const typedCourses = prismaCourses as PrismaCoursePayload[];
    return {
      courses: typedCourses.map(prismaCourse => this.mapToCourseEntity(prismaCourse)),
      total,
    };
  }

  async findById(id: string): Promise<Course | null> {
    const prismaCourse = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: true,
        lessons: true,
        enrollments: true,
      },
    });
    
    if (!prismaCourse) return null;
    // Cast result to the payload type before mapping
    return this.mapToCourseEntity(prismaCourse as PrismaCoursePayload);
  }

  async findByInstructor(instructorId: string): Promise<Course[]> {
     const prismaCourses = await this.prisma.course.findMany({
      where: { instructorId },
      include: {
        category: true,
        instructor: true,
        lessons: true,
        enrollments: true,
      },
    });
    // Cast result array to payload type before mapping
    return (prismaCourses as PrismaCoursePayload[]).map(prismaCourse => this.mapToCourseEntity(prismaCourse));
  }

  async findByCategory(categoryId: string): Promise<Course[]> {
    const prismaCourses = await this.prisma.course.findMany({
      where: { categoryId },
      include: {
        category: true,
        instructor: true,
        lessons: true,
        enrollments: true,
      },
    });
    // Cast result array to payload type before mapping
    return (prismaCourses as PrismaCoursePayload[]).map(prismaCourse => this.mapToCourseEntity(prismaCourse));
  }

  async create(data: CourseCreateInput): Promise<Course> {
    // Tạo bản sao của data
    const { categoryId, instructorId, ...courseData } = data;
    
    // Xử lý price trước khi tạo
    const dataToSubmit: Prisma.CourseCreateInput = {
      ...courseData,
      price: data.price !== undefined ? new Prisma.Decimal(data.price.toString()) : new Prisma.Decimal(0),
      category: {
        connect: { id: categoryId }
      },
      instructor: {
        connect: { id: instructorId }
      }
    };

    const prismaCourse = await this.prisma.course.create({
      data: dataToSubmit,
      include: {
        category: true,
        instructor: true,
        lessons: true,
        enrollments: true
      },
    });
    
    return this.mapToCourseEntity(prismaCourse as PrismaCoursePayload);
  }

  async update(id: string, data: CourseUpdateInput): Promise<Course> {
    // Tạo bản sao của data và phân tách các trường đặc biệt
    const { categoryId, instructorId, ...updateData } = data;
    
    // Xử lý price nếu có
    const dataToSubmit: Prisma.CourseUpdateInput = {
      ...updateData
    };
    
    if (typeof data.price !== 'undefined') {
      dataToSubmit.price = new Prisma.Decimal(data.price.toString());
    }
    
    // Xử lý category và instructor nếu có
    if (categoryId) {
      dataToSubmit.category = { connect: { id: categoryId } };
    }
    
    if (instructorId) {
      dataToSubmit.instructor = { connect: { id: instructorId } };
    }

    const prismaCourse = await this.prisma.course.update({
      where: { id },
      data: dataToSubmit,
      include: {
        category: true,
        instructor: true,
        lessons: true,
        enrollments: true,
      },
    });
    // Cast result to the payload type before mapping
    return this.mapToCourseEntity(prismaCourse as PrismaCoursePayload);
  }

  async delete(id: string): Promise<void> {
    // Check if related entities need handling before deletion if constraints allow nulls
    // e.g., remove enrollments first if needed
    await this.prisma.course.delete({
      where: { id },
    });
    // Method returns void as per interface, no return value needed
  }

  // Use the correct input type for atomic operations
  async incrementStudentCount(id: string): Promise<Course> {
    const prismaCourse = await this.prisma.course.update({
      where: { id },
      data: {
        totalStudents: {
          increment: 1,
        },
      }, // Prisma.CourseUpdateInput is inferred correctly here
      include: {
        category: true,
        instructor: true,
        lessons: true,
        enrollments: true,
      },
    });
    // Cast result to the payload type before mapping
    return this.mapToCourseEntity(prismaCourse as PrismaCoursePayload);
  }

  // Use the correct input type for atomic operations
  async updateRating(id: string, rating: number): Promise<Course> {
    // Cách làm đúng là lấy totalRatings và averageRating hiện tại,
    // tính toán average mới, và cập nhật cả hai giá trị
    const currentCourse = await this.prisma.course.findUnique({
      where: { id },
      select: { totalRatings: true, averageRating: true }
    });
    
    if (!currentCourse) {
      throw new Error('Course not found');
    }
    
    // Tính toán đánh giá trung bình mới
    const newTotalRatings = currentCourse.totalRatings + 1;
    const currentTotalPoints = currentCourse.averageRating * currentCourse.totalRatings;
    const newAverageRating = (currentTotalPoints + rating) / newTotalRatings;
    
    const prismaCourse = await this.prisma.course.update({
      where: { id },
      data: {
        totalRatings: newTotalRatings,
        averageRating: newAverageRating
      },
      include: {
        category: true,
        instructor: true,
        lessons: true,
        enrollments: true,
      },
    });
    
    return this.mapToCourseEntity(prismaCourse as PrismaCoursePayload);
  }
} 