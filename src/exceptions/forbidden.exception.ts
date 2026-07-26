import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ForbiddenException extends BaseException {
  constructor(
    message = 'Acceso denegado',
    errorCode = 'FORBIDDEN',
    details?: Record<string, any>,
  ) {
    super(message, HttpStatus.FORBIDDEN, errorCode, true, details);
  }
}
