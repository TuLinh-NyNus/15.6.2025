import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserProfileRepository } from './user-profile-repository.interface';
import { UserProfile } from '@project/entities';
import { Prisma } from '@prisma/client';
import type { UserProfileSocialLinks, UserProfilePreferences } from '../../types/prisma';

@Injectable()
export class PrismaUserProfileRepository implements IUserProfileRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    bio?: string;
    phoneNumber?: string;
    address?: string;
    birthDate?: Date;
    avatarUrl?: string;
    socialLinks?: UserProfileSocialLinks;
    preferences?: UserProfilePreferences;
  }): Promise<UserProfile> {
    const sql = Prisma.sql`
      INSERT INTO "user_profiles" (
        "userId",
        "bio",
        "phoneNumber",
        "address",
        "birthDate",
        "avatarUrl",
        "socialLinks",
        "preferences",
        "completionRate"
      ) VALUES (
        ${data.userId},
        ${data.bio ?? null},
        ${data.phoneNumber ?? null},
        ${data.address ?? null},
        ${data.birthDate ?? null},
        ${data.avatarUrl ?? null},
        ${data.socialLinks ? JSON.stringify(data.socialLinks) : null}::jsonb,
        ${data.preferences ? JSON.stringify(data.preferences) : null}::jsonb,
        ${this.calculateCompletionRate(data as UserProfile)}
      )
      RETURNING *;
    `;
    
    const profile = await this.prisma.$queryRaw<[Prisma.JsonObject]>(sql);
    return this.mapToEntity(profile[0]);
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const sql = Prisma.sql`
      SELECT * FROM "user_profiles"
      WHERE "userId" = ${userId}
      LIMIT 1;
    `;
    
    const profile = await this.prisma.$queryRaw<[Prisma.JsonObject]>(sql);
    return profile.length > 0 ? this.mapToEntity(profile[0]) : null;
  }

  async update(userId: string, data: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile> {
    const updateData = { ...data };
    delete updateData.socialLinks;
    delete updateData.preferences;
    
    const socialLinks = data.socialLinks ? JSON.stringify(data.socialLinks) : undefined;
    const preferences = data.preferences ? JSON.stringify(data.preferences) : undefined;
    
    const sql = Prisma.sql`
      UPDATE "user_profiles"
      SET
        "bio" = COALESCE(${updateData.bio}, "bio"),
        "phoneNumber" = COALESCE(${updateData.phoneNumber}, "phoneNumber"),
        "address" = COALESCE(${updateData.address}, "address"),
        "birthDate" = COALESCE(${updateData.birthDate}, "birthDate"),
        "avatarUrl" = COALESCE(${updateData.avatarUrl}, "avatarUrl"),
        "socialLinks" = COALESCE(${socialLinks}::jsonb, "socialLinks"),
        "preferences" = COALESCE(${preferences}::jsonb, "preferences")
      WHERE "userId" = ${userId}
      RETURNING *;
    `;
    
    const profile = await this.prisma.$queryRaw<[Prisma.JsonObject]>(sql);
    return this.mapToEntity(profile[0]);
  }

  async remove(userId: string): Promise<void> {
    const sql = Prisma.sql`
      DELETE FROM "user_profiles"
      WHERE "userId" = ${userId};
    `;
    
    await this.prisma.$queryRaw(sql);
  }

  calculateCompletionRate(profile: UserProfile): number {
    const fields = [
      !!profile.bio,
      !!profile.phoneNumber,
      !!profile.address,
      !!profile.birthDate,
      !!profile.avatarUrl,
      !!profile.socialLinks,
      !!profile.preferences,
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  async updateCompletionRate(userId: string): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    const completionRate = this.calculateCompletionRate(profile);
    
    const sql = Prisma.sql`
      UPDATE "user_profiles"
      SET "completionRate" = ${completionRate}
      WHERE "userId" = ${userId}
      RETURNING *;
    `;
    
    const updatedProfile = await this.prisma.$queryRaw<[Prisma.JsonObject]>(sql);
    return this.mapToEntity(updatedProfile[0]);
  }

  private mapToEntity(prismaProfile: Prisma.JsonObject): UserProfile {
    const profile = new UserProfile();
    profile.id = prismaProfile.id as string;
    profile.userId = prismaProfile.userId as string;
    profile.bio = (prismaProfile.bio as string | null) || undefined;
    profile.phoneNumber = (prismaProfile.phoneNumber as string | null) || undefined;
    profile.address = (prismaProfile.address as string | null) || undefined;
    profile.birthDate = prismaProfile.birthDate ? new Date(prismaProfile.birthDate as string) : undefined;
    profile.avatarUrl = (prismaProfile.avatarUrl as string | null) || undefined;
    profile.completionRate = prismaProfile.completionRate as number;
    profile.createdAt = new Date(prismaProfile.createdAt as string);
    profile.updatedAt = new Date(prismaProfile.updatedAt as string);
    
    try {
      profile.socialLinks = prismaProfile.socialLinks
        ? JSON.parse(prismaProfile.socialLinks as string) as Record<string, string>
        : undefined;
    } catch {
      profile.socialLinks = undefined;
    }
    
    try {
      profile.preferences = prismaProfile.preferences 
        ? JSON.parse(prismaProfile.preferences as string) as UserProfilePreferences
        : undefined;
    } catch {
      profile.preferences = undefined;
    }
    
    return profile;
  }
} 