import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: Record<string, string[] | string>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Validation Error',
        message: 'Validation failed',
        errors,
      },
      HttpStatus.BAD_REQUEST
    );
  }
} 
