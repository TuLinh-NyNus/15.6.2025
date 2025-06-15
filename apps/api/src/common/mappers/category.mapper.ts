import { Category } from '@project/entities';
import { CategoryResponseDto } from '@project/dto';

export class CategoryMapper {
  /**
   * Chuyển đổi Category entity sang CategoryResponseDto
   */
  static toResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isVisible: category.isVisible !== undefined ? category.isVisible : true,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }
}
