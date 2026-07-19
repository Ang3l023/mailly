import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Client } from './client.entity';
import { SentMail } from './sent-mail.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'logs' })
export class Log extends BaseEntity {
  @ManyToOne(() => Client, (client) => client.logs, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @ManyToOne(() => SentMail, (sentMail) => sentMail.logs, { nullable: false })
  @JoinColumn({ name: 'sent_mail_id' })
  sentMail!: SentMail;

  @Column({ nullable: false })
  event!: string;

  @Column({ nullable: true, default: null })
  body!: string;

  @Column({ nullable: true, default: null, name: 'attached_file' })
  attachedFile?: string;
}
