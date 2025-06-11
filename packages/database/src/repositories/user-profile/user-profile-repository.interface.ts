import { UserProfile } from '@project/entities';

export interface IUserProfileRepository {
  create(data: {
    userId: string;
    bio?: string;
    phoneNumber?: string;
    address?: string;
    birthDate?: Date;
    avatarUrl?: string;
    socialLinks?: Record<string, string>;
    preferences?: Record<string, unknown>;
  }): Promise<UserProfile>;

  findByUserId(userId: string): Promise<UserProfile | null>;
  
  update(userId: string, data: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile>;
  
  remove(userId: string): Promise<void>;
  
  calculateCompletionRate(profile: UserProfile): number;
  
  updateCompletionRate(userId: string): Promise<UserProfile>;
} 