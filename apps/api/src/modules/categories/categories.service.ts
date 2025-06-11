import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICategoryRepository, ICourseRepository } from '@project/interfaces';
import { Category, Course } from '@project/entities';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFiltersDto } from '@project/dto';
import { Inject } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
  ) {}

  async findAll(filters: CategoryFiltersDto): Promise<[Category[], number]> {
    return this.categoryRepository.findAll(filters);
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
    }
    return category;
  }

  async findByParent(parentId: string | null): Promise<Category[]> {
    return this.categoryRepository.findByParent(parentId);
  }

  async findWithCourses(id: string): Promise<Category> {
    const category = await this.categoryRepository.findWithCourses(id);
    if (!category) {
      throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
    }
    return category;
  }

  async findWithChildren(id: string): Promise<Category> {
    const category = await this.categoryRepository.findWithChildren(id);
    if (!category) {
      throw new NotFoundException(`Danh mục với ID ${id} không tồn tại`);
    }
    return category;
  }

  async findRoot(): Promise<Category[]> {
    return this.categoryRepository.findRoot();
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Kiểm tra parentId nếu được cung cấp
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findById(createCategoryDto.parentId);
      if (!parent) {
        throw new BadRequestException(`Danh mục cha với ID ${createCategoryDto.parentId} không tồn tại`);
      }
    }

    // Kiểm tra slug duplicate nếu được cung cấp
    if (createCategoryDto.slug) {
      // Logic kiểm tra slug có thể được thêm ở đây
    }

    // Tạo category mới
    const categoryData: Partial<Category> = {
      name: createCategoryDto.name,
      description: createCategoryDto.description,
      parentId: createCategoryDto.parentId,
      order: createCategoryDto.order,
      slug: createCategoryDto.slug || this.generateSlug(createCategoryDto.name),
      imageUrl: createCategoryDto.imageUrl,
      isVisible: createCategoryDto.isVisible !== undefined ? createCategoryDto.isVisible : true,
    };

    const category = await this.categoryRepository.create(categoryData);

    // Thêm khóa học vào category nếu được cung cấp
    if (createCategoryDto.courseIds && createCategoryDto.courseIds.length > 0) {
      await this.categoryRepository.addCoursesToCategory(category.id, createCategoryDto.courseIds);
    }

    return this.categoryRepository.findById(category.id) as Promise<Category>;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Kiểm tra category tồn tại
    const existingCategory = await this.findById(id);

    // Kiểm tra parentId nếu được cung cấp
    if (updateCategoryDto.parentId) {
      // Không cho phép đặt danh mục cha là chính nó
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Không thể đặt danh mục cha là chính nó');
      }

      // Kiểm tra danh mục cha tồn tại
      const parent = await this.categoryRepository.findById(updateCategoryDto.parentId);
      if (!parent) {
        throw new BadRequestException(`Danh mục cha với ID ${updateCategoryDto.parentId} không tồn tại`);
      }

      // Kiểm tra cycle trong quan hệ parent-child
      await this.checkCyclicReference(id, updateCategoryDto.parentId);
    }

    // Cập nhật slug nếu được cung cấp
    if (updateCategoryDto.slug) {
      // Logic kiểm tra slug có thể được thêm ở đây
    }

    // Chuẩn bị dữ liệu cập nhật
    const categoryData: Partial<Category> = {
      name: updateCategoryDto.name || existingCategory.name,
      description: updateCategoryDto.description !== undefined ? updateCategoryDto.description : existingCategory.description,
      parentId: updateCategoryDto.parentId !== undefined ? updateCategoryDto.parentId : existingCategory.parentId,
      order: updateCategoryDto.order !== undefined ? updateCategoryDto.order : existingCategory.order,
      slug: updateCategoryDto.slug || existingCategory.slug,
      imageUrl: updateCategoryDto.imageUrl || existingCategory.imageUrl,
      isVisible: updateCategoryDto.isVisible !== undefined ? updateCategoryDto.isVisible : existingCategory.isVisible,
    };

    // Cập nhật category
    await this.categoryRepository.update(id, categoryData);

    // Xử lý thêm khóa học vào category
    if (updateCategoryDto.addCourseIds && updateCategoryDto.addCourseIds.length > 0) {
      await this.categoryRepository.addCoursesToCategory(id, updateCategoryDto.addCourseIds);
    }

    // Xử lý xóa khóa học khỏi category
    if (updateCategoryDto.removeCourseIds && updateCategoryDto.removeCourseIds.length > 0) {
      await this.categoryRepository.removeCoursesFromCategory(id, updateCategoryDto.removeCourseIds);
    }

    return this.categoryRepository.findWithCourses(id) as Promise<Category>;
  }

  async delete(id: string): Promise<boolean> {
    // Kiểm tra category tồn tại
    await this.findById(id);

    // Kiểm tra xem có khóa học nào thuộc category này không
    const courseCount = await this.categoryRepository.countCourses(id);
    if (courseCount > 0) {
      throw new BadRequestException(`Không thể xóa danh mục vì có ${courseCount} khóa học liên kết`);
    }

    return this.categoryRepository.delete(id);
  }

  async updateOrder(id: string, order: number): Promise<Category> {
    // Kiểm tra category tồn tại
    await this.findById(id);

    return this.categoryRepository.updateOrder(id, order);
  }

  async getCoursesByCategory(id: string): Promise<Course[]> {
    // Kiểm tra category tồn tại
    await this.findById(id);

    // Lấy danh sách khóa học từ CourseRepository
    const courses = await this.courseRepository.findByCategory(id);
    return courses;
  }

  // Helper method để kiểm tra cycle trong quan hệ parent-child
  private async checkCyclicReference(categoryId: string, parentId: string): Promise<void> {
    // Kiểm tra xem categoryId có phải là parent (trực tiếp hoặc gián tiếp) của parentId không
    let currentParent = await this.categoryRepository.findById(parentId);
    
    while (currentParent && currentParent.parentId) {
      if (currentParent.parentId === categoryId) {
        throw new BadRequestException('Phát hiện tham chiếu vòng tròn trong quan hệ danh mục cha-con');
      }
      currentParent = await this.categoryRepository.findById(currentParent.parentId);
    }
  }

  // Helper method để generate slug từ tên
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
} 