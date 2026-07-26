import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ValidationException extends BaseException {
  constructor(
    message: string | string[],
    errorCode = 'VALIDATION_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, errorCode, true, details);
  }
}
