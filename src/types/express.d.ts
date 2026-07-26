// src/common/types/express.d.ts
import 'express';
import { Client } from '../database/entities/client.entity';
import { RequestContextData } from '../common/context/request-context';

declare global {
  namespace Express {
    interface Request {
      client?: Omit<
        Client,
        'logs' | 'sentMails' | 'createdAt' | 'updatedAt' | 'deletedAt'
      >;
      context?: RequestContextData;
    }
  }
}
