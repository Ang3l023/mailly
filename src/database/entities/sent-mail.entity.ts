import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Client } from './client.entity';
import { EStatusSentMail } from '../../common/enums/sent-mail/status.enum';
import { Log } from './log.entity';
import { BaseEntity } from './base.entity';
import { Template } from './template.entity';

@Entity('sent_mails')
export class SentMail extends BaseEntity {
  @Column({ unique: true, generated: 'uuid' })
  code!: string;

  @ManyToOne(() => Client, (client) => client.sentMails)
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ nullable: false })
  from!: string;

  @Column({ nullable: false })
  to!: string;

  @Column({ nullable: true, default: true, type: String })
  cc?: string | null;

  @Column({ nullable: true, default: true, type: String })
  bcc?: string | null;

  @Column({ nullable: false })
  subject!: string;

  @Column({ type: 'longtext', default: null })
  html?: string | null;

  @ManyToOne(() => Template, (template) => template.queueMails)
  @JoinColumn({ name: 'template_id' })
  template?: Template | null;

  @Column({ default: null, name: 'attached_file', nullable: true })
  attachedFile?: string;

  @Column({
    enum: EStatusSentMail,
    type: 'enum',
    default: EStatusSentMail.PENDING,
  })
  status!: EStatusSentMail;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string | null;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'text', nullable: true })
  metadata?: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'sent_at' })
  sentAt?: Date | null;

  @OneToMany(() => Log, (log) => log.sentMail)
  logs!: Log[];
}
