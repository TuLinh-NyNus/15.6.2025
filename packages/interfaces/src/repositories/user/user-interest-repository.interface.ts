import { IBaseRepository } from '../base/base-repository.interface';

// Sử dụng interface từ entity để đảm bảo type safety
export interface UserInterest {
  id: string;
  userId: string;
  categoryId: string;
  interestLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInterestRepository extends IBaseRepository<UserInterest, string> {
  findByUserId(userId: string): Promise<UserInterest[]>;
  findByCategoryId(categoryId: string): Promise<UserInterest[]>;
  findByUserAndCategory(userId: string, categoryId: string): Promise<UserInterest | null>;
  updateInterestLevel(id: string, interestLevel: number): Promise<UserInterest>;
} 