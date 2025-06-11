import { Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';
import { QuestionVersionService } from '../services/question-version.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Request } from 'express';

class UserInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  fullName?: string;
}

class QuestionVersionResponseDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  questionId: string;
  
  @ApiProperty()
  version: number;
  
  @ApiProperty()
  content: string;
  
  @ApiProperty()
  rawContent: string;
  
  @ApiProperty()
  changedAt: Date;
  
  @ApiProperty()
  changedById?: string;
  
  @ApiProperty({ type: UserInfo, required: false })
  changedBy?: UserInfo;

  constructor(partial: Partial<QuestionVersionResponseDto>) {
    Object.assign(this, partial);
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
class QuestionVersionCompareDto {
  @ApiProperty({ type: QuestionVersionResponseDto })
  previous: QuestionVersionResponseDto;
  
  @ApiProperty({ type: QuestionVersionResponseDto })
  current: QuestionVersionResponseDto;
  
  constructor(partial: Partial<QuestionVersionCompareDto>) {
    Object.assign(this, partial);
  }
}

class RevertQuestionVersionDto {
  @ApiProperty()
  success: boolean;
  
  @ApiProperty()
  message: string;
  
  constructor(partial: Partial<RevertQuestionVersionDto>) {
    Object.assign(this, partial);
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

interface QuestionVersionResult {
  id: string;
  questionId: string;
  version: number;
  content: string;
  rawContent: string;
  changedAt: Date;
  changedById: string;
  email?: string;
  fullName?: string;
}

@ApiTags('Question Versions')
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionVersionController {
  constructor(private readonly versionService: QuestionVersionService) {}

  @Get(':id/versions')
  @ApiOperation({ summary: 'Lấy tất cả phiên bản của một câu hỏi' })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách các phiên bản',
    type: [QuestionVersionResponseDto]
  })
  @Roles('admin', 'teacher')
  async getVersions(@Param('id') id: string): Promise<QuestionVersionResponseDto[]> {
    const versions = await this.versionService.findAllVersionsByQuestionId(id) as QuestionVersionResult[];
    return versions.map(version => new QuestionVersionResponseDto({
      id: version.id,
      questionId: version.questionId,
      version: version.version,
      content: version.content,
      rawContent: version.rawContent,
      changedAt: version.changedAt,
      changedById: version.changedById,
      changedBy: version.email ? {
        id: version.changedById,
        email: version.email,
        fullName: version.fullName
      } : undefined
    }));
  }

  @Get(':id/versions/:versionId')
  @ApiOperation({ summary: 'Lấy chi tiết một phiên bản câu hỏi' })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiParam({ name: 'versionId', description: 'ID của phiên bản' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chi tiết phiên bản',
    type: QuestionVersionResponseDto
  })
  @Roles('admin', 'teacher')
  async getVersionById(
    @Param('id') id: string,
    @Param('versionId') versionId: string
  ): Promise<QuestionVersionResponseDto> {
    const version = await this.versionService.findById(versionId) as QuestionVersionResult;
    return new QuestionVersionResponseDto({
      id: version.id,
      questionId: version.questionId,
      version: version.version,
      content: version.content,
      rawContent: version.rawContent,
      changedAt: version.changedAt,
      changedById: version.changedById,
      changedBy: version.email ? {
        id: version.changedById,
        email: version.email,
        fullName: version.fullName
      } : undefined
    });
  }

  @Post(':id/revert/:versionId')
  @ApiOperation({ summary: 'Khôi phục câu hỏi về phiên bản trước đó' })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiParam({ name: 'versionId', description: 'ID của phiên bản cần khôi phục' })
  @ApiResponse({ 
    status: 200, 
    description: 'Câu hỏi đã được khôi phục',
    type: QuestionVersionResponseDto
  })
  @Roles('admin', 'teacher')
  async revertToVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Req() req: Request & { user: { id: string } }
  ): Promise<QuestionVersionResponseDto> {
    const userId = req.user.id;
    const result = await this.versionService.revertToVersion(id, versionId, userId);
    return new QuestionVersionResponseDto({
      id: `${result.questionId}_v${result.version}`, // Temporary ID
      questionId: result.questionId,
      version: result.version,
      content: result.content,
      rawContent: result.content, // Sử dụng content vì QuestionVersionData không có rawContent
      changedAt: new Date(),
      changedById: userId
    });
  }
} 