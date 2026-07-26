import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class InternalException extends BaseException {
  constructor(
    message = 'Error interno del servidor',
    errorCode = 'INTERNAL_ERROR',
    details?: Record<string, any>,
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode, false, details);
  }
}
