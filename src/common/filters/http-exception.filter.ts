/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Determinar el código HTTP (si no es HttpException, asumimos 500)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obtener la respuesta nativa del error de NestJS
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    // Formatear el mensaje dependiendo de la estructura del error
    let message: string | string[] = 'Error interno del servidor';
    let errorName = 'Internal Server Error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const resObj = exceptionResponse as Record<string, any>;
      message = resObj['message'] || message;
      errorName = resObj['error'] || errorName;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Formato normalizado de error
    response.status(status).json({
      success: false,
      statusCode: status,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
