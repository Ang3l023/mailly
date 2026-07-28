import { Column, Entity, OneToMany } from 'typeorm';
import { Log } from './log.entity';
import { SentMail } from './sent-mail.entity';
import { BaseEntity } from './base.entity';
import { Exclude } from 'class-transformer';
import { Template } from './template.entity';
import { MailQueue } from './mail-queue.entity';

@Entity({ name: 'clients' })
export class Client extends BaseEntity {
  @Column({ unique: true, nullable: false, name: 'api_key' })
  @Exclude()
  apiKey!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true, default: null, name: 'sender_default' })
  @Exclude()
  senderDefault?: string;

  @Column({ nullable: false, default: true })
  @Exclude()
  enabled!: boolean;

  @OneToMany(() => SentMail, (sentMail) => sentMail.client)
  sentMails!: SentMail[];

  @OneToMany(() => MailQueue, (queue) => queue.client)
  queueMails!: MailQueue[];

  @OneToMany(() => Log, (log) => log.client)
  logs?: Log[];

  @OneToMany(() => Template, (template) => template.client)
  templates?: Template[];
}
