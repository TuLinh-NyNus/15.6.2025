import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ILessonRepository } from '@project/interfaces';
import { Lesson } from '@project/entities';
import { LessonFiltersDto } from '@project/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LessonRepository implements ILessonRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async findAll(filters?: LessonFiltersDto): Promise<[Lesson[], number]> {
    if (filters) {
      return this.findAllWithFilters(filters);
    }
    
    const lessons = await this.prisma.lesson.findMany({
      include: {
        course: true
      }
    });
    
    return [lessons as unknown as Lesson[], lessons.length];
  }
  
  async findAllWithFilters(filters: LessonFiltersDto): Promise<[Lesson[], number]> {
    const where: Prisma.LessonWhereInput = {};
    
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
  
  async findByCourseId(courseId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { course: true }
    });
    
    return lessons as unknown as Lesson[];
  }
  
  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.findByCourseId(courseId);
  }
  
  async create(lesson: Partial<Lesson>): Promise<Lesson> {
    const createdLesson = await this.prisma.lesson.create({
      data: {
        title: lesson.title!,
        content: lesson.content!,
        order: lesson.order!,
        type: lesson.type!,
        courseId: lesson.courseId!,
        isFree: lesson.isFree || false
      },
      include: {
        course: true
      }
    });
    
    return createdLesson as unknown as Lesson;
  }
  
  async update(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
        type: lesson.type,
        isFree: lesson.isFree
      },
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