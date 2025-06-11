import { Lesson } from '@project/entities';
import { CreateLessonDto, UpdateLessonDto, LessonFiltersDto } from '@project/dto';

export interface ILessonRepository {
  create(data: Partial<Lesson>): Promise<Lesson>;
  findById(id: string): Promise<Lesson | null>;
  findAll(filters?: LessonFiltersDto): Promise<[Lesson[], number]>;
  update(id: string, data: Partial<Lesson>): Promise<Lesson>;
  delete(id: string): Promise<void>;
  findByCourse(courseId: string): Promise<Lesson[]>;
  findByOrder(courseId: string, order: number): Promise<Lesson | null>;
  countByCourse(courseId: string): Promise<number>;
}
