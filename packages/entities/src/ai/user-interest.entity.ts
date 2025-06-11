import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

export class UserInterest {
  id: string;
  userId: string;
  user?: User;
  categoryId: string;
  category?: Category;
  interestLevel: number;
  createdAt: Date;
  updatedAt: Date;
} 