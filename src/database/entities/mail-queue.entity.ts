import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Client } from './client.entity';
import { Template } from './template.entity';

export enum MailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity()
export class MailQueue extends BaseEntity {
  @Column({ length: 255 })
  from!: string;

  @Column({ length: 255 })
  to!: string;

  @Column({ length: 255, nullable: true, type: String })
  cc?: string | null;

  @Column({ length: 255, nullable: true, type: String })
  bcc?: string | null;

  @Column({ length: 255 })
  subject!: string;

  @Column({ type: 'longtext' })
  html!: string;

  @ManyToOne(() => Template, (template) => template.queueMails)
  @JoinColumn({ name: 'template_id' })
  template?: Template | null;

  @Index()
  @Column({
    type: 'enum',
    enum: MailStatus,
    default: MailStatus.PENDING,
  })
  status!: MailStatus;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string | null;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'text', nullable: true })
  metadata?: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'sent_at' })
  sentAt?: Date | null;

  @ManyToOne(() => Client, (client) => client.queueMails, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: Client | null;
}
