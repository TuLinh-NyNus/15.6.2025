import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ILessonRepository } from '@project/interfaces';
import { Lesson } from '@project/entities';
import { LessonFiltersDto } from '@project/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LessonRepository implements ILessonRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async findAll(filters: LessonFiltersDto): Promise<[Lesson[], number]> {
    const where: Prisma.LessonWhereInput & Record<string, unknown> = {};
    
    // Xây dựng điều kiện lọc
    if (filters.courseId) {
      where.courseId = filters.courseId;
    }
    
    if (filters.title) {
      where.title = {
        contains: filters.title,
        mode: 'insensitive'
      };
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.isFree !== undefined) {
      where.isFree = filters.isFree;
    }
    
    // Xác định sắp xếp
    let orderBy: Prisma.LessonOrderByWithRelationInput = { order: 'asc' };
    
    if (filters.sort) {
      const [field, direction] = filters.sort.split(':');
      orderBy = {
        [field]: direction === 'desc' ? 'desc' : 'asc'
      };
    }
    
    // Tính toán pagination
    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);
    const take = filters.limit || 10;
    
    // Thực hiện truy vấn
    const [lessons, count] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          course: true
        }
      }),
      this.prisma.lesson.count({ where })
    ]);
    
    return [lessons as unknown as Lesson[], count];
  }
  
  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        course: true
      }
    });
    
    return lesson as unknown as Lesson;
  }
  
  async findByCourse(courseId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { course: true }
    });
    
    return lessons as unknown as Lesson[];
  }
  
  async create(lesson: Partial<Lesson>): Promise<Lesson> {
    const data: Prisma.LessonCreateInput & Record<string, unknown> = {
      title: lesson.title!,
      content: lesson.content!,
      order: lesson.order!,
      course: {
        connect: {
          id: lesson.courseId!
        }
      }
    };
    
    // Thêm các trường tùy chọn nếu có
    if (lesson.description !== undefined) data.description = lesson.description;
    if (lesson.type !== undefined) data.type = lesson.type;
    if (lesson.isFree !== undefined) data.isFree = lesson.isFree;
    if (lesson.resourceUrl !== undefined) data.resourceUrl = lesson.resourceUrl;
    if (lesson.duration !== undefined) data.duration = lesson.duration;
    
    const createdLesson = await this.prisma.lesson.create({
      data,
      include: {
        course: true
      }
    });
    
    return createdLesson as unknown as Lesson;
  }
  
  async update(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
    const data: Prisma.LessonUpdateInput & Record<string, unknown> = {};
    
    // Chỉ cập nhật các trường được cung cấp
    if (lesson.title !== undefined) data.title = lesson.title;
    if (lesson.content !== undefined) data.content = lesson.content;
    if (lesson.order !== undefined) data.order = lesson.order;
    if (lesson.description !== undefined) data.description = lesson.description;
    if (lesson.type !== undefined) data.type = lesson.type;
    if (lesson.isFree !== undefined) data.isFree = lesson.isFree;
    if (lesson.resourceUrl !== undefined) data.resourceUrl = lesson.resourceUrl;
    if (lesson.duration !== undefined) data.duration = lesson.duration;
    
    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data,
      include: {
        course: true
      }
    });
    
    return updatedLesson as unknown as Lesson;
  }
  
  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({
      where: { id }
    });
  }
  
  async findByOrder(courseId: string, order: number): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        courseId,
        order
      }
    });
    
    return lesson as unknown as Lesson;
  }
  
  async countByCourse(courseId: string): Promise<number> {
    return this.prisma.lesson.count({
      where: { courseId }
    });
  }
} 