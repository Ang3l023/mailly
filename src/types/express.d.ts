// src/common/types/express.d.ts
import 'express';
import { Client } from '../database/entities/client.entity';

declare global {
  namespace Express {
    interface Request {
      client?: Omit<
        Client,
        'logs' | 'sentMails' | 'createdAt' | 'updatedAt' | 'deletedAt'
      >;
    }
  }
}
