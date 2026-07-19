import { Column, Entity, OneToMany } from 'typeorm';
import { Log } from './log.entity';
import { SentMail } from './sent-mail.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'clients' })
export class Client extends BaseEntity {
  @Column({ unique: true, nullable: false, name: 'api_key' })
  apiKey!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true, default: null, name: 'sender_default' })
  senderDefault?: string;

  @Column({ nullable: false, default: true })
  enabled!: boolean;

  @OneToMany(() => SentMail, (sentMail) => sentMail.client)
  sentMails!: SentMail[];

  @OneToMany(() => Log, (log) => log.client)
  logs?: Log[];
}
