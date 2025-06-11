import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateEnrollmentDto, EnrollmentFiltersDto } from '@project/dto';
import { IEnrollmentRepository, ICourseRepository } from '@project/interfaces';
import { Enrollment, EnrollmentStatus, User, CourseStatus } from '@project/entities';

@Injectable()
export class EnrollmentsService {
  constructor(
    @Inject('IEnrollmentRepository') private enrollmentRepository: IEnrollmentRepository,
    @Inject('ICourseRepository') private courseRepository: ICourseRepository,
  ) {}

  async findAll(filters: EnrollmentFiltersDto): Promise<{ enrollments: Enrollment[]; total: number }> {
    return this.enrollmentRepository.findAll(filters);
  }

  async findById(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findById(id);
    
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    
    return enrollment;
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.findByUser(userId);
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.findByCourse(courseId);
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    return this.enrollmentRepository.findByUserAndCourse(userId, courseId);
  }

  async create(createEnrollmentDto: CreateEnrollmentDto, user: User): Promise<Enrollment> {
    const { courseId, status = EnrollmentStatus.ACTIVE } = createEnrollmentDto;
    
    // Kiểm tra xem khóa học có tồn tại không
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    
    // Kiểm tra xem khóa học đã được xuất bản chưa
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('Cannot enroll in an unpublished course');
    }
    
    // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
    const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(user.id, courseId);
    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this course');
    }
    
    // Tạo đăng ký mới
    const enrollment = await this.enrollmentRepository.create(user.id, courseId, status);
    
    // Tăng số lượng học viên của khóa học
    await this.courseRepository.incrementStudentCount(courseId);
    
    return enrollment;
  }

  async update(id: string, enrollment: Partial<Enrollment>): Promise<Enrollment> {
    await this.findById(id); // Kiểm tra xem đăng ký có tồn tại không
    return this.enrollmentRepository.update(id, enrollment);
  }

  async delete(id: string): Promise<boolean> {
    await this.findById(id); // Kiểm tra xem đăng ký có tồn tại không
    return this.enrollmentRepository.delete(id);
  }

  async updateStatus(id: string, status: EnrollmentStatus): Promise<Enrollment> {
    await this.findById(id); // Kiểm tra xem đăng ký có tồn tại không
    return this.enrollmentRepository.updateStatus(id, status);
  }

  async updateProgress(id: string, lessonId: string, completed: boolean): Promise<Enrollment> {
    await this.findById(id); // Kiểm tra xem đăng ký có tồn tại không
    return this.enrollmentRepository.updateProgress(id, lessonId, completed);
  }
} 