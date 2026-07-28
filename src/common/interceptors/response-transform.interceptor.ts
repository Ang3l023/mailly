import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { SuccessResponse } from '../interfaces/success-response.interface';
import { getRequestContext } from '../context/request-context';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const statusCode =
      context.switchToHttp().getResponse<Response>().statusCode ||
      HttpStatus.OK;

    const { requestId } = getRequestContext();

    return next.handle().pipe(
      map<any, SuccessResponse<T>>((data: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const isAlreadyFormatted =
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'message' in data;

        if (isAlreadyFormatted) {
          return {
            statusCode,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            message: data.message || 'Operación exitosa',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            data: data.data,
            requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const isPaginatedFormatted: boolean =
          data && typeof data === 'object' && 'data' in data && 'meta' in data;

        if (isPaginatedFormatted) {
          return {
            statusCode,
            message: 'Operación exitosa',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            data: data.data,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            meta: data.meta || {},
            requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        return {
          statusCode,
          message: 'Operación exitosa',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data,
          requestId,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
