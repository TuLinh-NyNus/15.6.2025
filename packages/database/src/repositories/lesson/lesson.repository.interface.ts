import { Lesson } from '@project/entities';
import { LessonFiltersDto } from '@project/dto';

export interface ILessonRepository {
  findAll(filters: LessonFiltersDto): Promise<[Lesson[], number]>;
  findById(id: string): Promise<Lesson | null>;
  findByCourse(courseId: string): Promise<Lesson[]>;
  create(lesson: Partial<Lesson>): Promise<Lesson>;
  update(id: string, lesson: Partial<Lesson>): Promise<Lesson>;
  delete(id: string): Promise<void>;
  findByOrder(courseId: string, order: number): Promise<Lesson | null>;
  countByCourse(courseId: string): Promise<number>;
}
