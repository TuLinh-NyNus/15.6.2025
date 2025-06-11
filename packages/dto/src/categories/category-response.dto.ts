import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@project/entities';

export class CategoryResponseDto {
  @ApiProperty({ description: 'ID của danh mục' })
  id!: string;

  @ApiProperty({ description: 'Tên danh mục' })
  name!: string;

  @ApiProperty({ description: 'Mô tả về danh mục', required: false })
  description?: string;

  @ApiProperty({ description: 'ID của danh mục cha (nếu có)', required: false })
  parentId?: string;

  @ApiProperty({ description: 'Thông tin danh mục cha', required: false })
  parent?: CategoryResponseDto;

  @ApiProperty({ description: 'Danh sách các danh mục con', type: [CategoryResponseDto], required: false })
  children?: CategoryResponseDto[];

  @ApiProperty({ description: 'Thứ tự hiển thị của danh mục', required: false })
  order?: number;

  @ApiProperty({ description: 'Số lượng khóa học trong danh mục', required: false })
  courseCount?: number;

  @ApiProperty({ description: 'Đường dẫn slug của danh mục', required: false })
  slug?: string;

  @ApiProperty({ description: 'URL hình ảnh đại diện của danh mục', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Có hiển thị danh mục không', default: true })
  isVisible!: boolean;

  @ApiProperty({ description: 'Ngày tạo danh mục' })
  createdAt!: Date;

  @ApiProperty({ description: 'Ngày cập nhật danh mục' })
  updatedAt!: Date;

  static fromEntity(category: Category, includeChildren = false): CategoryResponseDto {
    const response = new CategoryResponseDto();
    response.id = category.id;
    response.name = category.name;
    response.description = category.description;
    response.parentId = category.parentId;
    response.order = category.order;
    response.slug = category.slug;
    response.imageUrl = category.imageUrl;
    response.isVisible = category.isVisible;
    response.createdAt = category.createdAt;
    response.updatedAt = category.updatedAt;
    
    // Chỉ thêm thông tin về parent khi có
    if (category.parent) {
      response.parent = CategoryResponseDto.fromEntity(category.parent, false);
    }
    
    // Chỉ thêm thông tin về children khi yêu cầu và có dữ liệu
    if (includeChildren && category.children && category.children.length > 0) {
      response.children = category.children.map(child => 
        CategoryResponseDto.fromEntity(child, false)
      );
    }
    
    // Thêm số lượng khóa học nếu có
    if (category.courses) {
      response.courseCount = category.courses.length;
    }
    
    return response;
  }
} 