import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICategoryRepository } from '@project/interfaces';
import { Category } from '@project/entities';
import { CategoryFiltersDto } from '@project/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: CategoryFiltersDto): Promise<[Category[], number]> {
    const {
      search,
      parentId,
      rootOnly,
      isVisible,
      includeChildren,
      page = 1,
      limit = 10,
      sort = 'order:asc'
    } = filters;

    // Xây dựng điều kiện where
    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (parentId) {
      where.parentId = parentId;
    } else if (rootOnly) {
      where.parentId = null;
    }

    if (isVisible !== undefined) {
      where.isVisible = isVisible;
    }

    // Xây dựng điều kiện order by
    const [field, direction] = sort.split(':');
    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [field]: direction === 'desc' ? 'desc' : 'asc'
    };

    // Tính toán phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách category và tổng số
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          parent: !includeChildren, // Lấy thông tin parent nếu không include children
          children: includeChildren, // Chỉ lấy children khi được yêu cầu
          _count: {
            select: { courses: true }
          }
        }
      }),
      this.prisma.category.count({ where })
    ]);

    // Map dữ liệu trả về
    const categoryEntities = categories.map(category => this.mapPrismaCategoryToEntity(category, includeChildren));

    return [categoryEntities, total];
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    if (!category) return null;

    return this.mapPrismaCategoryToEntity(category);
  }

  async findByParent(parentId: string | null): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      include: {
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return categories.map(category => this.mapPrismaCategoryToEntity(category));
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { id: { in: ids } },
      include: {
        parent: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    return categories.map(category => this.mapPrismaCategoryToEntity(category));
  }

  async findWithCourses(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        courses: true,
        parent: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    if (!category) return null;

    return this.mapPrismaCategoryToEntity(category, false, true);
  }

  async findWithChildren(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            _count: {
              select: { courses: true }
            }
          }
        },
        parent: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    if (!category) return null;

    return this.mapPrismaCategoryToEntity(category, true);
  }

  async findRoot(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return categories.map(category => this.mapPrismaCategoryToEntity(category, true));
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const { name, description, parentId, order, slug, imageUrl, isVisible } = categoryData;

    const category = await this.prisma.category.create({
      data: {
        name: name!,
        description,
        parentId,
        order: order || 0,
        slug,
        imageUrl,
        isVisible: isVisible ?? true
      },
      include: {
        parent: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    return this.mapPrismaCategoryToEntity(category);
  }

  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    const { name, description, parentId, order, slug, imageUrl, isVisible } = categoryData;

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        parentId,
        order,
        slug,
        imageUrl,
        isVisible
      },
      include: {
        parent: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    return this.mapPrismaCategoryToEntity(category);
  }

  async delete(id: string): Promise<boolean> {
    // Kiểm tra nếu category có children
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      // Nếu có children, đặt parentId của chúng thành null
      await this.prisma.category.updateMany({
        where: { parentId: id },
        data: { parentId: null }
      });
    }

    // Xóa category
    await this.prisma.category.delete({
      where: { id }
    });

    return true;
  }

  async updateOrder(id: string, order: number): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data: { order },
      include: {
        parent: true,
        _count: {
          select: { courses: true }
        }
      }
    });

    return this.mapPrismaCategoryToEntity(category);
  }

  async countCourses(categoryId: string): Promise<number> {
    return this.prisma.course.count({
      where: {
        categoryId,
      },
    });
  }

  async addCoursesToCategory(categoryId: string, courseIds: string[]): Promise<Category> {
    await this.prisma.course.updateMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      data: {
        categoryId,
      },
    });

    return this.findWithCourses(categoryId) as Promise<Category>;
  }

  async removeCoursesFromCategory(categoryId: string, courseIds: string[]): Promise<Category> {
    await this.prisma.course.updateMany({
      where: {
        id: {
          in: courseIds,
        },
        categoryId,
      },
      data: {
        categoryId: null,
      },
    });

    return this.findWithCourses(categoryId) as Promise<Category>;
  }

  // Helper method để chuyển đổi từ dữ liệu Prisma sang Entity
  private mapPrismaCategoryToEntity(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaCategory: any,
    includeChildren = false,
    includeCourses = false
  ): Category {
    const category = new Category();
    category.id = prismaCategory.id;
    category.name = prismaCategory.name;
    category.description = prismaCategory.description || undefined;
    category.slug = prismaCategory.slug || undefined;
    category.parentId = prismaCategory.parentId || undefined;
    category.order = prismaCategory.order;
    category.imageUrl = prismaCategory.imageUrl || undefined;
    category.isVisible = prismaCategory.isVisible;
    category.createdAt = prismaCategory.createdAt;
    category.updatedAt = prismaCategory.updatedAt;

    // Thêm thông tin parent nếu có
    if (prismaCategory.parent) {
      category.parent = this.mapPrismaCategoryToEntity(prismaCategory.parent);
    }

    // Thêm thông tin children nếu có và được yêu cầu
    if (includeChildren && prismaCategory.children && Array.isArray(prismaCategory.children)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category.children = prismaCategory.children.map((child: any) =>
        this.mapPrismaCategoryToEntity(child)
      );
    }

    // Thêm thông tin courses nếu có và được yêu cầu
    if (includeCourses && prismaCategory.courses && Array.isArray(prismaCategory.courses)) {
      category.courses = prismaCategory.courses;
    }

    return category;
  }
} 