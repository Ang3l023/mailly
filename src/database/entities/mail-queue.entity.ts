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
  @Column({ length: 255, default: null })
  from?: string;

  @Column({ length: 255 })
  to!: string;

  @Column({ length: 255, default: null, type: String })
  cc?: string | null;

  @Column({ length: 255, default: null, type: String })
  bcc?: string | null;

  @Column({ length: 255 })
  subject!: string;

  @Column({ type: 'longtext', default: null })
  html?: string;

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

  @Column({ type: 'text', default: null, name: 'error_message' })
  errorMessage?: string | null;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'text', default: null })
  metadata?: string;

  @Column({ type: 'timestamp', default: null, name: 'sent_at' })
  sentAt?: Date;

  @ManyToOne(() => Client, (client) => client.queueMails, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: Client;

  @Column({
    type: 'simple-array',
    name: 'attached_files',
    default: null,
  })
  attachedFiles?: string[] | null;
}
