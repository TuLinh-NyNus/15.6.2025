import { Category } from "@project/entities";
import { CategoryFiltersDto } from '@project/dto';

export interface ICategoryRepository {
  findAll(filters: CategoryFiltersDto): Promise<[Category[], number]>;
  findById(id: string): Promise<Category | null>;
  findByParent(parentId: string | null): Promise<Category[]>;
  findByIds(ids: string[]): Promise<Category[]>;
  findWithCourses(id: string): Promise<Category | null>;
  findWithChildren(id: string): Promise<Category | null>;
  findRoot(): Promise<Category[]>;
  create(categoryData: Partial<Category>): Promise<Category>;
  update(id: string, categoryData: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<boolean>;
  updateOrder(id: string, order: number): Promise<Category>;
  addCoursesToCategory(categoryId: string, courseIds: string[]): Promise<Category>;
  removeCoursesFromCategory(categoryId: string, courseIds: string[]): Promise<Category>;
  countCourses(categoryId: string): Promise<number>;
}
