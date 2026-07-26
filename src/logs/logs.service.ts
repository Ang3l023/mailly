import { Injectable } from '@nestjs/common';
import { LogsRepository } from './repositories/logs.repository';
import { ELogLevel } from '../common/enums/logs/log-level.enum';
import { Client } from '../database/entities/client.entity';
import { SentMail } from '../database/entities/sent-mail.entity';

export interface CreateLogDto {
  level?: ELogLevel;
  event: string;
  message: string;
  context?: string;
  client?: Client;
  sentMail?: SentMail;
  requestId?: string;
  entityType?: string;
  entityId?: number;
  metadata?: Record<string, any>;
  stackTrace?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class LogsService {
  constructor(private readonly logRepository: LogsRepository) {}

  async log(data: CreateLogDto): Promise<void> {
    await this.logRepository.create({
      level: data.level || ELogLevel.INFO,
      event: data.event,
      message: data.message,
      context: data.context,
      client: data.client ?? null,
      sentMail: data.sentMail ?? null,
      requestId: data.requestId ?? null,
      entityType: data.entityType ?? null,
      entityId: data.entityId ?? null,
      metadata: JSON.stringify(data.metadata) ?? null,
      stackTrace: data.stackTrace ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    });
  }

  // Atajos de uso frecuente
  async info(event: string, message: string, extra?: Partial<CreateLogDto>) {
    return this.log({ level: ELogLevel.INFO, event, message, ...extra });
  }

  async warn(event: string, message: string, extra?: Partial<CreateLogDto>) {
    return this.log({ level: ELogLevel.WARN, event, message, ...extra });
  }

  async error(event: string, message: string, extra?: Partial<CreateLogDto>) {
    return this.log({ level: ELogLevel.ERROR, event, message, ...extra });
  }

  async critical(
    event: string,
    message: string,
    extra?: Partial<CreateLogDto>,
  ) {
    return this.log({ level: ELogLevel.CRITICAL, event, message, ...extra });
  }
}
