import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        status = HttpStatus.CONFLICT;
        message = `Đã tồn tại dữ liệu với ${this.extractConstraintField(exception)}`;
        break;
      
      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Không tìm thấy dữ liệu';
        break;
        
      case 'P2003': // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Ràng buộc khóa ngoại không hợp lệ';
        break;
        
      case 'P2014': // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Quan hệ không hợp lệ';
        break;
      
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Lỗi cơ sở dữ liệu';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }

  private extractConstraintField(exception: Prisma.PrismaClientKnownRequestError): string {
    const target = exception.meta?.target;
    if (target && Array.isArray(target)) {
      return target.join(', ');
    }
    return 'trường không xác định';
  }
} 