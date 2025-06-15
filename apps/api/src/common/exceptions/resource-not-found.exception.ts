import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    const message = id 
      ? `${resource} with ID ${id} not found` 
      : `${resource} not found`;
    
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message,
      }, 
      HttpStatus.NOT_FOUND
    );
  }
} 
