import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

/**
 * DTO cho yêu cầu tạo QuestionID
 */
export class GenerateQuestionIdDto {
  @ApiProperty({
    description: 'Lớp (tham số 1)',
    example: '0',
    required: true,
  })
  @IsNotEmpty({ message: 'Lớp không được để trống' })
  @IsString({ message: 'Lớp phải là chuỗi' })
  @Matches(/^[0-9A-Z]$/, {
    message: 'Lớp phải là 1 ký tự số [0-9] hoặc chữ cái in hoa [A-Z]',
  })
  grade: string;

  @ApiProperty({
    description: 'Môn (tham số 2)',
    example: 'P',
    required: true,
  })
  @IsNotEmpty({ message: 'Môn không được để trống' })
  @IsString({ message: 'Môn phải là chuỗi' })
  @Matches(/^[0-9A-Z]$/, {
    message: 'Môn phải là 1 ký tự số [0-9] hoặc chữ cái in hoa [A-Z]',
  })
  subject: string;

  @ApiProperty({
    description: 'Chương (tham số 3)',
    example: '1',
    required: true,
  })
  @IsNotEmpty({ message: 'Chương không được để trống' })
  @IsString({ message: 'Chương phải là chuỗi' })
  @Matches(/^[0-9A-Z]$/, {
    message: 'Chương phải là 1 ký tự số [0-9] hoặc chữ cái in hoa [A-Z]',
  })
  chapter: string;

  @ApiProperty({
    description: 'Mức độ (tham số 4)',
    example: 'N',
    required: true,
  })
  @IsNotEmpty({ message: 'Mức độ không được để trống' })
  @IsString({ message: 'Mức độ phải là chuỗi' })
  @Matches(/^[NHVCTM]$/, {
    message: 'Mức độ phải là 1 ký tự trong số: N, H, V, C, T, M',
  })
  level: string;

  @ApiProperty({
    description: 'Bài (tham số 5)',
    example: '1',
    required: true,
  })
  @IsNotEmpty({ message: 'Bài không được để trống' })
  @IsString({ message: 'Bài phải là chuỗi' })
  @Matches(/^[0-9A-Z]$/, {
    message: 'Bài phải là 1 ký tự số [0-9] hoặc chữ cái in hoa [A-Z]',
  })
  lesson: string;

  @ApiProperty({
    description: 'Dạng (tham số 6, chỉ có trong ID6)',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Dạng phải là chuỗi' })
  @Matches(/^[0-9A-Z]$/, {
    message: 'Dạng phải là 1 ký tự số [0-9] hoặc chữ cái in hoa [A-Z]',
  })
  form?: string;
}

/**
 * DTO cho response lấy cấu trúc MapID
 */
export class MapIdStructureResponseDto {
  @ApiProperty({
    description: 'Cấu trúc Lớp',
    example: {
      '0': 'Lớp 10',
      '1': 'Lớp 11',
      '2': 'Lớp 12',
    },
  })
  grade: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Môn',
    example: {
      'P': '10-NGÂN HÀNG CHÍNH',
    },
  })
  subject: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Chương',
    example: {
      '1': 'Mệnh đề và tập hợp',
    },
  })
  chapter: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Bài',
    example: {
      '1': 'Mệnh đề',
    },
  })
  lesson: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Dạng',
    example: {
      '1': 'Xác định mệnh đề, mệnh đề chứa biến',
    },
  })
  form: Record<string, string>;

  @ApiProperty({
    description: 'Cấu trúc Mức độ',
    example: {
      'N': 'Nhận biết',
      'H': 'Thông Hiểu',
      'V': 'VD',
      'C': 'VD Cao',
      'T': 'VIP',
      'M': 'Note',
    },
  })
  level: Record<string, string>;
}

/**
 * DTO cho response phân giải QuestionID
 */
export class ParseQuestionIdResponseDto {
  @ApiProperty({
    description: 'Lớp (tham số 1)',
    example: '0',
    required: false,
  })
  grade?: string;

  @ApiProperty({
    description: 'Môn (tham số 2)',
    example: 'P',
    required: false,
  })
  subject?: string;

  @ApiProperty({
    description: 'Chương (tham số 3)',
    example: '1',
    required: false,
  })
  chapter?: string;

  @ApiProperty({
    description: 'Mức độ (tham số 4)',
    example: 'N',
    required: false,
  })
  level?: string;

  @ApiProperty({
    description: 'Bài (tham số 5)',
    example: '1',
    required: false,
  })
  lesson?: string;

  @ApiProperty({
    description: 'Dạng (tham số 6, chỉ có trong ID6)',
    example: '1',
    required: false,
  })
  form?: string;

  @ApiProperty({
    description: 'Có phải là ID6 không',
    example: true,
    required: true,
  })
  isID6: boolean;

  @ApiProperty({
    description: 'QuestionID gốc',
    example: '0P1N1-1',
    required: true,
  })
  original: string;
}

/**
 * DTO cho response mô tả QuestionID
 */
export class QuestionIdDescriptionResponseDto {
  @ApiProperty({
    description: 'Thông tin về Lớp',
    example: {
      value: '0',
      description: 'Lớp 10',
    },
    required: false,
  })
  grade?: { value: string; description: string };

  @ApiProperty({
    description: 'Thông tin về Môn',
    example: {
      value: 'P',
      description: '10-NGÂN HÀNG CHÍNH',
    },
    required: false,
  })
  subject?: { value: string; description: string };

  @ApiProperty({
    description: 'Thông tin về Chương',
    example: {
      value: '1',
      description: 'Mệnh đề và tập hợp',
    },
    required: false,
  })
  chapter?: { value: string; description: string };

  @ApiProperty({
    description: 'Thông tin về Mức độ',
    example: {
      value: 'N',
      description: 'Nhận biết',
    },
    required: false,
  })
  level?: { value: string; description: string };

  @ApiProperty({
    description: 'Thông tin về Bài',
    example: {
      value: '1',
      description: 'Mệnh đề',
    },
    required: false,
  })
  lesson?: { value: string; description: string };

  @ApiProperty({
    description: 'Thông tin về Dạng',
    example: {
      value: '1',
      description: 'Xác định mệnh đề, mệnh đề chứa biến',
    },
    required: false,
  })
  form?: { value: string; description: string };

  @ApiProperty({
    description: 'Mô tả đầy đủ',
    example: 'Lớp: Lớp 10 | Môn: 10-NGÂN HÀNG CHÍNH | Chương: Mệnh đề và tập hợp | Mức độ: Nhận biết | Bài: Mệnh đề | Dạng: Xác định mệnh đề, mệnh đề chứa biến',
    required: true,
  })
  fullDescription: string;
}

/**
 * DTO cho response validate QuestionID
 */
export class ValidateQuestionIdResponseDto {
  @ApiProperty({
    description: 'QuestionID có hợp lệ không',
    example: true,
    required: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Danh sách lỗi nếu có',
    example: [],
    required: true,
  })
  errors: string[];
}

/**
 * DTO cho response generate QuestionID
 */
export class GenerateQuestionIdResponseDto {
  @ApiProperty({
    description: 'QuestionID được tạo',
    example: '0P1N1-1',
    required: true,
  })
  questionId: string;
} 