import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCourseDto, UpdateCourseDto, CourseFiltersDto, RateCourseDto } from '@project/dto';
import { ICourseRepository } from '@project/interfaces';
import { Course, User } from '@project/entities';

// Tạo enum CourseStatus tạm thời phù hợp với định nghĩa trong @project/entities
enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

// Interface mở rộng để xử lý các trường bị thiếu
interface ExtendedCourse extends Partial<Course> {
  shortDescription?: string;
  categories?: string[];
}

@Injectable()
export class CoursesService {
  constructor(
    @Inject('ICourseRepository') private courseRepository: ICourseRepository
  ) {}

  async findAll(filters: CourseFiltersDto): Promise<{ courses: Course[]; total: number }> {
    return this.courseRepository.findAll(filters);
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return course;
  }

  async findByInstructor(instructorId: string): Promise<Course[]> {
    return this.courseRepository.findByInstructor(instructorId);
  }

  async findByCategory(categoryId: string): Promise<Course[]> {
    return this.courseRepository.findByCategory(categoryId);
  }

  async create(createCourseDto: CreateCourseDto, instructor: User): Promise<Course> {
    // Sử dụng type assertion để tránh lỗi kiểm tra kiểu
    const courseData: ExtendedCourse = {
      title: createCourseDto.title,
      description: createCourseDto.description,
      shortDescription: createCourseDto.shortDescription,
      duration: createCourseDto.duration,
      price: createCourseDto.price,
      isFree: createCourseDto.isFree,
      // Xử lý trường categories
      categoryId: createCourseDto.categories?.[0], // Giữ lại categoryId cho tương thích
      categories: createCourseDto.categories,
      thumbnail: createCourseDto.thumbnail,
      introVideo: createCourseDto.introVideo,
      prerequisites: createCourseDto.prerequisites,
      learningOutcomes: createCourseDto.learningOutcomes,
      status: this.mapStatus(createCourseDto.status),
      language: createCourseDto.language,
    };
    
    // Type cast để compiler không báo lỗi
    return this.courseRepository.create(courseData as Partial<Course>, instructor);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    // Check if course exists
    const existingCourse = await this.courseRepository.findById(id);
    
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    // Tạo đối tượng dữ liệu cập nhật với type assertion
    const courseData: ExtendedCourse = {};
    
    // Chỉ cập nhật các trường được cung cấp
    if (updateCourseDto.title !== undefined) courseData.title = updateCourseDto.title;
    if (updateCourseDto.description !== undefined) courseData.description = updateCourseDto.description;
    if (updateCourseDto.shortDescription !== undefined) courseData.shortDescription = updateCourseDto.shortDescription;
    if (updateCourseDto.duration !== undefined) courseData.duration = updateCourseDto.duration;
    if (updateCourseDto.price !== undefined) courseData.price = updateCourseDto.price;
    if (updateCourseDto.isFree !== undefined) courseData.isFree = updateCourseDto.isFree;
    if (updateCourseDto.thumbnail !== undefined) courseData.thumbnail = updateCourseDto.thumbnail;
    if (updateCourseDto.introVideo !== undefined) courseData.introVideo = updateCourseDto.introVideo;
    if (updateCourseDto.prerequisites !== undefined) courseData.prerequisites = updateCourseDto.prerequisites;
    if (updateCourseDto.learningOutcomes !== undefined) courseData.learningOutcomes = updateCourseDto.learningOutcomes;
    if (updateCourseDto.language !== undefined) courseData.language = updateCourseDto.language;
    
    // Xử lý trường status
    if (updateCourseDto.status !== undefined) {
      courseData.status = this.mapStatus(updateCourseDto.status);
    }
    
    // Xử lý trường categories
    if (updateCourseDto.categories !== undefined) {
      courseData.categories = updateCourseDto.categories;
      if (updateCourseDto.categories.length > 0) {
        courseData.categoryId = updateCourseDto.categories[0];
      }
    }
    
    return this.courseRepository.update(id, courseData as Partial<Course>);
  }

  async delete(id: string): Promise<boolean> {
    // Check if course exists
    const existingCourse = await this.courseRepository.findById(id);
    
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return this.courseRepository.delete(id);
  }

  async incrementStudentCount(id: string): Promise<Course> {
    // Check if course exists
    const existingCourse = await this.courseRepository.findById(id);
    
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return this.courseRepository.incrementStudentCount(id);
  }

  async rateCourse(id: string, rateDto: RateCourseDto): Promise<Course> {
    // Check if course exists
    const existingCourse = await this.courseRepository.findById(id);
    
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return this.courseRepository.updateRating(id, rateDto.rating);
  }

  // New methods for permissions handling
  async isOwner(courseId: string, userId: string): Promise<boolean> {
    const course = await this.courseRepository.findById(courseId);
    
    if (!course) {
      return false;
    }
    
    // Check if the instructor ID matches the user ID
    if (typeof course.instructor === 'string') {
      return course.instructor === userId;
    } else {
      return course.instructor.id === userId;
    }
  }

  async updateWithOwnerCheck(id: string, updateCourseDto: UpdateCourseDto, userId: string): Promise<Course> {
    const existingCourse = await this.courseRepository.findById(id);
    
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    const isOwner = await this.isOwner(id, userId);
    if (!isOwner) {
      throw new ForbiddenException('You do not have permission to update this course');
    }
    
    // Sử dụng phương thức update đã được cập nhật
    return this.update(id, updateCourseDto);
  }

  async deleteWithOwnerCheck(id: string, userId: string): Promise<boolean> {
    const existingCourse = await this.courseRepository.findById(id);
    
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    const isOwner = await this.isOwner(id, userId);
    if (!isOwner) {
      throw new ForbiddenException('You do not have permission to delete this course');
    }
    
    return this.courseRepository.delete(id);
  }

  async publishCourse(id: string, userId: string): Promise<Course> {
    const existingCourse = await this.courseRepository.findById(id);
    
    if (!existingCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    const isOwner = await this.isOwner(id, userId);
    if (!isOwner) {
      throw new ForbiddenException('You do not have permission to publish this course');
    }
    
    // Sử dụng enum CourseStatus thay vì string
    return this.courseRepository.update(id, { status: CourseStatus.PUBLISHED } as Partial<Course>);
  }
  
  // Helper method để map status
  private mapStatus(status?: string): CourseStatus {
    switch(status) {
      case 'DRAFT': return CourseStatus.DRAFT;
      case 'PUBLISHED': return CourseStatus.PUBLISHED;
      case 'ARCHIVED': return CourseStatus.ARCHIVED;
      default: return CourseStatus.DRAFT;
    }
  }
} 
