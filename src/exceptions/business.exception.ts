import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BusinessException extends BaseException {
  constructor(
    message: string | string[],
    errorCode = 'BUSINESS_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, errorCode, true, details);
  }
}
