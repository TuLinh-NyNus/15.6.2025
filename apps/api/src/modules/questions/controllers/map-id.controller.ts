import { 
  Body, 
  Controller, 
  Get, 
  HttpException, 
  HttpStatus, 
  Logger, 
  Param, 
  Post
} from '@nestjs/common';
import { 
  ApiOperation, 
  ApiParam, 
  ApiResponse, 
  ApiTags 
} from '@nestjs/swagger';
import { MapIDService } from '../services/map-id.service';
import { 
  GenerateQuestionIdDto,
  GenerateQuestionIdResponseDto,
  MapIdStructureResponseDto,
  ParseQuestionIdResponseDto,
  QuestionIdDescriptionResponseDto,
  ValidateQuestionIdResponseDto
} from '../dtos/map-id.dto';
import { getErrorMessage } from '../../../utils/error-handler';

/**
 * Controller quản lý các endpoints liên quan đến MapID
 */
@ApiTags('MapID')
@Controller('map-id')
export class MapIDController {
  private readonly logger = new Logger(MapIDController.name);

  constructor(private readonly mapIdService: MapIDService) {}

  /**
   * Lấy cấu trúc MapID
   */
  @Get('structure')
  @ApiOperation({ summary: 'Lấy cấu trúc MapID' })
  @ApiResponse({
    status: 200,
    description: 'Cấu trúc MapID',
    type: MapIdStructureResponseDto,
  })
  async getMapIdStructure(): Promise<MapIdStructureResponseDto> {
    try {
      this.logger.log('Yêu cầu lấy cấu trúc MapID');
      const structure = await this.mapIdService.getMapIdStructure();
      return structure;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy cấu trúc MapID: ${getErrorMessage(error)}`);
      throw new HttpException(
        'Không thể lấy cấu trúc MapID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Phân giải QuestionID thành các thành phần
   * @param questionId QuestionID cần phân giải
   */
  @Get('parse/:questionId')
  @ApiOperation({ summary: 'Phân giải QuestionID thành các thành phần' })
  @ApiParam({
    name: 'questionId',
    description: 'QuestionID cần phân giải (định dạng ID5 hoặc ID6)',
    example: '0P1N1-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả phân giải QuestionID',
    type: ParseQuestionIdResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'QuestionID không hợp lệ',
  })
  async parseQuestionId(
    @Param('questionId') questionId: string,
  ): Promise<ParseQuestionIdResponseDto> {
    try {
      this.logger.log(`Yêu cầu phân giải QuestionID: ${questionId}`);
      const result = await this.mapIdService.parseQuestionId(questionId);
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi phân giải QuestionID ${questionId}: ${getErrorMessage(error)}`);
      throw new HttpException(
        `Không thể phân giải QuestionID: ${getErrorMessage(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Lấy mô tả đầy đủ của QuestionID
   * @param questionId QuestionID cần lấy mô tả
   */
  @Get('describe/:questionId')
  @ApiOperation({ summary: 'Lấy mô tả đầy đủ của QuestionID' })
  @ApiParam({
    name: 'questionId',
    description: 'QuestionID cần lấy mô tả (định dạng ID5 hoặc ID6)',
    example: '0P1N1-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Mô tả đầy đủ của QuestionID',
    type: QuestionIdDescriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'QuestionID không hợp lệ',
  })
  async getQuestionIdDescription(
    @Param('questionId') questionId: string,
  ): Promise<QuestionIdDescriptionResponseDto> {
    try {
      this.logger.log(`Yêu cầu lấy mô tả QuestionID: ${questionId}`);
      const result = await this.mapIdService.getQuestionIdDescription(questionId);
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy mô tả QuestionID ${questionId}: ${getErrorMessage(error)}`);
      throw new HttpException(
        `Không thể lấy mô tả QuestionID: ${getErrorMessage(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validate QuestionID
   * @param questionId QuestionID cần validate
   */
  @Get('validate/:questionId')
  @ApiOperation({ summary: 'Validate QuestionID' })
  @ApiParam({
    name: 'questionId',
    description: 'QuestionID cần validate (định dạng ID5 hoặc ID6)',
    example: '0P1N1-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả validate QuestionID',
    type: ValidateQuestionIdResponseDto,
  })
  async validateQuestionId(
    @Param('questionId') questionId: string,
  ): Promise<ValidateQuestionIdResponseDto> {
    try {
      this.logger.log(`Yêu cầu validate QuestionID: ${questionId}`);
      const result = await this.mapIdService.validateQuestionId(questionId);
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi validate QuestionID ${questionId}: ${getErrorMessage(error)}`);
      throw new HttpException(
        `Không thể validate QuestionID: ${getErrorMessage(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Tạo QuestionID từ các thành phần
   * @param dto DTO chứa các thành phần của QuestionID
   */
  @Post('generate')
  @ApiOperation({ summary: 'Tạo QuestionID từ các thành phần' })
  @ApiResponse({
    status: 201,
    description: 'QuestionID được tạo thành công',
    type: GenerateQuestionIdResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Thông tin không hợp lệ',
  })
  async generateQuestionId(
    @Body() dto: GenerateQuestionIdDto,
  ): Promise<GenerateQuestionIdResponseDto> {
    try {
      this.logger.log(`Yêu cầu tạo QuestionID từ các thành phần: ${JSON.stringify(dto)}`);
      const questionId = await this.mapIdService.generateQuestionId(dto);
      return { questionId };
    } catch (error) {
      this.logger.error(`Lỗi khi tạo QuestionID: ${getErrorMessage(error)}`);
      throw new HttpException(
        `Không thể tạo QuestionID: ${getErrorMessage(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 
