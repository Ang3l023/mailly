import { HttpException, HttpStatus } from '@nestjs/common';
import { IErrorResponse } from '../common/interfaces/error-response.interface';

export type ISerializedException = Pick<
  IErrorResponse,
  'message' | 'errorCode' | 'statusCode' | 'details'
>;

export abstract class BaseException extends HttpException {
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    message: string | string[],
    status: HttpStatus,
    errorCode: string,
    isOperational = true,
    details?: Record<string, any>,
  ) {
    const response: ISerializedException = {
      message,
      errorCode,
      statusCode: status,
      details,
    };

    super(response, status);

    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
  }

  /**
   * Serializa la excepción a un objeto limpio
   */
  serialize(): ISerializedException {
    return {
      message: (this.getResponse() as ISerializedException).message,
      errorCode: this.errorCode,
      statusCode: this.getStatus(),
      details: this.details,
    };
  }
}
