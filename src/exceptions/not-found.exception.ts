import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(
    resource = 'Recurso',
    errorCode = 'NOT_FOUND',
    details?: Record<string, any>,
  ) {
    super(`${resource}`, HttpStatus.NOT_FOUND, errorCode, true, details);
  }
}
