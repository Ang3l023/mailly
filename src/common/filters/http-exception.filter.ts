/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogsService } from '../../logs/logs.service';
import { getRequestContext } from '../context/request-context';
import { ELogLevel } from '../enums/logs/log-level.enum';
import { BaseException } from '../../exceptions/base.exception';
import { IErrorResponse } from '../interfaces/error-response.interface';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly appLogger: LogsService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { requestId, ipAddress, userAgent, clientId } = getRequestContext();

    const serialized = this.serializeException(exception);

    let client: { id: number } | undefined = undefined;

    if (clientId) {
      client = { id: clientId };
    }

    // Solo registramos errores NO controlados
    if (!serialized.isOperational) {
      await this.appLogger.log({
        level: ELogLevel.CRITICAL,
        event: 'UNHANDLED_EXCEPTION',
        message: Array.isArray(serialized.message)
          ? serialized.message.join(', ')
          : String(serialized.message),
        context: 'ExceptionFilter',
        requestId,
        ipAddress,
        userAgent,
        client: client as undefined,
        metadata: {
          statusCode: status,
          path: request.url,
          method: request.method,
          body: this.sanitizeBody(request.body),
          params: request.params,
          query: request.query,
          errorCode: serialized.errorCode,
        },
      });
    }

    const errorResponse: IErrorResponse = {
      statusCode: serialized.statusCode,
      errorCode: serialized.errorCode,
      message: serialized.message,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
      details: serialized.details,
    };

    response.status(serialized.statusCode).json(errorResponse);
  }

  /**
   * Serializa cualquier tipo de excepción a un formato consistente
   */
  private serializeException(exception: unknown): {
    statusCode: number;
    errorCode: string;
    message: string | string[];
    isOperational: boolean;
    details?: Record<string, any>;
  } {
    // 1. Excepciones personalizadas
    if (exception instanceof BaseException) {
      const serialized = exception.serialize();
      return {
        statusCode: serialized.statusCode,
        errorCode: serialized.errorCode,
        message: serialized.message,
        isOperational: exception.isOperational,
        details: serialized.details,
      };
    }

    // 2. HttpException nativa de NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        return {
          statusCode: status,
          errorCode: 'HTTP_EXCEPTION',
          message: res,
          isOperational: status < 500,
        };
      }

      return {
        statusCode: status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        errorCode: (res as any).errorCode || 'HTTP_EXCEPTION',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message: (res as any).message || exception.message,
        isOperational: status < 500,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        details: (res as any).details,
      };
    }

    // 3. Errores nativos de JavaScript / no controlados
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      isOperational: false,
    };
  }

  /**
   * Evita guardar información sensible en los logs
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
    ];

    for (const field of sensitiveFields) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (sanitized[field]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }
}
