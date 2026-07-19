import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Client } from './client.entity';
import { EStatusSentMail } from '../../common/enums/sent-mail/status.enum';
import { Log } from './log.entity';
import { BaseEntity } from './base.entity';

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

  @Column({ nullable: false })
  subject!: string;

  @Column({ nullable: false })
  body!: string;

  @Column({ default: null, name: 'attached_file' })
  attachedFile?: string;

  @Column({
    enum: EStatusSentMail,
    type: 'enum',
    default: EStatusSentMail.PENDING,
  })
  status!: EStatusSentMail;

  @Column({ default: null, name: 'message_error' })
  messageError?: string;

  @OneToMany(() => Log, (log) => log.sentMail)
  logs!: Log[];
}
