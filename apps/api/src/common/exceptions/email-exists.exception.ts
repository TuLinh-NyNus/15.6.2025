import { ConflictException } from '@nestjs/common';

export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super('Email đã được sử dụng. Vui lòng sử dụng email khác.');
  }
}
