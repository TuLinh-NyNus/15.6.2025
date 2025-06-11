import { Injectable } from '@nestjs/common';
import { User, UserRole as EntityUserRole } from '@project/entities';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from './user-repository.interface';
import * as bcrypt from 'bcryptjs';
import { User as PrismaUser, UserRole as PrismaUserRole } from '.prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  // Helper function to convert Entity UserRole to Prisma UserRole
  private mapToPrismaRole(role?: EntityUserRole): PrismaUserRole {
    if (!role) return PrismaUserRole.STUDENT;
    
    switch(role) {
      case EntityUserRole.STUDENT:
        return PrismaUserRole.STUDENT;
      case EntityUserRole.INSTRUCTOR:
        return PrismaUserRole.INSTRUCTOR;
      case EntityUserRole.ADMIN:
        return PrismaUserRole.ADMIN;
      default:
        return PrismaUserRole.STUDENT;
    }
  }

  // Helper function to convert Prisma UserRole to Entity UserRole
  private mapToEntityRole(role: PrismaUserRole): EntityUserRole {
    switch(role) {
      case PrismaUserRole.STUDENT:
        return EntityUserRole.STUDENT;
      case PrismaUserRole.INSTRUCTOR:
        return EntityUserRole.INSTRUCTOR;
      case PrismaUserRole.ADMIN:
        return EntityUserRole.ADMIN;
      default:
        return EntityUserRole.STUDENT;
    }
  }

  // Helper function to map Prisma User to Entity User
  private mapToEntity(prismaUser: PrismaUser | Partial<PrismaUser>): User {
    return {
      id: prismaUser.id!,
      email: prismaUser.email!,
      firstName: prismaUser.firstName!,
      lastName: prismaUser.lastName!,
      role: this.mapToEntityRole(prismaUser.role as PrismaUserRole),
      createdAt: prismaUser.createdAt!,
      updatedAt: prismaUser.updatedAt!,
      password: prismaUser.password
    };
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: EntityUserRole;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const prismaUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: this.mapToPrismaRole(data.role),
      },
    });
    
    return this.mapToEntity(prismaUser);
  }

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
    
    return prismaUsers.map(user => this.mapToEntity(user));
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });
    
    return prismaUser ? this.mapToEntity(prismaUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
    
    return prismaUser ? this.mapToEntity(prismaUser) : null;
  }

  async update(id: string, data: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: EntityUserRole;
  }): Promise<User> {
    const updateData: Partial<PrismaUser> = { ...data };
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    if (data.role) {
      updateData.role = this.mapToPrismaRole(data.role);
    }
    
    const prismaUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
    
    return this.mapToEntity(prismaUser);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
} 