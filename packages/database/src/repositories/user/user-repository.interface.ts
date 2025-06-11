import { User, UserRole } from '@project/entities';

export interface IUserRepository {
  create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<User>;
  
  findAll(): Promise<User[]>;
  
  findByEmail(email: string): Promise<User | null>;
  
  findById(id: string): Promise<User | null>;
  
  update(id: string, data: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }): Promise<User>;
  
  remove(id: string): Promise<void>;
} 