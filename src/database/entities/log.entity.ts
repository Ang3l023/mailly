import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Client } from './client.entity';
import { SentMail } from './sent-mail.entity';
import { BaseEntity } from './base.entity';
import { ELogLevel } from '../../common/enums/logs/log-level.enum';

@Entity({ name: 'logs' })
export class Log extends BaseEntity {
  @Index()
  @Column({
    type: 'enum',
    enum: ELogLevel,
    default: ELogLevel.INFO,
  })
  level!: ELogLevel;

  @Index()
  @Column({ length: 100 })
  event!: string;

  @Column({ type: 'text' })
  message!: string;

  @Index()
  @Column({ length: 100, nullable: true })
  context!: string;

  @ManyToOne(() => Client, (client) => client.logs, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client!: Client | null;

  @ManyToOne(() => SentMail, (sentMail) => sentMail.logs, { nullable: true })
  @JoinColumn({ name: 'sent_mail_id' })
  sentMail!: SentMail | null;

  @Index()
  @Column({ nullable: false, type: String, length: 150, name: 'request_id' })
  requestId!: string | null;

  @Column({ length: 50, nullable: true, type: String, name: 'entity_type' })
  entityType!: string | null;

  @Column({ type: 'int', nullable: true, name: 'entity_id' })
  entityId!: number | null;

  @Column({ type: 'text', nullable: true, default: null })
  metadata!: string | null;

  @Column({ type: 'text', nullable: true, name: 'stack_trace' })
  stackTrace!: string | null;

  @Column({ length: 45, nullable: true, name: 'ip_address', type: String })
  ipAddress!: string | null;

  @Column({ length: 255, nullable: true, name: 'user_agent', type: String })
  userAgent!: string | null;
}
