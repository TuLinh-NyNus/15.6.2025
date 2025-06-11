import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { QuestionStatus, QuestionType } from '@project/entities';

/**
 * DTO cho việc import một câu hỏi từ mã LaTeX
 */
export class QuestionImportDto {
  @ApiProperty({ 
    description: 'Nội dung LaTeX của câu hỏi',
    example: '\\begin{ex}%[Nguồn: "Nguồn câu hỏi"]%[1P1V1-6]\nLời dẫn câu hỏi\n\\choice\n{đáp án 1}\n{đáp án 2}\n{\\True đáp án 3}\n{đáp án 4}\n\\loigiai{\nLời giải của câu hỏi\n}\n\\end{ex}'
  })
  @IsString()
  @IsNotEmpty()
  latexContent: string;

  @ApiProperty({ 
    description: 'ID của người tạo câu hỏi',
    required: false 
  })
  @IsOptional()
  @IsUUID()
  creatorId?: string;

  @ApiProperty({ 
    description: 'Trạng thái câu hỏi khi import',
    enum: QuestionStatus,
    required: false,
    default: QuestionStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;

  @ApiProperty({ 
    description: 'Danh sách tags để gán cho câu hỏi',
    type: [String],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'Có ghi đè câu hỏi nếu đã tồn tại không',
    default: false,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}

/**
 * DTO cho việc import nhiều câu hỏi cùng lúc
 */
export class BatchImportDto {
  @ApiProperty({ 
    description: 'Danh sách nội dung LaTeX của các câu hỏi',
    type: [QuestionImportDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionImportDto)
  questions: QuestionImportDto[];

  @ApiProperty({ 
    description: 'ID của người tạo câu hỏi',
    required: false 
  })
  @IsOptional()
  @IsUUID()
  creatorId?: string;

  @ApiProperty({ 
    description: 'Trạng thái câu hỏi khi import',
    enum: QuestionStatus,
    required: false,
    default: QuestionStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;

  @ApiProperty({ 
    description: 'Danh sách tags để gán cho tất cả câu hỏi',
    type: [String],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  commonTags?: string[];

  @ApiProperty({ 
    description: 'Có ghi đè câu hỏi nếu đã tồn tại không',
    default: false,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}

/**
 * DTO cho việc xuất câu hỏi ra định dạng LaTeX
 */
export class QuestionExportDto {
  @ApiProperty({ 
    description: 'Danh sách ID câu hỏi cần xuất',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questionIds?: string[];

  @ApiProperty({ 
    description: 'Danh sách tags để lọc câu hỏi cần xuất',
    type: [String],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'Loại câu hỏi để lọc',
    enum: QuestionType,
    required: false,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(QuestionType, { each: true })
  types?: QuestionType[];

  @ApiProperty({ 
    description: 'Format định dạng xuất (latex/json/excel)',
    default: 'latex',
    required: false 
  })
  @IsOptional()
  @IsString()
  @IsEnum(['latex', 'json', 'excel'])
  format?: 'latex' | 'json' | 'excel';

  @ApiProperty({ 
    description: 'Bao gồm lời giải trong nội dung xuất ra',
    default: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  includeSolution?: boolean;
}

/**
 * DTO cho kết quả import câu hỏi
 */
export class QuestionImportResultDto {
  @ApiProperty({ 
    description: 'Tổng số câu hỏi đã xử lý'
  })
  totalProcessed: number;

  @ApiProperty({ 
    description: 'Số câu hỏi import thành công'
  })
  successCount: number;

  @ApiProperty({ 
    description: 'Số câu hỏi import thất bại'
  })
  failureCount: number;

  @ApiProperty({ 
    description: 'Danh sách lỗi khi import',
    type: Array,
    required: false
  })
  errors?: Array<{
    index?: number;
    message: string;
    content?: string;
  }>;

  @ApiProperty({ 
    description: 'Danh sách ID các câu hỏi đã import thành công',
    type: [String],
    required: false
  })
  successIds?: string[];

  constructor(partial: Partial<QuestionImportResultDto>) {
    Object.assign(this, partial);
  }
} 