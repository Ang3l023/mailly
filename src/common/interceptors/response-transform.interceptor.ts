import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse<Request>();
    const statusCode = response.statusCode!;

    return next.handle().pipe(
      map<any, Response<T>>((data) => ({
        success: true,
        statusCode,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: data ?? null, // Si el endpoint devuelve nada o void, envía null
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
