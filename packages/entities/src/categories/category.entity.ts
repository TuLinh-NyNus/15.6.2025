import { Course } from '../courses/course.entity';

export class Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  order: number;
  isVisible: boolean;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  courses?: Course[];
  createdAt: Date;
  updatedAt: Date;
} 