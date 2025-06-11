import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';
 
export class UpdateExamDto extends PartialType(OmitType(CreateExamDto, ['createdBy'] as const)) {
  // Kế thừa tất cả các thuộc tính từ CreateExamDto nhưng đều là optional (PartialType)
  // Loại bỏ trường createdBy vì không thể thay đổi người tạo (OmitType)
} 