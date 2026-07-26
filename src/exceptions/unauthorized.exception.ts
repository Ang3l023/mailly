import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class UnauthorizedException extends BaseException {
  constructor(
    message = 'No autorizado',
    errorCode = 'UNAUTHORIZED',
    details?: Record<string, any>,
  ) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode, true, details);
  }
}
