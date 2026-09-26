import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    const headerValue = request.headers['x-timezone'] as string;
    const clientTimezone =
      typeof headerValue === 'string' ? headerValue : 'UTC';

    return next.handle().pipe(
      map((data: unknown) => {
        return this.transformDates(data, clientTimezone);
      }),
    );
  }

  private transformDates(obj: unknown, tz: string): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Date) {
      return dayjs(obj).utc().tz(tz).format();
    }

    if (Array.isArray(obj)) {
      return obj.map((item: unknown) => this.transformDates(item, tz));
    }

    if (typeof obj === 'object') {
      const copiedObj: Record<string, unknown> = {};
      const typedObj = obj as Record<string, unknown>;

      for (const key of Object.keys(typedObj)) {
        const value = typedObj[key];

        if (value instanceof Date) {
          copiedObj[key] = dayjs(value).utc().tz(tz).format();
        } else {
          copiedObj[key] = this.transformDates(value, tz);
        }
      }

      return copiedObj;
    }

    // Si es un tipo primitivo (string, number, boolean), se devuelve tal cual
    return obj;
  }
}
