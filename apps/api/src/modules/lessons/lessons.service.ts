import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { LessonFiltersDto, CreateLessonDto, UpdateLessonDto } from '@project/dto';
import { Lesson, LessonType, UserRole, User } from '@project/entities';
import { ILessonRepository, ICourseRepository, IEnrollmentRepository } from '@project/interfaces';
import { Inject } from '@nestjs/common';

@Injectable()
export class LessonsService {
  constructor(
    @Inject('ILessonRepository')
    private readonly lessonRepository: ILessonRepository,
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
    @Inject('IEnrollmentRepository')
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async findAll(filters: LessonFiltersDto): Promise<[Lesson[], number]> {
    return this.lessonRepository.findAll(filters);
  }

  async findById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException(`Bài học với ID ${id} không tồn tại`);
    }
    return lesson;
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.lessonRepository.findByCourse(courseId);
  }

  async create(createLessonDto: CreateLessonDto, user: User): Promise<Lesson> {
    // Kiểm tra khóa học tồn tại
    const course = await this.courseRepository.findById(createLessonDto.courseId);
    if (!course) {
      throw new NotFoundException(`Khóa học với ID ${createLessonDto.courseId} không tồn tại`);
    }
    
    // Kiểm tra quyền - ADMIN có thể tạo bài học cho bất kỳ khóa học nào
    // INSTRUCTOR chỉ có thể tạo bài học cho khóa học do họ sở hữu
    if (user.role !== UserRole.ADMIN && course.instructorId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền tạo bài học cho khóa học này');
    }
    
    // Tính toán thứ tự nếu không được cung cấp
    if (!createLessonDto.order) {
      // Đếm số lượng bài học trong khóa học và cộng 1
      const existingLessons = await this.lessonRepository.findByCourse(createLessonDto.courseId);
      createLessonDto.order = existingLessons.length + 1;
    } else {
      // Kiểm tra xem đã có bài học nào cùng thứ tự chưa
      const existingLessons = await this.lessonRepository.findByCourse(createLessonDto.courseId);
      const existingLesson = existingLessons.find(lesson => lesson.order === createLessonDto.order);
      
      if (existingLesson) {
        throw new BadRequestException(`Đã tồn tại bài học với thứ tự ${createLessonDto.order} trong khóa học này`);
      }
    }
    
    // Đặt giá trị mặc định cho type nếu không được cung cấp
    if (!createLessonDto.type) {
      createLessonDto.type = LessonType.TEXT;
    }
    
    return this.lessonRepository.create(createLessonDto);
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, user: User): Promise<Lesson> {
    // Kiểm tra bài học tồn tại
    const lesson = await this.findById(id);
    
    // Kiểm tra khóa học tồn tại
    const course = await this.courseRepository.findById(lesson.courseId);
    if (!course) {
      throw new NotFoundException(`Khóa học với ID ${lesson.courseId} không tồn tại`);
    }
    
    // Kiểm tra quyền - ADMIN có thể cập nhật bất kỳ bài học nào
    // INSTRUCTOR chỉ có thể cập nhật bài học cho khóa học do họ sở hữu
    if (user.role !== UserRole.ADMIN && course.instructorId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền cập nhật bài học này');
    }
    
    // Kiểm tra thứ tự nếu được cập nhật
    if (updateLessonDto.order) {
      // Nếu cập nhật thứ tự và khác với thứ tự hiện tại
      if (updateLessonDto.order !== lesson.order) {
        const existingLessons = await this.lessonRepository.findByCourse(lesson.courseId);
        const existingLesson = existingLessons.find(lesson => lesson.order === updateLessonDto.order);
        
        if (existingLesson && existingLesson.id !== id) {
          throw new BadRequestException(
            `Đã tồn tại bài học với thứ tự ${updateLessonDto.order} trong khóa học này`
          );
        }
      }
    }
    
    return this.lessonRepository.update(id, updateLessonDto);
  }

  async delete(id: string, user: User): Promise<void> {
    // Kiểm tra bài học tồn tại
    const lesson = await this.findById(id);
    
    // Kiểm tra khóa học tồn tại
    const course = await this.courseRepository.findById(lesson.courseId);
    if (!course) {
      throw new NotFoundException(`Khóa học với ID ${lesson.courseId} không tồn tại`);
    }
    
    // Kiểm tra quyền - ADMIN có thể xóa bất kỳ bài học nào
    // INSTRUCTOR chỉ có thể xóa bài học cho khóa học do họ sở hữu
    if (user.role !== UserRole.ADMIN && course.instructorId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xóa bài học này');
    }
    
    await this.lessonRepository.delete(id);
  }
  
  async getLessonContent(id: string, user: User): Promise<Lesson> {
    // Kiểm tra bài học tồn tại
    const lesson = await this.findById(id);
    
    // Nếu bài học là free, cho phép truy cập không cần đăng ký
    if (lesson.isFree) {
      return lesson;
    }
    
    // Kiểm tra khóa học tồn tại
    const course = await this.courseRepository.findById(lesson.courseId);
    if (!course) {
      throw new NotFoundException(`Khóa học với ID ${lesson.courseId} không tồn tại`);
    }
    
    // ADMIN và INSTRUCTOR (là chủ sở hữu khóa học) có thể truy cập mà không cần đăng ký
    if (user.role === UserRole.ADMIN || (user.role === UserRole.INSTRUCTOR && course.instructorId === user.id)) {
      return lesson;
    }
    
    // Kiểm tra người dùng đã đăng ký khóa học chưa
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(user.id, lesson.courseId);
    if (!enrollment) {
      throw new ForbiddenException('Bạn cần đăng ký khóa học để xem nội dung bài học này');
    }
    
    return lesson;
  }
  
  async getLessonResources(id: string, user: User): Promise<string> {
    // Kiểm tra bài học tồn tại
    const lesson = await this.findById(id);
    
    // Kiểm tra bài học có tài liệu không
    if (!lesson.resourceUrl) {
      throw new NotFoundException('Bài học này không có tài liệu');
    }
    
    // Nếu bài học là free, cho phép truy cập không cần đăng ký
    if (lesson.isFree) {
      return lesson.resourceUrl;
    }
    
    // Kiểm tra khóa học tồn tại
    const course = await this.courseRepository.findById(lesson.courseId);
    if (!course) {
      throw new NotFoundException(`Khóa học với ID ${lesson.courseId} không tồn tại`);
    }
    
    // ADMIN và INSTRUCTOR (là chủ sở hữu khóa học) có thể truy cập mà không cần đăng ký
    if (user.role === UserRole.ADMIN || (user.role === UserRole.INSTRUCTOR && course.instructorId === user.id)) {
      return lesson.resourceUrl;
    }
    
    // Kiểm tra người dùng đã đăng ký khóa học chưa
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(user.id, lesson.courseId);
    if (!enrollment) {
      throw new ForbiddenException('Bạn cần đăng ký khóa học để tải tài liệu bài học này');
    }
    
    return lesson.resourceUrl;
  }
} 