import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestContext, RequestContextData } from '../context/request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';

    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const context: RequestContextData = {
      requestId,
      ipAddress,
      userAgent,
      clientId: req.client?.id || null,
    };

    // Guardamos también en el request por si se necesita
    req.context = context;

    // Devolvemos el requestId en la respuesta
    res.setHeader('x-request-id', requestId);

    // Ejecutamos el resto de la petición dentro del contexto
    requestContext.run(context, () => {
      next();
    });
  }
}
