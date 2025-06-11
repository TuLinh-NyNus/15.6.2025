import { PartialType } from '@nestjs/swagger';
import { CreateQuestionTagDto } from './create-question-tag.dto';

/**
 * DTO cho việc cập nhật QuestionTag
 */
export class UpdateQuestionTagDto extends PartialType(CreateQuestionTagDto) {} 