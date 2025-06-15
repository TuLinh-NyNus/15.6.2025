import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Public } from '../../../modules/auth/decorators/public.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { getErrorMessage } from '../../../utils/error-handler';

@ApiTags('simple-questions')
@Controller('simple-questions')
export class SimpleQuestionsController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Test endpoint để kiểm tra difficulty filtering' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi với difficulty filtering',
  })
  @Public()
  async findAll(@Query() query: any) {
    try {
      console.log('SimpleQuestionsController.findAll - Query:', query);
      
      // Extract filters
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build where condition
      const whereCondition: any = {};
      
      // Difficulty filtering
      if (query.difficulties) {
        const difficulties = Array.isArray(query.difficulties) 
          ? query.difficulties 
          : [query.difficulties];
        whereCondition.difficulty = {
          in: difficulties
        };
        console.log('Filtering by difficulties:', difficulties);
      }
      
      // Type filtering
      if (query.types) {
        const types = Array.isArray(query.types) 
          ? query.types 
          : [query.types];
        whereCondition.type = {
          in: types
        };
        console.log('Filtering by types:', types);
      }
      
      // Status filtering
      if (query.statuses) {
        const statuses = Array.isArray(query.statuses) 
          ? query.statuses 
          : [query.statuses];
        whereCondition.status = {
          in: statuses
        };
        console.log('Filtering by statuses:', statuses);
      }
      
      // Search filtering
      if (query.search) {
        whereCondition.OR = [
          { content: { contains: query.search, mode: 'insensitive' } },
          { rawContent: { contains: query.search, mode: 'insensitive' } }
        ];
        console.log('Filtering by search:', query.search);
      }
      
      console.log('Final where condition:', JSON.stringify(whereCondition, null, 2));
      
      // Get questions
      const questions = await this.prisma.question.findMany({
        where: whereCondition,
        select: {
          id: true,
          content: true,
          difficulty: true,
          type: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          usageCount: true,
          questionId: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      });
      
      // Get total count
      const total = await this.prisma.question.count({
        where: whereCondition,
      });
      
      console.log(`Found ${questions.length} questions out of ${total} total`);
      
      return {
        success: true,
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filters: {
          difficulties: query.difficulties,
          types: query.types,
          statuses: query.statuses,
          search: query.search,
        }
      };
    } catch (error) {
      console.error('Error in SimpleQuestionsController.findAll:', error);
      return {
        success: false,
        error: getErrorMessage(error),
        questions: [],
        total: 0,
      };
    }
  }

  @Get('test')
  @ApiOperation({ summary: 'Simple test endpoint' })
  @Public()
  async test() {
    return {
      success: true,
      message: 'Simple Questions Controller is working!',
      timestamp: new Date().toISOString(),
    };
  }
}
